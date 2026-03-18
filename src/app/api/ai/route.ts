import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  provider: z.enum(["openai", "groq", "gemini"]).default("openai"),
  apiKey: z.string().min(1),
  model: z.string().min(1).default("gpt-4o-mini"),
  mode: z.enum(["notes", "questions", "solution"]),
  subject: z.string().min(1),
  topic: z.string().min(1),
  previousQuestions: z.array(z.string()).optional(),
  question: z.string().optional(),
  userAnswer: z.string().optional(),
});

const NumericAnswer = z.union([
  z.number(),
  z
    .string()
    // allow decimals + scientific notation (common in GATE)
    .regex(/^-?\d+(\.\d+)?([eE]-?\d+)?$/),
]);

const QuestionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("mcq"),
    question: z.string().min(10),
    options: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
    answer: z.enum(["A", "B", "C", "D"]),
    solution: z.string().min(20),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("numerical"),
    question: z.string().min(10),
    answer: NumericAnswer,
    solution: z.string().min(20),
  }),
]);

const QuestionsArraySchema = z.object({
  questions: z.array(QuestionSchema).min(1),
});

type AugmentedError = Error & { status?: number; code?: unknown };

function extractJsonObject(s: string) {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return s;
}

function coerceQuestionsPayload(input: unknown) {
  const inputObj = typeof input === "object" && input ? (input as Record<string, unknown>) : {};
  const rawQuestions = inputObj?.questions;
  const questions = Array.isArray(rawQuestions) ? rawQuestions : [];

  const coerced = questions.map((q: unknown) => {
    if (!q || typeof q !== "object") return q;
    const qRec = q as Record<string, unknown>;
    if (qRec.type !== "numerical") return q;

    const a = qRec.answer;
    if (typeof a === "number") return { ...qRec, answer: String(a) } as unknown;
    if (typeof a === "string") {
      // Extract first numeric token if model added extra text/units.
      const m = a.match(/-?\d+(\.\d+)?([eE]-?\d+)?/);
      if (m?.[0]) return { ...qRec, answer: m[0] } as unknown;
    }
    return q;
  });

  return { ...inputObj, questions: coerced } as unknown;
}

async function callOpenAICompatible(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  json?: boolean;
}) {
  const res = await fetch(`${opts.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: opts.json ? 0.1 : 0.2,
      response_format: opts.json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Try to extract a useful error code/message for the UI.
    try {
      const parsed = JSON.parse(text) as unknown;
      const errObj =
        typeof parsed === "object" && parsed
          ? (parsed as Record<string, unknown>)
          : ({} as Record<string, unknown>);
      const errorObj = (errObj.error && typeof errObj.error === "object" && errObj.error
        ? (errObj.error as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      const code = errorObj.code ?? errorObj.type ?? null;
      const message = (typeof errorObj.message === "string" ? errorObj.message : null) ?? text;

      const err = new Error(String(message || "AI request failed")) as AugmentedError;
      err.status = res.status;
      err.code = code;
      throw err;
    } catch {
      const err = new Error(`AI request failed (${res.status}): ${text}`) as AugmentedError;
      err.status = res.status;
      throw err;
    }
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Empty AI response");
  return content.trim();
}

async function callGemini(opts: { apiKey: string; model: string; system: string; user: string }) {
  const model = opts.model.includes("/") ? opts.model.split("/").pop() : opts.model;
  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
    model || "gemini-1.5-flash",
  )}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      generationConfig: { temperature: 0.2, maxOutputTokens: 1800 },
      contents: [
        {
          role: "user",
          parts: [{ text: `${opts.system}\n\n${opts.user}` }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(text) as unknown;
      const errObj =
        typeof parsed === "object" && parsed
          ? (parsed as Record<string, unknown>)
          : ({} as Record<string, unknown>);
      const errorObj = (errObj.error && typeof errObj.error === "object" && errObj.error
        ? (errObj.error as Record<string, unknown>)
        : {}) as Record<string, unknown>;

      const code = errorObj.status ?? errorObj.code ?? null;
      const message = (typeof errorObj.message === "string" ? errorObj.message : null) ?? text;

      const err = new Error(String(message || "AI request failed")) as AugmentedError;
      err.status = res.status;
      err.code = code;
      throw err;
    } catch {
      const err = new Error(`AI request failed (${res.status}): ${text}`) as AugmentedError;
      err.status = res.status;
      throw err;
    }
  }

  const json: unknown = await res.json();
  const jsonRec = typeof json === "object" && json ? (json as Record<string, unknown>) : {};
  const candidates = jsonRec?.candidates as unknown;
  const firstCand =
    Array.isArray(candidates) && candidates.length > 0 ? candidates[0] : null;
  const candRec = firstCand && typeof firstCand === "object" ? (firstCand as Record<string, unknown>) : {};
  const content = candRec?.content as unknown;
  const contentRec = content && typeof content === "object" ? (content as Record<string, unknown>) : {};
  const parts = contentRec?.parts as unknown;
  const textParts = Array.isArray(parts)
    ? parts
        .map((p: unknown) => {
          if (!p || typeof p !== "object") return "";
          const rec = p as Record<string, unknown>;
          return typeof rec.text === "string" ? rec.text : "";
        })
        .join("")
    : "";
  const text = String(textParts ?? "").trim();
  if (!text) throw new Error("Empty AI response");
  return text;
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const body = BodySchema.parse(raw);

    const resolveApiKey = () => {
      // Prefer server-side keys if configured (recommended for production).
      // If not set, we fall back to the client-provided key to avoid breaking existing flow.
      if (body.provider === "openai") {
        return (
          process.env.GATE_OPENAI_API_KEY ??
          process.env.OPENAI_API_KEY ??
          body.apiKey
        );
      }
      if (body.provider === "groq") {
        return process.env.GATE_GROQ_API_KEY ?? process.env.GROQ_API_KEY ?? body.apiKey;
      }
      return (
        process.env.GATE_GEMINI_API_KEY ??
        process.env.GEMINI_API_KEY ??
        body.apiKey
      );
    };

    const apiKey = resolveApiKey();

    const system =
      "You are a precise GATE EC tutor. Be strict about topic boundaries. Do not mix topics. Do not repeat. Be concise and correct. Prefer correctness over creativity.";
    const run = async (args: { apiKey: string; model: string; system: string; user: string }) => {
      if (body.provider === "gemini") return await callGemini(args);
      const baseUrl = body.provider === "groq" ? "https://api.groq.com/openai" : "https://api.openai.com";
      const json = body.mode === "questions";
      return await callOpenAICompatible({ baseUrl, json, ...args });
    };

    if (body.mode === "notes") {
      const user = [
        `Subject: ${body.subject}`,
        `Topic: ${body.topic}`,
        "",
        "Write revision notes in EXACTLY this plain-text format (NO markdown like **, #, ##, ```):",
        "",
        "CONCEPT EXPLANATION:",
        "- short, clear explanation, 3–6 lines.",
        "",
        "KEY FORMULAS:",
        "- each formula on its own line, using LaTeX ($...$ or $$...$$).",
        "",
        "IMPORTANT POINTS:",
        "- 3–7 short bullet points.",
        "",
        "Rules:",
        "- Must be unique for this topic.",
        "- Must be strictly about this topic only (no other topics).",
        "- Avoid generic filler. Prefer correctness over length.",
        "- Do NOT use markdown headings or bold. Only plain text and LaTeX.",
      ].join("\n");

      const text = await run({ apiKey, model: body.model, system, user });
      return NextResponse.json({ text });
    }

    if (body.mode === "questions") {
      const clientPrev = (body.previousQuestions ?? []).slice(-80);

      const target = 30;
      const collected: unknown[] = [];
      const collectedQuestionStrings = new Set<string>();

      const baseSchemaHint = [
        "Your ENTIRE reply must be STRICT JSON, nothing before or after it.",
        "Output JSON exactly as:",
        "{",
        '  "questions": [',
        "    {",
        '      "id": "q1",',
        '      "type": "mcq" | "numerical",',
        '      "question": "string",',
        '      "options": ["A", "B", "C", "D"] (only for mcq),',
        '      "answer": "A" | "B" | "C" | "D" (for mcq) OR "number" (for numerical),',
        '      "solution": "step-by-step explanation"',
        "    }",
        "  ]",
        "}",
      ].join("\n");

      const generateOneBatch = async (count: number, alreadyGenerated: string[]) => {
        const prevAll = [...clientPrev, ...alreadyGenerated].slice(-120).join("\n- ");
        const user = [
          `Subject: ${body.subject}`,
          `Topic: ${body.topic}`,
          "",
          `Generate EXACTLY ${count} GATE EC level questions ONLY from this topic.`,
          "Do not include other topics.",
          "Difficulty: true GATE level (not school-level). Use standard GATE-style wording.",
          "Mix question types (any mix is fine), but include both Numerical and Conceptual MCQs across the full set.",
          "Each question must be solvable from the topic alone and have ONE correct answer.",
          "Avoid vague theory-only questions. Prefer computation/derivation/checks typical of GATE.",
          "",
          "Anti-repetition constraints:",
          "- Do NOT repeat any of these earlier questions (even reworded):",
          prevAll ? `- ${prevAll}` : "- (none)",
          "",
          baseSchemaHint,
          "",
          "Rules:",
          "- Keep MCQ options non-ambiguous.",
          "- Numerical answer must be a single number (no units).",
          "- Do NOT include trailing commas anywhere in the JSON.",
          "- Do NOT wrap JSON in ```json ... ```.",
          "- Solutions must be step-by-step and end with 'Final answer: <...>'.",
          "- Do a quick self-check in the solution to reduce mistakes.",
        ].join("\n");

        return await run({
          apiKey,
          model: body.model,
          system,
          user,
        });
      };

      let rounds = 0;
      while (collected.length < target && rounds < 6) {
        const missing = target - collected.length;
        const count = Math.min(missing, 15); // generate in smaller chunks for better reliability
        const alreadyGenerated = collected.map((q) =>
          typeof q === "object" && q && "question" in q ? String((q as Record<string, unknown>).question ?? "") : "",
        );
        const text = await generateOneBatch(count, alreadyGenerated);

        try {
          const parsed = JSON.parse(extractJsonObject(text));
          const coerced = coerceQuestionsPayload(parsed);
          const validated = QuestionsArraySchema.parse(coerced);
          for (const q of validated.questions) {
            const qs = String(q.question ?? "").trim();
            if (!qs || collectedQuestionStrings.has(qs)) continue;
            collectedQuestionStrings.add(qs);
            collected.push(q);
          }
        } catch {
          // If parsing/validation fails, just retry in next round with same missing count.
        }

        rounds++;
      }

      if (collected.length !== target) {
        return NextResponse.json(
          { error: `Could not generate a full 30-question set. Got ${collected.length}. Try again.` },
          { status: 400 },
        );
      }

      const payload = { questions: collected.slice(0, target) };
      return NextResponse.json({ text: JSON.stringify(payload) });
    }

    const user = [
      `Subject: ${body.subject}`,
      `Topic: ${body.topic}`,
      "",
      "Provide a step-by-step solution ONLY for this question, strictly within this topic:",
      body.question ?? "",
      "",
      body.userAnswer ? `User answer: ${body.userAnswer}` : "",
    ].join("\n");
    const text = await run({ apiKey, model: body.model, system, user });
    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status =
      typeof (e as { status?: unknown })?.status === "number" &&
      Number.isFinite((e as { status?: unknown }).status) ?
        (e as { status?: unknown }).status as number
        : 400;
    const code = (e as { code?: unknown })?.code ?? null;
    return NextResponse.json({ error: msg, code }, { status });
  }
}

