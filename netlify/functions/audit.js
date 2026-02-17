// netlify/functions/audit.js — Bayyina.ai GEO Audit Engine
// Robust error handling, JSON repair, retry logic, input sanitization

const SYSTEM_PROMPT = `You are Bayyina.ai's GEO audit engine. You MUST respond ONLY with a single valid JSON object. No markdown fences, no backticks, no explanation text before or after the JSON. Begin your response with { and end with }.

Keep all string values concise (1-2 sentences max). Be realistic — most Arabic brands score 10-45.

Required JSON structure:
{"overall_score":<0-100>,"brand_recognition_score":<0-100>,"arabic_content_score":<0-100>,"citation_reach_score":<0-100>,"content_depth_score":<0-100>,"sentiment_index":<0-100>,"platforms":{"chatgpt":{"visibility_score":<n>,"is_mentioned":<bool>,"arabic_quality":"<good|partial|none>","sentiment":"<positive|neutral|negative>","summary":"<1 sentence>"},"gemini":{...same},"perplexity":{...same},"copilot":{...same},"claude":{...same}},"key_findings":["finding1","finding2","finding3"],"recommendations":[{"title":"<short>","description":"<1-2 sentences>","priority":"<high|medium|low>","category":"<short>","estimated_impact":"<high|medium|low>","estimated_effort":"<low|medium|high>","timeline":"<short>","action_items":["item1","item2"],"kpis":["kpi1"],"tools_needed":["tool1"]}],"competitor_insight":"<1-2 sentences>","arabic_gap_analysis":"<1-2 sentences>","roadmap_summary":{"phase_1":"<1 sentence>","phase_2":"<1 sentence>","phase_3":"<1 sentence>"}}

Generate 6-8 recommendations. Max 4 action_items, 2 kpis, 2 tools per rec. All text in English. Remember: output ONLY the JSON object, nothing else.`;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// Sanitize input: trim, limit length, remove control chars
function sanitize(str, maxLen = 500) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim().slice(0, maxLen);
}

// Extract JSON from a string that may contain markdown fences, preamble, or trailing text
function extractJSON(raw) {
  if (!raw || typeof raw !== "string") return null;

  // Strip markdown code fences
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Try direct parse first
  try { const r = JSON.parse(s); if (r && r.overall_score !== undefined) return r; } catch {}

  // Try to find the JSON object boundaries
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = s.slice(firstBrace, lastBrace + 1);
    try { const r = JSON.parse(candidate); if (r && r.overall_score !== undefined) return r; } catch {}
  }

  // Repair: try closing open brackets/strings
  if (firstBrace !== -1) {
    let sub = s.slice(firstBrace);
    sub = sub.replace(/,\s*$/, "");
    const closers = [];
    let inStr = false, esc = false;
    for (let i = 0; i < sub.length; i++) {
      const c = sub[i];
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === "{") closers.push("}");
      else if (c === "[") closers.push("]");
      else if (c === "}" || c === "]") closers.pop();
    }
    if (inStr) sub += '"';
    const suffix = closers.reverse().join("");
    for (const attempt of [sub + suffix, sub.replace(/,([^,]*)$/, "$1") + suffix]) {
      try { const r = JSON.parse(attempt); if (r && r.overall_score !== undefined) return r; } catch {}
    }
  }

  return null;
}

// Call Anthropic API with timeout
async function callAnthropic(apiKey, userMessage, timeoutMs = 50000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || "API returned " + response.status;
      console.error("Anthropic API error:", response.status, msg);
      return { error: msg, status: response.status };
    }

    const data = await response.json();
    const rawText = data?.content?.[0]?.text;
    if (!rawText) {
      console.error("Empty response from Anthropic:", JSON.stringify(data).slice(0, 200));
      return { error: "AI returned an empty response" };
    }

    return { text: rawText };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      console.error("Anthropic API timed out after", timeoutMs, "ms");
      return { error: "AI request timed out. Please try again." };
    }
    console.error("Anthropic fetch error:", err.message);
    return { error: "Connection error: " + err.message };
  }
}

export const handler = async (event) => {
  // Always return JSON, never HTML
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not configured. Please contact support." }) };
  }

  // Parse and validate input
  let input;
  try {
    input = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request format" }) };
  }

  const brandName = sanitize(input.brandName, 200);
  const brandNameAr = sanitize(input.brandNameAr, 200);
  const industry = sanitize(input.industry, 100);
  const country = sanitize(input.country, 100) || "Qatar";
  const website = sanitize(input.website, 300);
  const queries = sanitize(input.queries, 1000);

  if (!brandName || !industry) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Brand name and industry are required" }) };
  }

  const userMessage = "Brand: " + brandName + (brandNameAr ? " (" + brandNameAr + ")" : "") + " | Industry: " + industry + " | Market: " + country + " | Website: " + (website || "N/A") + " | Target Queries: " + (queries || "general industry queries");

  console.log("Audit request:", brandName, industry, country);

  // Try up to 2 attempts
  var lastError = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log("Attempt " + attempt + "/2");

    const result = await callAnthropic(API_KEY, userMessage);

    if (result.error) {
      lastError = result.error;
      console.error("Attempt " + attempt + " API error:", lastError);
      if (result.status === 401 || result.status === 403 || result.status === 400) {
        return { statusCode: result.status, headers, body: JSON.stringify({ error: lastError }) };
      }
      continue;
    }

    // Try to extract valid JSON from response
    const parsed = extractJSON(result.text);

    if (parsed) {
      console.log("Audit success:", brandName, "score:", parsed.overall_score);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          content: [{ type: "text", text: JSON.stringify(parsed) }],
        }),
      };
    }

    lastError = "AI response could not be parsed into a valid report";
    console.error("Attempt " + attempt + " JSON extraction failed. Raw start:", result.text?.slice(0, 300));
  }

  // All attempts failed
  console.error("All attempts failed for:", brandName, industry, lastError);
  return {
    statusCode: 502,
    headers,
    body: JSON.stringify({
      error: "The AI was unable to generate a valid report. This can happen with certain brand/industry combinations. Please try again or simplify your custom queries.",
      retryable: true,
    }),
  };
};
