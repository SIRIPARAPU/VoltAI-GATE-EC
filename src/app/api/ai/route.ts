import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  provider: z.enum(["openai", "groq", "gemini"]).default("openai"),
  apiKey: z.string().min(1),
  model: z.string().min(1).default("gpt-4o-mini"),
  mode: z.enum(["notes", "questions", "solution", "chat"]),
  subject: z.string().optional(),
  topic: z.string().optional(),
  previousQuestions: z.array(z.string()).optional(),
  question: z.string().optional(),
  userAnswer: z.string().optional(),
  chatHistory: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
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
    diagram: z.string().optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("numerical"),
    question: z.string().min(10),
    answer: NumericAnswer,
    solution: z.string().min(20),
    diagram: z.string().optional(),
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
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
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
      messages: opts.messages,
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

async function callGemini(opts: { apiKey: string; model: string; messages: Array<{ role: "system" | "user" | "assistant"; content: string }> }) {
  const model = opts.model.includes("/") ? opts.model.split("/").pop() : opts.model;
  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
    model || "gemini-1.5-flash",
  )}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  // Convert generic messages to Gemini format
  const systemMsg = opts.messages.find(m => m.role === "system")?.content || "";
  
  const contents = opts.messages.filter(m => m.role !== "system").map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  
  // If first message isn't user (e.g., if we only had system), Gemini requires user first.
  if (contents.length === 0 || contents[0].role !== "user") {
    contents.unshift({ role: "user", parts: [{ text: systemMsg || "Hello" }] });
  } else if (systemMsg) {
    // Inject system msg into first user message
    contents[0].parts[0].text = `[System Instructions:\n${systemMsg}]\n\n` + contents[0].parts[0].text;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      generationConfig: { temperature: 0.2, maxOutputTokens: 1800 },
      contents,
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

    const systemBase =
      "You are a precise GATE EC tutor. Be strict about topic boundaries. Do not mix topics. Do not repeat. Be concise and correct. Prefer correctness over creativity. ALWAYS use bullet points and short explanations. NEVER write long paragraphs. Keep answers exam-focused and structured.";
    
    const run = async (args: { apiKey: string; model: string; messages: Array<{role: "system"|"user"|"assistant", content: string}> }) => {
      if (body.provider === "gemini") return await callGemini(args);
      const baseUrl = body.provider === "groq" ? "https://api.groq.com/openai" : "https://api.openai.com";
      const json = body.mode === "questions";
      return await callOpenAICompatible({ baseUrl, json, ...args });
    };

    if (body.mode === "chat") {
      const history = body.chatHistory ?? [];
      const messages: Array<{role: "system"|"user"|"assistant", content: string}> = [
        { role: "system", content: "You are a world-class GATE EC Personal Mentor. You NEVER give vague or generic advice. You understand the GATE syllabus deeply. You use step-by-step logic, embed LaTeX formulas using $...$ or $$...$$, and strictly stay within the subject/topic context provided. If asked a generic question outside GATE EC, politely refuse. ALWAYS use bullet points and short explanations. NEVER write long paragraphs. Keep answers exam-focused, concise, and structured." }
      ];
      
      const contextPrefix = `[User Context]\nSubject: ${body.subject || "General"}\nTopic: ${body.topic || "General"}\nUser question follows:\n\n`;
      
      // Transform history
      for (let i = 0; i < history.length; i++) {
        const isLastMsg = i === history.length - 1;
        const msg = history[i];
        if (msg.role === "user" && isLastMsg) {
          messages.push({ role: "user", content: contextPrefix + msg.content });
        } else {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      const text = await run({ apiKey, model: body.model, messages });
      return NextResponse.json({ text });
    }

    if (body.mode === "notes") {
      const user = [
        `Subject: ${body.subject}`,
        `Topic: ${body.topic}`,
        "",
        "Write revision notes in EXACTLY this Markdown format. Do NOT write long paragraphs.",
        "",
        "## [Subtopic Name]",
        "**Concept:** [Short, clear crisp explanation, 2-4 lines max.]",
        "",
        "**Formula:**",
        "- [each formula on its own line, using LaTeX $...$ or $$...$$]",
        "",
        "**Key Points:**",
        "- [3-5 short bullet points]",
        "",
        "Rules:",
        "- Repeat this structure for each important subtopic.",
        "- Must be unique for this topic.",
        "- Must be strictly about this topic only.",
        "- Avoid generic filler. Prefer correctness over length.",
        "- STRICTLY use the structured format: Heading -> Concept -> Formula -> Key Points.",
      ].join("\n");

      const text = await run({ apiKey, model: body.model, messages: [{ role: "system", content: systemBase }, { role: "user", content: user }] });
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
          "If a question involves a circuit, block diagram, or signal plot, include a 'diagram' field with a SHORT ASCII text description (e.g., 'R1(10k) -- C1(1uF) in series, input Vi across both, output Vo across C1').",
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
          "- Solutions must follow this format: Step 1: ... Step 2: ... Final Answer: <answer>",
          "- Do a quick self-check in the solution to reduce mistakes.",
        ].join("\n");

        return await run({
          apiKey,
          model: body.model,
          messages: [
            { role: "system", content: systemBase },
            { role: "user", content: user }
          ],
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
      "Provide a STEP-BY-STEP solution in this exact format:",
      "Step 1: <description>",
      "Step 2: <description>",
      "...",
      "Final Answer: <answer>",
      "",
      "Rules:",
      "- Each step must be short and clear",
      "- No unnecessary theory",
      "- Include relevant formulas using LaTeX ($...$)",
      "- End with 'Final Answer: <value>'",
      "",
      "Question:",
      body.question ?? "",
      "",
      body.userAnswer ? `User answer: ${body.userAnswer}` : "",
    ].join("\n");
    const text = await run({ 
      apiKey, 
      model: body.model, 
      messages: [
        { role: "system", content: systemBase },
        { role: "user", content: user }
      ]
    });
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

