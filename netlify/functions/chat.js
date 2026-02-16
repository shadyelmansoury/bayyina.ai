const SYSTEM_PROMPT = `You are the Bayyina.ai assistant. Answer questions about GEO (Generative Engine Optimization), Arabic AI visibility, and pricing. Be concise (2-3 sentences). Reply in the user's language.

Pricing:
- Starter: $500/mo — Basic audit across 3 AI platforms, monthly visibility report, up to 50 tracked prompts.
- Growth: $2,500/mo — Full platform coverage, weekly reports, optimization recommendations, 200 prompts, dedicated analyst.
- Enterprise: Custom — White-glove service, unlimited prompts, content strategy, government & large enterprise packages.

The free audit on the website is a one-time trial only.

Bayyina.ai is the GCC's first Arabic-first Generative Engine Optimization platform. We audit brand visibility across ChatGPT, Gemini, Perplexity, Copilot & Claude.`;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not configured" }) };
  }
  try {
    const { message } = JSON.parse(event.body);
    if (!message || typeof message !== "string") {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "message is required" }) };
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, system: SYSTEM_PROMPT, messages: [{ role: "user", content: message }] }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { statusCode: response.status, headers, body: JSON.stringify({ error: errData?.error?.message || `API error: ${response.status}` }) };
    }
    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
