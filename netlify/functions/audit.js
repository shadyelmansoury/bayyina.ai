const SYSTEM_PROMPT = `You are Bayyina.ai's GEO audit engine. Respond ONLY with valid JSON. No markdown. Keep strings concise (1-2 sentences). Be realistic — most Arabic brands score 10-45.

Required JSON:
{"overall_score":<0-100>,"brand_recognition_score":<0-100>,"arabic_content_score":<0-100>,"citation_reach_score":<0-100>,"content_depth_score":<0-100>,"sentiment_index":<0-100>,"platforms":{"chatgpt":{"visibility_score":<n>,"is_mentioned":<bool>,"arabic_quality":"<good|partial|none>","sentiment":"<positive|neutral|negative>","summary":"<1 sentence>"},"gemini":{...},"perplexity":{...},"copilot":{...},"claude":{...}},"key_findings":["..."],"recommendations":[{"title":"...","description":"...","priority":"<high|medium|low>","category":"...","estimated_impact":"<high|medium|low>","estimated_effort":"<low|medium|high>","timeline":"...","action_items":["..."],"kpis":["..."],"tools_needed":["..."]}],"competitor_insight":"...","arabic_gap_analysis":"...","roadmap_summary":{"phase_1":"...","phase_2":"...","phase_3":"..."}}

Generate 6-8 recommendations. Max 4 action_items, 2 kpis, 2 tools per rec. All text in English.`;

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
    const { brandName, brandNameAr, industry, country, website, queries } = JSON.parse(event.body);
    if (!brandName || !industry) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "brandName and industry are required" }) };
    }
    const userMessage = `Brand: ${brandName} (${brandNameAr || "N/A"}) | Industry: ${industry} | Market: ${country || "Qatar"} | Website: ${website || "N/A"} | Queries: ${queries || "N/A"}`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 16000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: userMessage }] }),
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
