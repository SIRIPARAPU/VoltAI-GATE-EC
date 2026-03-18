export function toFriendlyAiError(input: unknown): string {
  const msg = String(input ?? "");

  // OpenAI common errors we want to explain clearly to non-developers.
  if (msg.includes("insufficient_quota") || msg.toLowerCase().includes("exceeded your current quota")) {
    return [
      "Your API key is valid, but your OpenAI account has no available quota/credits.",
      "Fix: enable billing or add credits in your OpenAI account, then try again.",
    ].join(" ");
  }

  // Common "paid required" cases across providers.
  if (msg.toLowerCase().includes("billing") && msg.toLowerCase().includes("required")) {
    return "Billing is required for this provider/account. Try Groq or Google Gemini free tier instead.";
  }

  if (msg.toLowerCase().includes("invalid api key")) {
    return "That API key looks invalid. Re-copy it from your provider and paste again in Settings.";
  }

  if (msg.toLowerCase().includes("rate limit")) {
    return "Too many requests too quickly. Wait ~30 seconds and try again.";
  }

  return msg || "AI request failed. Please try again.";
}

