"use client";

import katex from "katex";

function renderLatex(latex: string, displayMode: boolean) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "html",
    });
  } catch {
    return latex;
  }
}

// Minimal, reliable KaTeX rendering:
// - Block math: $$...$$
// - Inline math: $...$
export function MathText({ text }: { text: string }) {
  const parts: Array<
    | { type: "text"; value: string }
    | { type: "math"; value: string; display: boolean }
  > = [];

  const blockSplit = text.split("$$");
  for (let i = 0; i < blockSplit.length; i++) {
    const chunk = blockSplit[i] ?? "";
    const isBlock = i % 2 === 1;
    if (isBlock) {
      parts.push({ type: "math", value: chunk.trim(), display: true });
      continue;
    }

    const inline = chunk.split("$");
    for (let j = 0; j < inline.length; j++) {
      const c = inline[j] ?? "";
      const isMath = j % 2 === 1;
      if (isMath) parts.push({ type: "math", value: c.trim(), display: false });
      else if (c) parts.push({ type: "text", value: c });
    }
  }

  return (
    <div className="space-y-2 whitespace-pre-wrap text-sm leading-6">
      {parts.map((p, idx) => {
        if (p.type === "text") return <span key={idx}>{p.value}</span>;
        const html = renderLatex(p.value, p.display);
        return (
          <span
            key={idx}
            className={p.display ? "my-2 block" : "inline"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

