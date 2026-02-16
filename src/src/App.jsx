import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───
const PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT", icon: "⬡", color: "#10a37f" },
  { id: "gemini", name: "Gemini", icon: "◆", color: "#4285f4" },
  { id: "perplexity", name: "Perplexity", icon: "⊕", color: "#20b2aa" },
  { id: "copilot", name: "Copilot", icon: "⬢", color: "#7b61ff" },
  { id: "claude", name: "Claude", icon: "◯", color: "#d4a574" },
];

const INDUSTRIES = [
  { value: "government", label: "Government & Public Sector", labelAr: "حكومي وقطاع عام" },
  { value: "finance", label: "Finance & Banking", labelAr: "مالي ومصرفي" },
  { value: "realestate", label: "Real Estate", labelAr: "عقارات" },
  { value: "ecommerce", label: "E-Commerce & Retail", labelAr: "تجارة إلكترونية" },
  { value: "media", label: "Media & Publishing", labelAr: "إعلام ونشر" },
  { value: "consulting", label: "Consulting & Professional Services", labelAr: "استشارات وخدمات مهنية" },
  { value: "healthcare", label: "Healthcare", labelAr: "رعاية صحية" },
  { value: "education", label: "Education", labelAr: "تعليم" },
  { value: "energy", label: "Energy & Utilities", labelAr: "طاقة ومرافق" },
  { value: "technology", label: "Technology", labelAr: "تكنولوجيا" },
  { value: "hospitality", label: "Hospitality & Tourism", labelAr: "ضيافة وسياحة" },
  { value: "other", label: "Other", labelAr: "أخرى" },
];

const PERSONAL_DOMAINS = ["gmail.com","yahoo.com","yahoo.co.uk","hotmail.com","hotmail.co.uk","outlook.com","outlook.sa","live.com","aol.com","icloud.com","me.com","mail.com","protonmail.com","proton.me","zoho.com","yandex.com","gmx.com","gmx.net","tutanota.com","fastmail.com","inbox.com","mail.ru","msn.com","qq.com","163.com","126.com","rediffmail.com","rocketmail.com","hey.com"];

const QUERY_EXAMPLES = {
  government: ["Best government digital services in Qatar", "أفضل الخدمات الحكومية الرقمية في قطر", "Top e-government platforms Middle East"],
  finance: ["Best banks in Qatar for business accounts", "أفضل البنوك في قطر", "Top Islamic finance institutions GCC"],
  realestate: ["Best real estate companies in Qatar", "أفضل شركات العقارات في قطر", "Top property developers Lusail"],
  ecommerce: ["Best online shopping in Qatar", "أفضل متاجر إلكترونية في قطر", "Top e-commerce platforms GCC"],
  healthcare: ["Best hospitals in Qatar", "أفضل مستشفى خاص في قطر", "Top healthcare providers Doha"],
  education: ["Best universities in Qatar", "أفضل الجامعات في قطر", "Top international schools Doha"],
  technology: ["Best tech companies in Qatar", "أفضل شركات التكنولوجيا في قطر", "Top AI companies Middle East"],
  hospitality: ["Best hotels in Doha Qatar", "أفضل الفنادق في الدوحة", "Top luxury resorts Qatar"],
  media: ["Top media companies Qatar", "أفضل الشركات الإعلامية في قطر", "Best Arabic news platforms"],
  consulting: ["Best consulting firms in Qatar", "أفضل شركات الاستشارات في قطر", "Top management consultancies GCC"],
  energy: ["Top energy companies Qatar", "أفضل شركات الطاقة في قطر", "Leading utilities companies GCC"],
  other: ["Best companies in Qatar", "أفضل الشركات في قطر", "Top brands in the Middle East"],
};

// ─── KPI BENCHMARKS ───
const BENCHMARKS = {
  en: {
    overall: { excellent: "70+", good: "40–69", poor: "Below 40", avg: "~25 for GCC Arabic brands", note: "Most Arabic-first brands score 15–35 due to limited AI training data in Arabic." },
    recognition: { excellent: "75+", good: "45–74", poor: "Below 45", avg: "~30 for regional brands", note: "Global brands average 60+. Regional brands often fall below 40 unless actively optimized." },
    arabic: { excellent: "60+", good: "30–59", poor: "Below 30", avg: "~18 for GCC brands", note: "Arabic content makes up <1% of the web. Most brands score very low here without dedicated Arabic SEO." },
    citationReach: { excellent: "70+", good: "40–69", poor: "Below 40", avg: "~22 across 5 platforms", note: "Measures how many platforms cite your brand. A score of 20 means ~1 out of 5 platforms mention you." },
    contentDepth: { excellent: "65+", good: "35–64", poor: "Below 35", avg: "~20 for GCC brands", note: "High scores require structured data, Wikipedia presence, and authoritative third-party citations." },
    sentimentIdx: { excellent: "70+", good: "50–69", poor: "Below 50", avg: "~55 (slightly positive)", note: "50 is neutral. Most known brands score 50–65. Below 50 indicates negative sentiment." },
  },
  ar: {
    overall: { excellent: "+٧٠", good: "٤٠–٦٩", poor: "أقل من ٤٠", avg: "~٢٥ للعلامات الخليجية", note: "معظم العلامات العربية تسجل ١٥–٣٥ بسبب محدودية البيانات العربية في نماذج AI." },
    recognition: { excellent: "+٧٥", good: "٤٥–٧٤", poor: "أقل من ٤٥", avg: "~٣٠ للعلامات الإقليمية", note: "العلامات العالمية تسجل +٦٠. العلامات الإقليمية غالباً أقل من ٤٠." },
    arabic: { excellent: "+٦٠", good: "٣٠–٥٩", poor: "أقل من ٣٠", avg: "~١٨ للعلامات الخليجية", note: "المحتوى العربي يشكل أقل من ١٪ من الإنترنت. معظم العلامات تسجل نتائج منخفضة جداً." },
    citationReach: { excellent: "+٧٠", good: "٤٠–٦٩", poor: "أقل من ٤٠", avg: "~٢٢ عبر ٥ منصات", note: "يقيس عدد المنصات التي تستشهد بعلامتك. درجة ٢٠ تعني ~١ من ٥ منصات." },
    contentDepth: { excellent: "+٦٥", good: "٣٥–٦٤", poor: "أقل من ٣٥", avg: "~٢٠ للعلامات الخليجية", note: "تحتاج درجات عالية إلى بيانات منظمة وتواجد على ويكيبيديا واستشهادات موثوقة." },
    sentimentIdx: { excellent: "+٧٠", good: "٥٠–٦٩", poor: "أقل من ٥٠", avg: "~٥٥ (إيجابي قليلاً)", note: "٥٠ محايد. معظم العلامات المعروفة تسجل ٥٠–٦٥. أقل من ٥٠ يشير لمشاعر سلبية." },
  },
};

const T = {
  en: {
    nav: { about: "About Us", how: "How It Works", pricing: "Pricing", faq: "FAQ", contact: "Contact Us" },
    hero: { title: "Is Your Brand Visible\nin AI Search?", sub: "We audit your brand's presence across ChatGPT, Gemini, Perplexity, Copilot & Claude — with Arabic-first analysis.", cta: "Start Free Audit", stat1: "400M+", stat1l: "Arabic Speakers", stat2: "<1%", stat2l: "Arabic Web Content", stat3: "74%", stat3l: "Youth Using AI Search" },
    gate: { title: "Start Your Free AI Visibility Audit", sub: "Enter your business details to unlock your personalized brand visibility report.", name: "Full Name", email: "Business Email", company: "Company Name", jobtitle: "Job Title", submit: "Continue to Audit →", privacy: "Your data is secure. We never share your information.", emailErr: "Please use a business email. Personal emails (Gmail, Yahoo, etc.) are not accepted.", trial: "Free one-time trial audit" },
    form: { brandEn: "Brand Name (English)", brandAr: "اسم العلامة بالعربي", industry: "Industry", market: "Target Market", website: "Website URL (Optional)", queries: "Target Queries (one per line, optional)", queriesHint: "Leave blank and we'll generate relevant queries for your industry.", exTitle: "Example queries for your industry:", run: "Run AI Visibility Audit →", running: "Analysis takes 15–30 seconds · Free one-time trial" },
    results: { overall: "Overall AI Visibility", recognition: "Brand Recognition", arabic: "Arabic Content", citationReach: "Citation Reach", contentDepth: "Content Depth", sentimentIdx: "Sentiment Index", findings: "Key Findings", platforms: "Platform-by-Platform Analysis", gap: "Arabic Content Gap", competitor: "Competitive Landscape", recs: "Actionable Recommendations", items: "items", expand: "click to expand", roadmap: "Implementation Roadmap", phase1: "Phase 1 — Quick Wins", phase2: "Phase 2 — Foundation", phase3: "Phase 3 — Scale", w14: "Weeks 1–4", m23: "Months 2–3", m46: "Months 4–6", download: "Download Full Report", contact: "Contact Us", readyCta: "Want Ongoing AI Visibility Monitoring?", readySub: "This was your free one-time trial audit. To unlock continuous monitoring, detailed analytics, and implementation support — let's talk.", newAudit: "← Home", impact: "Expected Impact", effort: "Effort Required", steps: "Implementation Steps", kpis: "Success Metrics / KPIs", tools: "Tools & Resources Needed", benchmark: "Industry Benchmark", benchExcellent: "Excellent", benchGood: "Average", benchPoor: "Needs Work", benchAvg: "GCC Average", switchLang: "عرض بالعربي", trialBadge: "FREE TRIAL REPORT" },
    tooltips: {
      overall: "A composite score (0–100) measuring how often and how prominently your brand appears across all major AI platforms when relevant queries are asked.",
      recognition: "Measures whether AI models recognize your brand by name and can describe it accurately in Arabic and English.",
      arabic: "Evaluates the quality and availability of Arabic content about your brand that AI models can reference.",
      citationReach: "Tracks how many different AI platforms mention or cite your brand across diverse query types.",
      contentDepth: "Assesses how detailed and accurate the AI-generated descriptions of your brand are — surface mention vs. deep knowledge.",
      sentimentIdx: "Measures the overall tone (positive, neutral, negative) AI platforms use when referencing your brand."
    },
    about: { title: "About Bayyina.ai", p1: "Bayyina.ai (بيّنة) is the GCC's first Arabic-first Generative Engine Optimization platform. We help brands, government entities, and enterprises gain visibility in the AI-powered search era.", p2: "With over 400 million Arabic speakers and 74% of users under 30 searching via AI tools, Arabic content remains critically underrepresented — making up less than 1% of online content despite over 50% of MENA search queries.", p3: "We bridge that gap with AI-native auditing, optimization, and monitoring." },
    how: { title: "How It Works", s1t: "Audit", s1: "Enter your brand details and we simulate real Arabic queries across ChatGPT, Gemini, Perplexity, Copilot & Claude to measure your visibility.", s2t: "Analyze", s2: "Our engine scores your brand across 6 dimensions — visibility, recognition, Arabic content quality, citation reach, content depth, and sentiment.", s3t: "Optimize", s3: "Receive a prioritized action plan with implementation steps, KPIs, timelines, and tool recommendations your team can execute immediately.", s4t: "Monitor", s4: "Track your progress over time as we continuously re-audit your brand to prove ROI and keep you visible." },
    pricing: { title: "Pricing", t1: "Starter", t1p: "$500/mo", t1d: "Basic audit across 3 AI platforms, monthly visibility report, up to 50 tracked prompts.", t2: "Growth", t2p: "$2,500/mo", t2d: "Full platform coverage, weekly reports, optimization recommendations, 200 prompts, dedicated analyst.", t3: "Enterprise", t3p: "Custom", t3d: "White-glove service, unlimited prompts, content strategy, government & large enterprise packages.", cta: "Get Started" },
    faq: { title: "Frequently Asked Questions", q1: "What is Generative Engine Optimization (GEO)?", a1: "GEO is the practice of optimizing your brand's content and digital presence to appear in AI-generated answers — across platforms like ChatGPT, Gemini, and Perplexity — rather than just traditional search engine results.", q2: "Why does Arabic content visibility matter?", a2: "Arabic represents over 400 million speakers but less than 1% of indexed online content. AI platforms heavily favor English, leaving Arabic brands nearly invisible in AI-generated answers.", q3: "How long does an audit take?", a3: "Our automated audit completes in 15–30 seconds. A full strategic review with recommendations is delivered within 24 hours for paid plans.", q4: "Which AI platforms do you cover?", a4: "We audit visibility across ChatGPT, Google Gemini, Perplexity, Microsoft Copilot, and Claude — the five most-used AI search platforms.", q5: "Can I run more than one free audit?", a5: "The free audit is a one-time trial to demonstrate our platform's capabilities. For ongoing audits, monitoring, and optimization, explore our Starter, Growth, or Enterprise plans." },
    contact: { title: "Get in Touch", name: "Your Name", email: "Email Address", message: "How can we help?", send: "Send Message", sent: "Message sent! We'll be in touch within 24 hours." },
    chat: { title: "Ask Bayyina", placeholder: "Ask about GEO, Arabic visibility, pricing...", send: "Send" },
    loading: ["Querying AI platforms in Arabic...", "Analyzing brand visibility...", "Evaluating Arabic content quality...", "Building implementation roadmap...", "Compiling your report..."],
    footer: { tagline: "Arabic-First AI Visibility Platform", rights: "All rights reserved.", product: "Product", company: "Company", resources: "Resources", audit: "Free Audit", docs: "Documentation", blog: "Blog", careers: "Careers", privacy: "Privacy Policy", terms: "Terms of Service", made: "Made in Qatar 🇶🇦" },
    usedAudit: { title: "You've Used Your Free Trial Audit", sub: "Thank you for trying Bayyina.ai! Your one-time free audit has been used. To unlock unlimited audits, real-time monitoring, and expert implementation support — let's discuss the plan that works best for you.", cta: "Contact Us for Pricing", viewReport: "View Previous Report" },
  },
  ar: {
    nav: { about: "من نحن", how: "كيف يعمل", pricing: "الأسعار", faq: "الأسئلة الشائعة", contact: "اتصل بنا" },
    hero: { title: "هل علامتك التجارية\nظاهرة في بحث الذكاء الاصطناعي؟", sub: "نقوم بتدقيق ظهور علامتك التجارية عبر ChatGPT و Gemini و Perplexity و Copilot و Claude — بتحليل عربي أولاً.", cta: "ابدأ التدقيق المجاني", stat1: "+٤٠٠ مليون", stat1l: "ناطق بالعربية", stat2: "أقل من ١٪", stat2l: "محتوى عربي على الإنترنت", stat3: "٧٤٪", stat3l: "شباب يستخدمون بحث AI" },
    gate: { title: "ابدأ تدقيق ظهورك المجاني", sub: "أدخل بياناتك المهنية للحصول على تقرير ظهور علامتك التجارية المخصص.", name: "الاسم الكامل", email: "البريد الإلكتروني المهني", company: "اسم الشركة", jobtitle: "المسمى الوظيفي", submit: "← المتابعة إلى التدقيق", privacy: "بياناتك آمنة. لا نشارك معلوماتك أبداً.", emailErr: "يرجى استخدام بريد إلكتروني مهني. لا نقبل البريد الشخصي (Gmail, Yahoo, إلخ).", trial: "تدقيق تجريبي مجاني لمرة واحدة" },
    form: { brandEn: "اسم العلامة (إنجليزي)", brandAr: "اسم العلامة بالعربي", industry: "القطاع", market: "السوق المستهدف", website: "رابط الموقع (اختياري)", queries: "استعلامات مستهدفة (سطر لكل استعلام، اختياري)", queriesHint: "اتركه فارغاً وسنولّد استعلامات مناسبة لقطاعك.", exTitle: "أمثلة على الاستعلامات لقطاعك:", run: "← ابدأ تدقيق الظهور", running: "يستغرق التحليل ١٥–٣٠ ثانية · تجربة مجانية لمرة واحدة" },
    results: { overall: "الظهور العام", recognition: "التعرف على العلامة", arabic: "المحتوى العربي", citationReach: "نطاق الاستشهاد", contentDepth: "عمق المحتوى", sentimentIdx: "مؤشر المشاعر", findings: "النتائج الرئيسية", platforms: "تحليل كل منصة", gap: "فجوة المحتوى العربي", competitor: "المشهد التنافسي", recs: "التوصيات القابلة للتنفيذ", items: "عنصر", expand: "اضغط للتوسع", roadmap: "خارطة طريق التنفيذ", phase1: "المرحلة ١ — مكاسب سريعة", phase2: "المرحلة ٢ — بناء الأساس", phase3: "المرحلة ٣ — التوسع", w14: "الأسابيع ١–٤", m23: "الأشهر ٢–٣", m46: "الأشهر ٤–٦", download: "تحميل التقرير", contact: "اتصل بنا", readyCta: "هل تريد مراقبة مستمرة لظهورك في AI؟", readySub: "كان هذا تدقيقك التجريبي المجاني. لفتح المراقبة المستمرة والتحليلات التفصيلية ودعم التنفيذ — دعنا نتحدث.", newAudit: "الرئيسية →", impact: "التأثير المتوقع", effort: "الجهد المطلوب", steps: "خطوات التنفيذ", kpis: "مقاييس النجاح", tools: "الأدوات والموارد", benchmark: "المعيار القياسي", benchExcellent: "ممتاز", benchGood: "متوسط", benchPoor: "يحتاج تحسين", benchAvg: "متوسط الخليج", switchLang: "View in English", trialBadge: "تقرير تجريبي مجاني" },
    tooltips: { overall: "مقياس مركّب (٠–١٠٠) يقيس مدى ظهور علامتك عبر جميع منصات AI عند طرح استفسارات.", recognition: "يقيس تعرّف نماذج AI على علامتك بالاسم ووصفها بدقة.", arabic: "يقيّم جودة وتوفر المحتوى العربي عن علامتك.", citationReach: "يتتبع عدد المنصات التي تذكر علامتك عبر أنواع استعلامات متنوعة.", contentDepth: "يقيّم مدى تفصيل ودقة الأوصاف المولّدة بالذكاء الاصطناعي.", sentimentIdx: "يقيس النبرة العامة التي تستخدمها المنصات عند الإشارة لعلامتك." },
    about: { title: "عن بيّنة", p1: "بيّنة هي أول منصة عربية لتحسين الظهور في محركات الذكاء الاصطناعي التوليدي في دول الخليج.", p2: "مع أكثر من ٤٠٠ مليون ناطق بالعربية و٧٤٪ من المستخدمين تحت ٣٠ عاماً يبحثون عبر أدوات AI، يبقى المحتوى العربي ممثلاً تمثيلاً ناقصاً بشكل حاد.", p3: "نحن نسد هذه الفجوة من خلال التدقيق والتحسين والمراقبة المبنية على الذكاء الاصطناعي." },
    how: { title: "كيف يعمل", s1t: "التدقيق", s1: "أدخل تفاصيل علامتك ونحاكي استعلامات عربية حقيقية عبر ٥ منصات AI.", s2t: "التحليل", s2: "يقيّم محركنا علامتك عبر ٦ أبعاد — الظهور والتعرف وجودة المحتوى ونطاق الاستشهاد وعمق المحتوى والمشاعر.", s3t: "التحسين", s3: "تحصل على خطة عمل مرتبة حسب الأولوية مع خطوات التنفيذ ومؤشرات الأداء.", s4t: "المراقبة", s4: "تتبع تقدمك حيث نعيد تدقيق علامتك باستمرار لإثبات العائد على الاستثمار." },
    pricing: { title: "الأسعار", t1: "المبتدئ", t1p: "٥٠٠$/شهرياً", t1d: "تدقيق أساسي عبر ٣ منصات، تقرير شهري، حتى ٥٠ استعلام.", t2: "النمو", t2p: "٢٬٥٠٠$/شهرياً", t2d: "تغطية كاملة، تقارير أسبوعية، توصيات تحسين، ٢٠٠ استعلام، محلل مخصص.", t3: "المؤسسات", t3p: "مخصص", t3d: "خدمة متكاملة، استعلامات غير محدودة، استراتيجية محتوى، باقات حكومية.", cta: "ابدأ الآن" },
    faq: { title: "الأسئلة الشائعة", q1: "ما هو تحسين محركات AI التوليدي (GEO)؟", a1: "هو ممارسة تحسين محتوى علامتك للظهور في إجابات AI — عبر منصات مثل ChatGPT وGemini وPerplexity.", q2: "لماذا يهم ظهور المحتوى العربي؟", a2: "العربية تمثل أكثر من ٤٠٠ مليون ناطق لكن أقل من ١٪ من المحتوى المفهرس.", q3: "كم يستغرق التدقيق؟", a3: "التدقيق الآلي يكتمل في ١٥–٣٠ ثانية. المراجعة الكاملة تُسلّم خلال ٢٤ ساعة.", q4: "ما المنصات التي تغطونها؟", a4: "ChatGPT وGoogle Gemini وPerplexity وMicrosoft Copilot وClaude.", q5: "هل يمكنني إجراء أكثر من تدقيق مجاني؟", a5: "التدقيق المجاني هو تجربة لمرة واحدة. للتدقيقات المستمرة والمراقبة والتحسين، استكشف باقاتنا المدفوعة." },
    contact: { title: "تواصل معنا", name: "الاسم", email: "البريد الإلكتروني", message: "كيف يمكننا مساعدتك؟", send: "إرسال", sent: "تم الإرسال! سنتواصل معك خلال ٢٤ ساعة." },
    chat: { title: "اسأل بيّنة", placeholder: "اسأل عن GEO، الظهور العربي، الأسعار...", send: "إرسال" },
    loading: ["جاري الاستعلام من منصات AI...", "جاري تحليل ظهور العلامة...", "جاري تقييم جودة المحتوى العربي...", "جاري بناء خارطة الطريق...", "جاري إعداد تقريرك..."],
    footer: { tagline: "منصة الظهور في AI — عربي أولاً", rights: "جميع الحقوق محفوظة.", product: "المنتج", company: "الشركة", resources: "الموارد", audit: "تدقيق مجاني", docs: "التوثيق", blog: "المدونة", careers: "الوظائف", privacy: "سياسة الخصوصية", terms: "شروط الخدمة", made: "صنع في قطر 🇶🇦" },
    usedAudit: { title: "لقد استخدمت تدقيقك التجريبي المجاني", sub: "شكراً لتجربة بيّنة! تم استخدام تدقيقك المجاني. لفتح تدقيقات غير محدودة ومراقبة مستمرة ودعم تنفيذ احترافي — دعنا نتحدث عن الباقة المناسبة لك.", cta: "تواصل معنا للأسعار", viewReport: "عرض التقرير السابق" },
  },
};

// ─── UTILS ───
function repairJSON(str) {
  try { return JSON.parse(str); } catch {}
  let s = str.trimEnd().replace(/,\s*$/, "");
  const closers = []; let inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) { const c = s[i]; if (esc) { esc = false; continue; } if (c === "\\") { esc = true; continue; } if (c === '"') { inStr = !inStr; continue; } if (inStr) continue; if (c === "{") closers.push("}"); else if (c === "[") closers.push("]"); else if (c === "}" || c === "]") closers.pop(); }
  if (inStr) s += '"';
  const suf = closers.reverse().join("");
  for (const a of [s + suf, s.slice(0, s.lastIndexOf(",")) + suf]) { try { const r = JSON.parse(a); if (r.overall_score !== undefined) return r; } catch {} }
  return null;
}

function isBusinessEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain && !PERSONAL_DOMAINS.includes(domain);
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold }); obs.observe(el); return () => obs.disconnect(); }, [threshold]);
  return [ref, visible];
}
function Reveal({ children, delay = 0, direction = "up", style = {} }) {
  const [ref, vis] = useReveal();
  const tr = { up: "translateY(30px)", down: "translateY(-30px)", left: "translateX(30px)", right: "translateX(-30px)", scale: "scale(0.92)" };
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : tr[direction], transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`, ...style }}>{children}</div>;
}

// ─── PDF EXPORT ───
function downloadReport(results, brandName, brandNameAr, industry, country, rLang) {
  const indLabel = INDUSTRIES.find(i => i.value === industry)?.label || industry;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sc = s => (s >= 70 ? "#16a34a" : s >= 40 ? "#d97706" : "#dc2626");
  const pc = p => (p === "high" ? "#dc2626" : p === "medium" ? "#d97706" : "#16a34a");
  const plat = PLATFORMS.map(p => { const d = results.platforms?.[p.id]; if (!d) return ""; return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${p.name}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;"><span style="padding:2px 10px;border-radius:12px;font-weight:700;font-size:12px;color:#fff;background:${sc(d.visibility_score)}">${d.visibility_score}</span></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;color:${d.is_mentioned?"#16a34a":"#dc2626"}">${d.is_mentioned?"✓":"✗"}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${d.arabic_quality}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${d.sentiment}</td></tr>`; }).join("");
  const recs = (results.recommendations||[]).map((r,i)=>`<div style="page-break-inside:avoid;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:10px;border-left:4px solid ${pc(r.priority)};"><h4 style="margin:0 0 4px;font-size:13px;">${i+1}. ${r.title} <span style="font-size:9px;color:${pc(r.priority)};">[${r.priority}]</span></h4><p style="margin:0 0 6px;font-size:11px;color:#4b5563;line-height:1.4;">${r.description}</p>${r.action_items?.length?r.action_items.map((a,j)=>`<div style="font-size:10px;color:#374151;margin-bottom:2px;">${j+1}. ${a}</div>`).join(""):""}</div>`).join("");
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bayyina.ai — ${brandName}</title><style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Outfit',sans-serif;color:#111}@media print{.no-print{display:none!important}@page{margin:0.5in}}</style></head><body><div class="no-print" style="position:fixed;top:0;left:0;right:0;background:#0a0a0f;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:999;"><span style="color:#d4a574;font-weight:700;">Bayyina.ai Report — Free Trial</span><button onclick="window.print()" style="background:linear-gradient(135deg,#d4a574,#b8860b);border:none;padding:8px 20px;border-radius:6px;color:#0a0a0f;font-weight:700;cursor:pointer;">⬇ Save as PDF</button></div><div class="no-print" style="height:48px;"></div><div style="background:linear-gradient(135deg,#0a0a0f,#1a1520);padding:32px;color:#fff;"><h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">${brandName}${brandNameAr?` — ${brandNameAr}`:""}</h1><div style="font-size:11px;color:rgba(255,255,255,0.4);">${indLabel} · ${country} · ${date}</div></div><div style="background:#f8f9fa;padding:20px 32px;display:flex;gap:24px;flex-wrap:wrap;border-bottom:1px solid #e5e7eb;"><div style="text-align:center;"><div style="font-size:32px;font-weight:800;color:${sc(results.overall_score)};">${results.overall_score}</div><div style="font-size:9px;color:#6b7280;">OVERALL</div></div>${[{s:results.brand_recognition_score,l:"RECOGNITION"},{s:results.arabic_content_score,l:"ARABIC"},{s:results.citation_reach_score,l:"CITATION"},{s:results.content_depth_score,l:"DEPTH"},{s:results.sentiment_index,l:"SENTIMENT"}].map(k=>k.s!==undefined?`<div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:${sc(k.s)};">${k.s}</div><div style="font-size:9px;color:#9ca3af;">${k.l}</div></div>`:"").join("")}</div><div style="padding:20px 32px;">${(results.key_findings||[]).map(f=>`<div style="margin-bottom:4px;padding:6px 10px;background:#fefce8;border-left:3px solid #eab308;font-size:11px;color:#374151;">${f}</div>`).join("")}<h2 style="font-size:14px;margin:16px 0 8px;">Platform Analysis</h2><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#f3f4f6;"><th style="padding:6px;text-align:left;font-size:9px;border-bottom:2px solid #e5e7eb;">Platform</th><th style="padding:6px;text-align:center;font-size:9px;border-bottom:2px solid #e5e7eb;">Score</th><th style="padding:6px;text-align:center;font-size:9px;border-bottom:2px solid #e5e7eb;">Mentioned</th><th style="padding:6px;text-align:center;font-size:9px;border-bottom:2px solid #e5e7eb;">Arabic</th><th style="padding:6px;text-align:center;font-size:9px;border-bottom:2px solid #e5e7eb;">Sentiment</th></tr></thead><tbody>${plat}</tbody></table><h2 style="font-size:14px;margin:16px 0 8px;">Recommendations</h2>${recs}</div><div style="background:#0a0a0f;padding:14px 32px;color:rgba(255,255,255,0.4);font-size:9px;display:flex;justify-content:space-between;margin-top:20px;"><span>Confidential — Bayyina.ai (بيّنة) · Free Trial Report</span><span>${date}</span></div></body></html>`;
  const blob = new Blob([html], { type: "text/html" }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `Bayyina-Audit-${brandName.replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── SCORE RING + SMART TOOLTIP ───
function ScoreRing({ score, size = 120, strokeWidth = 8, color, label, delay = 0, tooltip, benchmarkKey, reportLang }) {
  const [val, setVal] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [tipPos, setTipPos] = useState({ top: false, left: 0, arrowLeft: "50%" });
  const wrapRef = useRef(null);
  const tipRef = useRef(null);
  const r = (size - strokeWidth) / 2, c = 2 * Math.PI * r, off = c - (val / 100) * c;
  const rl = reportLang || "en";
  const ff = rl === "ar" ? "'Noto Kufi Arabic'" : "'Outfit'";
  const TIP_W = 250;
  const EDGE_PAD = 10;

  useEffect(() => { const t = setTimeout(() => { let cur = 0; const iv = setInterval(() => { cur++; if (cur >= score) { setVal(score); clearInterval(iv); } else setVal(cur); }, 12); }, delay); return () => clearTimeout(t); }, [score, delay]);
  const sc = s => color || (s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444");
  const bench = benchmarkKey ? BENCHMARKS[rl]?.[benchmarkKey] : null;
  const tR = T[rl]?.results || T.en.results;

  // Recalculate position whenever tooltip opens or after it renders
  useEffect(() => {
    if (!showTip || !wrapRef.current) return;
    const recalc = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tipH = tipRef.current ? tipRef.current.offsetHeight : 180;

      // Vertical: prefer above, flip below if not enough room
      const spaceAbove = rect.top;
      const placeBelow = spaceAbove < tipH + 16;

      // Horizontal: center by default, shift if clipped
      const centerX = rect.left + rect.width / 2;
      let leftOffset = 0; // px shift from centered
      const tipLeft = centerX - TIP_W / 2;
      const tipRight = centerX + TIP_W / 2;

      if (tipLeft < EDGE_PAD) {
        leftOffset = EDGE_PAD - tipLeft;
      } else if (tipRight > vw - EDGE_PAD) {
        leftOffset = (vw - EDGE_PAD) - tipRight;
      }

      // Arrow should point to the center of the ring relative to the tooltip
      const arrowPx = TIP_W / 2 - leftOffset;

      setTipPos({ top: placeBelow, left: leftOffset, arrowLeft: `${arrowPx}px` });
    };
    // Run after paint so tipRef has dimensions
    requestAnimationFrame(recalc);
  }, [showTip]);

  const tipStyle = {
    position: "absolute",
    ...(tipPos.top
      ? { top: "100%", marginTop: 10 }
      : { bottom: "100%", marginBottom: 10 }),
    left: "50%",
    transform: `translateX(calc(-50% + ${tipPos.left}px))`,
    background: "rgba(5,5,12,0.97)",
    border: "1px solid rgba(212,165,116,0.3)",
    borderRadius: 12,
    padding: "12px 14px",
    width: TIP_W,
    zIndex: 9999,
    direction: rl === "ar" ? "rtl" : "ltr",
    boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
    pointerEvents: "none",
  };

  const arrowStyle = {
    position: "absolute",
    ...(tipPos.top
      ? { top: -6 }
      : { bottom: -6 }),
    left: tipPos.arrowLeft,
    transform: `translateX(-50%) rotate(45deg)`,
    width: 10,
    height: 10,
    background: "rgba(5,5,12,0.97)",
    ...(tipPos.top
      ? { borderTop: "1px solid rgba(212,165,116,0.3)", borderLeft: "1px solid rgba(212,165,116,0.3)" }
      : { borderRight: "1px solid rgba(212,165,116,0.3)", borderBottom: "1px solid rgba(212,165,116,0.3)" }),
  };

  return (
    <div ref={wrapRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative" }}
      onMouseEnter={() => (tooltip || bench) && setShowTip(true)} onMouseLeave={() => setShowTip(false)}
      onTouchStart={(e) => { if (tooltip || bench) { e.stopPropagation(); setShowTip(p => !p); } }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={sc(val)} strokeWidth={strokeWidth} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 700, color: sc(val), fontFamily: "'Outfit'" }}>{val}</span>
      </div>
      {label && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center", fontFamily: ff, maxWidth: size + 24 }}>{label}</span>}
      {showTip && (tooltip || bench) && (
        <div ref={tipRef} style={tipStyle}>
          {tooltip && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: bench ? "0 0 8px" : 0, lineHeight: 1.5, fontFamily: ff }}>{tooltip}</p>}
          {bench && (<div style={{ borderTop: tooltip ? "1px solid rgba(255,255,255,0.08)" : "none", paddingTop: tooltip ? 8 : 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#d4a574", textTransform: "uppercase", margin: "0 0 5px", letterSpacing: "0.05em" }}>{tR.benchmark}</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 5px", borderRadius: 3 }}>{tR.benchExcellent}: {bench.excellent}</span>
              <span style={{ fontSize: 9, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 5px", borderRadius: 3 }}>{tR.benchGood}: {bench.good}</span>
              <span style={{ fontSize: 9, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "2px 5px", borderRadius: 3 }}>{tR.benchPoor}: {bench.poor}</span>
            </div>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: "0 0 3px" }}>{tR.benchAvg}: {bench.avg}</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.4, fontStyle: "italic" }}>{bench.note}</p>
          </div>)}
          <div style={arrowStyle} />
        </div>
      )}
    </div>
  );
}

// ─── PLATFORM CARD ───
function PlatformCard({ platform, data, delay }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 12px", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(16px)", transition: "all 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><span style={{ fontSize: 18, color: platform.color }}>{platform.icon}</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{platform.name}</span></div>
      <ScoreRing score={data?.visibility_score || 0} size={68} strokeWidth={5} color={platform.color} delay={delay + 200} />
      <div style={{ marginTop: 10 }}>
        {[{ l: "Mentioned", v: data?.is_mentioned ? "✓" : "✗", c: data?.is_mentioned ? "#22c55e" : "#ef4444" },
          { l: "Arabic", v: data?.arabic_quality==="good"?"Strong":data?.arabic_quality==="partial"?"Weak":"None", c: data?.arabic_quality==="good"?"#22c55e":data?.arabic_quality==="partial"?"#f59e0b":"#ef4444" },
          { l: "Sentiment", v: data?.sentiment||"N/A", c: data?.sentiment==="positive"?"#22c55e":"#f59e0b" }
        ].map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:10}}><span style={{color:"rgba(255,255,255,0.35)"}}>{r.l}</span><span style={{fontWeight:600,color:r.c}}>{r.v}</span></div>)}
      </div>
      {data?.summary && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 8, lineHeight: 1.5 }}>{data.summary}</p>}
    </div>
  );
}

// ─── REC CARD ───
function RecCard({ rec, rl }) {
  const [open, setOpen] = useState(false);
  const t = T[rl]?.results || T.en.results;
  const pc = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  const dr = rl === "ar" ? "rtl" : "ltr";
  return (
    <div onClick={() => setOpen(!open)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 15px", cursor: "pointer", borderLeft: dr==="ltr"?`3px solid ${pc[rec.priority]||"#f59e0b"}`:"none", borderRight: dr==="rtl"?`3px solid ${pc[rec.priority]||"#f59e0b"}`:"none", direction: dr, transition: "background 0.2s" }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: pc[rec.priority], background: `${pc[rec.priority]}15`, padding: "2px 6px", borderRadius: 3 }}>{rec.priority}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{rec.category}</span>
            {rec.timeline && <span style={{ fontSize: 9, color: "rgba(212,165,116,0.6)", background: "rgba(212,165,116,0.08)", padding: "2px 6px", borderRadius: 3 }}>⏱ {rec.timeline}</span>}
          </div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{rec.title}</h4>
        </div>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", transform: open?"rotate(180deg)":"", transition: "0.3s", flexShrink: 0 }}>▾</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.3s" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 10px", lineHeight: 1.7 }}>{rec.description}</p>
          {(rec.estimated_impact||rec.estimated_effort)&&<div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {rec.estimated_impact&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,padding:"4px 9px"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{t.impact}</div><div style={{fontSize:11,fontWeight:600,color:rec.estimated_impact==="high"?"#22c55e":"#f59e0b"}}>{rec.estimated_impact}</div></div>}
            {rec.estimated_effort&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,padding:"4px 9px"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{t.effort}</div><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)"}}>{rec.estimated_effort}</div></div>}
          </div>}
          {rec.action_items?.length>0&&<div style={{marginBottom:8}}><p style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:"rgba(212,165,116,0.6)",marginBottom:4}}>{t.steps}</p>
            {rec.action_items.map((it,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}><div style={{width:15,height:15,borderRadius:"50%",background:"rgba(212,165,116,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:8,color:"#d4a574",fontWeight:700}}>{i+1}</div><span style={{fontSize:11,color:"rgba(255,255,255,0.45)",lineHeight:1.5}}>{it}</span></div>)}</div>}
          {rec.kpis?.length>0&&<div style={{marginBottom:6}}><p style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:"rgba(212,165,116,0.6)",marginBottom:3}}>{t.kpis}</p><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{rec.kpis.map((k,i)=><span key={i} style={{fontSize:10,color:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:4,padding:"2px 6px"}}>{k}</span>)}</div></div>}
          {rec.tools_needed?.length>0&&<div><p style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:"rgba(212,165,116,0.6)",marginBottom:3}}>{t.tools}</p><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{rec.tools_needed.map((tl,i)=><span key={i} style={{fontSize:10,color:"#d4a574",background:"rgba(212,165,116,0.06)",border:"1px solid rgba(212,165,116,0.1)",borderRadius:4,padding:"2px 6px"}}>{tl}</span>)}</div></div>}
        </div>
      )}
    </div>
  );
}

// ─── AI CHAT ───
function ChatAgent({ lang }) {
  const t = T[lang]?.chat || T.en.chat;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const dir = lang === "ar" ? "rtl" : "ltr";
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight); }, [msgs]);
  const send = async () => {
    if (!input.trim()||loading) return;
    const q = input.trim(); setInput(""); setLoading(true);
    setMsgs(p => [...p, { role: "user", text: q }]);
    try {
      const res = await fetch("/.netlify/functions/chat", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }) });
      const data = await res.json();
      setMsgs(p => [...p, { role: "assistant", text: data.content?.[0]?.text || "Please try again." }]);
    } catch { setMsgs(p => [...p, { role: "assistant", text: "Connection error." }]); }
    setLoading(false);
  };
  if (!open) return <button onClick={() => setOpen(true)} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #d4a574, #b8860b)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(212,165,116,0.4)", fontSize: 20, color: "#0a0a0f", fontWeight: 800, fontFamily: "'Noto Kufi Arabic'", animation: "pulse 2s infinite" }}>بـ</button>;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, width: "min(360px, calc(100vw - 32px))", height: 420, maxHeight: "calc(100vh - 40px)", background: "#0f0f18", border: "1px solid rgba(212,165,116,0.2)", borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", direction: dir, animation: "slideUp 0.3s ease" }}>
      <div style={{ padding: "11px 14px", background: "rgba(212,165,116,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: "#d4a574", fontSize: 13 }}>{t.title}</span>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>×</button>
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.length===0&&<p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 50 }}>{lang === "ar" ? "مرحباً! كيف يمكنني مساعدتك؟" : "Hi! Ask me anything about AI visibility."}</p>}
        {msgs.map((m,i)=><div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth: "82%", background:m.role==="user"?"rgba(212,165,116,0.12)":"rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}><p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{m.text}</p></div>)}
        {loading&&<div style={{alignSelf:"flex-start",padding:"8px 12px"}}><span style={{color:"rgba(212,165,116,0.4)",fontSize:12,animation:"blink 1s infinite"}}>●●●</span></div>}
      </div>
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 6 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={t.placeholder} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, outline: "none", direction: dir }} />
        <button onClick={send} disabled={loading} style={{ background: "linear-gradient(135deg, #d4a574, #b8860b)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#0a0a0f", fontWeight: 700, fontSize: 11, cursor: "pointer", opacity: loading?0.5:1 }}>{t.send}</button>
      </div>
    </div>
  );
}

// ─── LOADING ───
function LoadingAnim({ stage, lang }) {
  const labels = T[lang]?.loading || T.en.loading;
  const ff = lang === "ar" ? "'Noto Kufi Arabic'" : "'Outfit'";
  const S = 180; // overall diameter
  const cx = S / 2, cy = S / 2;
  const progress = ((stage + 1) / labels.length) * 100;

  // Ring configs: radius, strokeWidth, dashPattern, speed(s), direction, opacity
  const rings = [
    { r: 82, sw: 1.5, dash: "6 8",   spd: 20, rev: false, op: 0.10 },
    { r: 72, sw: 1.5, dash: "3 12",  spd: 14, rev: true,  op: 0.14 },
    { r: 60, sw: 2,   dash: "18 10", spd: 10, rev: false, op: 0.20 },
    { r: 48, sw: 2,   dash: "4 6",   spd: 18, rev: true,  op: 0.16 },
    { r: 36, sw: 2.5, dash: "24 8",  spd: 8,  rev: false, op: 0.25 },
  ];

  // Progress arc (outermost)
  const pR = 86, pC = 2 * Math.PI * pR, pOff = pC - (progress / 100) * pC;

  // Orbiting particles
  const particles = [
    { r: 72, spd: 6,  size: 3, delay: 0 },
    { r: 48, spd: 4,  size: 2.5, delay: 1.5 },
    { r: 60, spd: 8,  size: 2, delay: 3 },
  ];

  // Platform icons orbit at outermost ring
  const visiblePlatforms = PLATFORMS.slice(0, Math.min(stage + 1, 5));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px 40px", gap: 20 }}>
      <div style={{ position: "relative", width: S, height: S }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", inset: 0 }}>
          {/* Ambient glow */}
          <defs>
            <radialGradient id="coreGlow"><stop offset="0%" stopColor="rgba(212,165,116,0.25)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
            <radialGradient id="coreBright"><stop offset="0%" stopColor="#d4a574" /><stop offset="60%" stopColor="rgba(212,165,116,0.6)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
            {/* Sweep gradient for radar effect */}
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(212,165,116,0.15)" />
            </linearGradient>
          </defs>

          {/* Background glow circle */}
          <circle cx={cx} cy={cy} r="70" fill="url(#coreGlow)" />

          {/* Spinning dashed rings */}
          {rings.map((ring, i) => (
            <circle key={i} cx={cx} cy={cy} r={ring.r} fill="none"
              stroke={`rgba(212,165,116,${ring.op})`} strokeWidth={ring.sw}
              strokeDasharray={ring.dash} strokeLinecap="round"
              style={{ transformOrigin: `${cx}px ${cy}px`, animation: `spin ${ring.spd}s linear infinite${ring.rev ? " reverse" : ""}` }} />
          ))}

          {/* Radar sweep line */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - 82}
            stroke="url(#sweepGrad)" strokeWidth="28" strokeLinecap="round"
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: "spin 3s linear infinite", opacity: 0.6 }} />

          {/* Progress arc (outermost) */}
          <circle cx={cx} cy={cy} r={pR} fill="none"
            stroke="rgba(212,165,116,0.08)" strokeWidth="3" />
          <circle cx={cx} cy={cy} r={pR} fill="none"
            stroke="#d4a574" strokeWidth="3"
            strokeDasharray={pC} strokeDashoffset={pOff}
            strokeLinecap="round"
            style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dashoffset 1.2s ease" }} />

          {/* Orbiting particles */}
          {particles.map((p, i) => (
            <circle key={`p${i}`} cx={cx} cy={cy - p.r} r={p.size}
              fill="#d4a574" opacity="0.7"
              style={{ transformOrigin: `${cx}px ${cy}px`, animation: `spin ${p.spd}s linear infinite`, animationDelay: `${p.delay}s`,
                filter: "drop-shadow(0 0 3px rgba(212,165,116,0.6))" }} />
          ))}

          {/* Pulsing center core */}
          <circle cx={cx} cy={cy} r="8" fill="url(#coreBright)" style={{ animation: "corePulse 2s ease-in-out infinite" }} />
          <circle cx={cx} cy={cy} r="4" fill="#d4a574" style={{ animation: "corePulse 2s ease-in-out infinite 0.3s" }} />
          <circle cx={cx} cy={cy} r="1.5" fill="#fff" opacity="0.9" />

          {/* Ping rings (sonar effect) */}
          {[0, 1, 2].map(i => (
            <circle key={`ping${i}`} cx={cx} cy={cy} r="10" fill="none"
              stroke="rgba(212,165,116,0.3)" strokeWidth="1"
              style={{ animation: `sonarPing 3s ease-out infinite`, animationDelay: `${i}s`, transformOrigin: `${cx}px ${cy}px` }} />
          ))}
        </svg>

        {/* Orbiting platform icons */}
        {visiblePlatforms.map((p, i) => {
          const angle = (i / 5) * 360;
          const orbitR = 78;
          return (
            <div key={p.id} style={{
              position: "absolute", width: 22, height: 22, borderRadius: 6,
              background: "rgba(10,10,15,0.9)", border: `1px solid ${p.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: p.color, fontWeight: 700,
              left: cx - 11, top: cy - 11,
              animation: `orbitPlatform${i} ${12 + i * 2}s linear infinite`,
              opacity: 0, animationFillMode: "forwards",
              boxShadow: `0 0 8px ${p.color}30`,
            }}>
              {p.icon}
            </div>
          );
        })}
      </div>

      {/* Status label with typing feel */}
      <div style={{ textAlign: "center", minHeight: 44 }}>
        <p key={stage} style={{ fontSize: 14, color: "#d4a574", fontWeight: 600, fontFamily: ff, animation: "labelFade 0.6s ease", margin: "0 0 6px" }}>{labels[stage % labels.length]}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: ff }}>{Math.round(progress)}%</p>
      </div>

      {/* Stage dots */}
      <div style={{ display: "flex", gap: 6 }}>
        {labels.map((_, i) => (
          <div key={i} style={{
            width: i <= stage ? 18 : 6, height: 6, borderRadius: 3,
            background: i <= stage ? "linear-gradient(90deg, #d4a574, #b8860b)" : "rgba(255,255,255,0.08)",
            transition: "all 0.5s ease", boxShadow: i === stage ? "0 0 8px rgba(212,165,116,0.4)" : "none",
          }} />
        ))}
      </div>

      {/* Platform scan list */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {PLATFORMS.map((p, i) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
            borderRadius: 6, fontSize: 10, fontWeight: 600,
            background: i <= stage ? `${p.color}15` : "rgba(255,255,255,0.03)",
            border: `1px solid ${i <= stage ? `${p.color}30` : "rgba(255,255,255,0.05)"}`,
            color: i <= stage ? p.color : "rgba(255,255,255,0.15)",
            transition: "all 0.6s ease", transitionDelay: `${i * 0.15}s`,
            transform: i <= stage ? "scale(1)" : "scale(0.9)",
          }}>
            <span>{p.icon}</span>
            <span style={{ fontFamily: "'Outfit'" }}>{p.name}</span>
            {i < stage && <span style={{ marginLeft: 2 }}>✓</span>}
            {i === stage && <span style={{ animation: "blink 1s infinite", marginLeft: 2 }}>●</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MAIN APP ═══════════════
export default function BayyinaAI() {
  const [lang, setLang] = useState("en");
  const [reportLang, setReportLang] = useState("en"); // report always starts English
  const [view, setView] = useState("home"); // home | gate | audit | loading | results | usedAudit
  const [brandName, setBrandName] = useState("");
  const [brandNameAr, setBrandNameAr] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [queries, setQueries] = useState("");
  const [country, setCountry] = useState("Qatar");
  const [loadingStage, setLoadingStage] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [auditUsed, setAuditUsed] = useState(false); // one-time gate
  // Lead capture
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadTitle, setLeadTitle] = useState("");
  const [leadError, setLeadError] = useState("");

  const t = T[lang];
  const tR = T[reportLang]; // report-specific translations
  const dir = lang === "ar" ? "rtl" : "ltr";
  const rDir = reportLang === "ar" ? "rtl" : "ltr";
  const ff = lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Outfit', sans-serif";
  const rff = reportLang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Outfit', sans-serif";

  const goHome = () => { setView("home"); setMobileMenu(false); setTimeout(() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" }), 50); };
  const scrollTo = id => { if (view !== "home") setView("home"); setMobileMenu(false); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100); };

  const submitLead = () => {
    if (!leadName.trim()||!leadEmail.trim()||!leadCompany.trim()||!leadTitle.trim()) { setLeadError(t.gate.emailErr ? lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields" : ""); setLeadError(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail)) { setLeadError(lang === "ar" ? "يرجى إدخال بريد إلكتروني صالح" : "Please enter a valid email address"); return; }
    if (!isBusinessEmail(leadEmail)) { setLeadError(t.gate.emailErr); return; }
    setLeadError(""); setView("audit");
  };

  const handleStartAudit = () => {
    if (auditUsed) { setView("usedAudit"); } else { setView("gate"); }
  };

  const runAudit = async () => {
    if (!brandName.trim()) { setError(lang === "ar" ? "يرجى إدخال اسم العلامة" : "Please enter a brand name"); return; }
    if (!industry) { setError(lang === "ar" ? "يرجى اختيار القطاع" : "Please select an industry"); return; }
    setError(""); setView("loading"); setLoadingStage(0); setReportLang("en"); // report always starts in English
    const iv = setInterval(() => setLoadingStage(p => { if (p >= 4) { clearInterval(iv); return 4; } return p + 1; }), 3500);
    try {
      const ind = INDUSTRIES.find(i => i.value === industry);
      const uq = queries.trim() ? queries.split("\n").filter(q => q.trim()).join(", ") : `best ${ind?.label||""} in ${country}, top ${ind?.label||""} companies ${country}`;
      const res = await fetch("/.netlify/functions/audit", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, brandNameAr: brandNameAr || "N/A", industry: ind?.label || industry, country, website: website || "N/A", queries: uq }) });
      const data = await res.json(); clearInterval(iv);
      if (data.content?.[0]) {
        const clean = data.content[0].text.replace(/```json|```/g,"").trim();
        let parsed; try { parsed = JSON.parse(clean); } catch { parsed = repairJSON(clean); }
        if (!parsed) throw new Error("Could not parse response");
        setResults(parsed); setView("results"); setAuditUsed(true);
      } else throw new Error(data.error?.message || "Unexpected response");
    } catch (err) { clearInterval(iv); setError(`Analysis failed: ${err.message}`); setView("audit"); }
  };

  const inp = (extra = {}) => ({ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: ff, outline: "none", boxSizing: "border-box", transition: "border-color 0.3s, box-shadow 0.3s", ...extra });
  const focusIn = e => { e.target.style.borderColor = "rgba(212,165,116,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(212,165,116,0.08)"; };
  const focusOut = e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; };
  const sel = has => ({ ...inp(), color: has ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='rgba(255,255,255,0.4)' viewBox='0 0 16 16'%3E%3Cpath d='M8 12L2 6h12z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: `${dir==="rtl"?"left":"right"} 14px center` });

  const navItems = [{ id: "about", l: t.nav.about }, { id: "how", l: t.nav.how }, { id: "pricing", l: t.nav.pricing }, { id: "faq", l: t.nav.faq }, { id: "contact", l: t.nav.contact }];
  const queryExamples = QUERY_EXAMPLES[industry] || QUERY_EXAMPLES.other;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: ff, direction: dir, position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 0%, rgba(212,165,116,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(212,165,116,0.03) 0%, transparent 50%)" }} />
      {/* Fonts loaded via index.html */}

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 900, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={goHome}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #d4a574, #b8860b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#0a0a0f", fontFamily: "'Noto Kufi Arabic'", transition: "transform 0.3s" }} onMouseEnter={e=>e.target.style.transform="rotate(-8deg) scale(1.1)"} onMouseLeave={e=>e.target.style.transform="none"}>بـ</div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Bayyina.ai</span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desk-nav">
            {navItems.map(n=><button key={n.id} onClick={()=>scrollTo(n.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.55)",fontSize:12,fontWeight:500,cursor:"pointer",padding:"6px 9px",fontFamily:ff,transition:"color 0.2s",borderRadius:6}} onMouseEnter={e=>e.target.style.color="#d4a574"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.55)"}>{n.l}</button>)}
            <button onClick={()=>setLang(lang==="en"?"ar":"en")} style={{ background:"rgba(212,165,116,0.1)",border:"1px solid rgba(212,165,116,0.2)",borderRadius:6,padding:"3px 9px",color:"#d4a574",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Noto Kufi Arabic'",marginLeft:4 }}>{lang==="en"?"عربي":"EN"}</button>
          </div>
          <button onClick={()=>setMobileMenu(!mobileMenu)} style={{ display:"none",background:"none",border:"none",color:"#d4a574",fontSize:20,cursor:"pointer" }} className="mob-btn">{mobileMenu?"✕":"☰"}</button>
        </div>
        {mobileMenu && <div style={{ padding:"6px 20px 14px",display:"flex",flexDirection:"column",gap:2,animation:"slideDown 0.3s ease" }} className="mob-menu">
          {navItems.map(n=><button key={n.id} onClick={()=>scrollTo(n.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.65)",fontSize:14,padding:"10px 0",textAlign:dir==="rtl"?"right":"left",fontFamily:ff,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{n.l}</button>)}
          <button onClick={()=>{setLang(lang==="en"?"ar":"en");setMobileMenu(false);}} style={{background:"rgba(212,165,116,0.1)",border:"none",borderRadius:8,padding:10,color:"#d4a574",fontWeight:600,cursor:"pointer",fontFamily:"'Noto Kufi Arabic'",marginTop:6}}>{lang==="en"?"عربي":"English"}</button>
        </div>}
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>

        {/* ═══ HOME ═══ */}
        {view === "home" && (
          <div>
            <section id="hero" style={{ textAlign: "center", padding: "52px 0 24px" }}>
              <Reveal><h2 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #fff 30%, #d4a574 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2, whiteSpace: "pre-line" }}>{t.hero.title}</h2></Reveal>
              <Reveal delay={200}><p style={{ fontSize: "clamp(13px, 2.5vw, 16px)", color: "rgba(255,255,255,0.4)", margin: "16px auto 0", maxWidth: 540, lineHeight: 1.7 }}>{t.hero.sub}</p></Reveal>
              <Reveal delay={400}><button onClick={handleStartAudit} style={{ marginTop: 28, padding: "14px 36px", background: "linear-gradient(135deg, #d4a574, #b8860b)", border: "none", borderRadius: 12, color: "#0a0a0f", fontSize: 15, fontWeight: 700, fontFamily: ff, cursor: "pointer", boxShadow: "0 4px 24px rgba(212,165,116,0.3)", transition: "transform 0.3s, box-shadow 0.3s" }} onMouseEnter={e=>{e.target.style.transform="translateY(-3px)";e.target.style.boxShadow="0 8px 32px rgba(212,165,116,0.4)";}} onMouseLeave={e=>{e.target.style.transform="none";e.target.style.boxShadow="0 4px 24px rgba(212,165,116,0.3)";}}>{t.hero.cta}</button></Reveal>
              <Reveal delay={600}><div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 48px)", marginTop: 40 }}>
                {[{ v: t.hero.stat1, l: t.hero.stat1l }, { v: t.hero.stat2, l: t.hero.stat2l }, { v: t.hero.stat3, l: t.hero.stat3l }].map((s,i)=>(<div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 800, color: "#d4a574" }}>{s.v}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div></div>))}
              </div></Reveal>
              <Reveal delay={800}><div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
                {PLATFORMS.map((p,i)=><div key={p.id} style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: p.color, animation: `float ${3+i*0.5}s ease-in-out infinite`, animationDelay: `${i*0.3}s` }}>{p.icon}</div>)}
              </div></Reveal>
            </section>

            <section id="about" style={{ padding: "52px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Reveal><h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 18 }}>{t.about.title}</h2></Reveal>
              {[t.about.p1, t.about.p2, t.about.p3].map((p,i)=><Reveal key={i} delay={i*100}><p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 10 }}>{p}</p></Reveal>)}
            </section>

            <section id="how" style={{ padding: "52px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Reveal><h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 28 }}>{t.how.title}</h2></Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {[{ n: "01", t: t.how.s1t, d: t.how.s1 }, { n: "02", t: t.how.s2t, d: t.how.s2 }, { n: "03", t: t.how.s3t, d: t.how.s3 }, { n: "04", t: t.how.s4t, d: t.how.s4 }].map((s,i)=>(
                  <Reveal key={s.n} delay={i*120}><div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:22,transition:"transform 0.3s,border-color 0.3s" }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="rgba(212,165,116,0.2)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";}}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(212,165,116,0.15)", marginBottom: 8 }}>{s.n}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#d4a574", margin: "0 0 8px" }}>{s.t}</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{s.d}</p>
                  </div></Reveal>))}
              </div>
            </section>

            <section id="pricing" style={{ padding: "52px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Reveal><h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 28 }}>{t.pricing.title}</h2></Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[{ t: t.pricing.t1, p: t.pricing.t1p, d: t.pricing.t1d, hl: false }, { t: t.pricing.t2, p: t.pricing.t2p, d: t.pricing.t2d, hl: true }, { t: t.pricing.t3, p: t.pricing.t3p, d: t.pricing.t3d, hl: false }].map((tier,i)=>(
                  <Reveal key={i} delay={i*150} direction="scale"><div style={{ background:tier.hl?"rgba(212,165,116,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${tier.hl?"rgba(212,165,116,0.25)":"rgba(255,255,255,0.06)"}`,borderRadius:16,padding:28,transition:"transform 0.3s",position:"relative",overflow:"hidden" }} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                    {tier.hl&&<div style={{ position:"absolute",top:12,right:dir==="rtl"?"auto":12,left:dir==="rtl"?12:"auto",fontSize:9,fontWeight:700,color:"#0a0a0f",background:"linear-gradient(135deg,#d4a574,#b8860b)",padding:"3px 10px",borderRadius:4,textTransform:"uppercase" }}>Popular</div>}
                    <h3 style={{ fontSize:18,fontWeight:700,color:"#fff",margin:"0 0 4px" }}>{tier.t}</h3>
                    <div style={{ fontSize:26,fontWeight:800,color:"#d4a574",margin:"8px 0 14px" }}>{tier.p}</div>
                    <p style={{ fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.7,margin:"0 0 18px" }}>{tier.d}</p>
                    <button onClick={()=>scrollTo("contact")} style={{ width:"100%",padding:10,background:tier.hl?"linear-gradient(135deg, #d4a574, #b8860b)":"rgba(255,255,255,0.06)",border:tier.hl?"none":"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:tier.hl?"#0a0a0f":"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:ff }}>{t.pricing.cta}</button>
                  </div></Reveal>))}
              </div>
            </section>

            <section id="faq" style={{ padding: "52px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Reveal><h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 24 }}>{t.faq.title}</h2></Reveal>
              {[{q:t.faq.q1,a:t.faq.a1},{q:t.faq.q2,a:t.faq.a2},{q:t.faq.q3,a:t.faq.a3},{q:t.faq.q4,a:t.faq.a4},{q:t.faq.q5,a:t.faq.a5}].map((f,i)=>(<Reveal key={i} delay={i*80}><details style={{marginBottom:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}><summary style={{padding:"13px 16px",cursor:"pointer",fontSize:13,fontWeight:600,color:"#fff"}}>{f.q}</summary><p style={{padding:"0 16px 14px",fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.7,margin:0}}>{f.a}</p></details></Reveal>))}
            </section>

            <section id="contact" style={{ padding: "52px 0 64px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Reveal><h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 24 }}>{t.contact.title}</h2></Reveal>
              {contactSent ? <Reveal><p style={{ color:"#22c55e",fontSize:14,padding:20,background:"rgba(34,197,94,0.1)",borderRadius:12 }}>{t.contact.sent}</p></Reveal> : (
                <Reveal delay={100}><div style={{ maxWidth:460,display:"flex",flexDirection:"column",gap:12 }}>
                  <input placeholder={t.contact.name} style={inp()} onFocus={focusIn} onBlur={focusOut} />
                  <input placeholder={t.contact.email} type="email" style={inp()} onFocus={focusIn} onBlur={focusOut} />
                  <textarea placeholder={t.contact.message} rows={4} style={inp({ resize: "vertical" })} onFocus={focusIn} onBlur={focusOut} />
                  <button onClick={()=>setContactSent(true)} style={{ padding:14,background:"linear-gradient(135deg, #d4a574, #b8860b)",border:"none",borderRadius:10,color:"#0a0a0f",fontSize:14,fontWeight:700,fontFamily:ff,cursor:"pointer",transition:"transform 0.2s" }} onMouseEnter={e=>e.target.style.transform="translateY(-2px)"} onMouseLeave={e=>e.target.style.transform="none"}>{t.contact.send}</button>
                </div></Reveal>
              )}
            </section>
          </div>
        )}

        {/* ═══ LEAD GATE ═══ */}
        {view === "gate" && (
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 0 64px", animation: "fadeIn 0.5s" }}>
            <Reveal><div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #d4a574, #b8860b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#0a0a0f", fontFamily: "'Noto Kufi Arabic'", margin: "0 auto 16px", boxShadow: "0 4px 24px rgba(212,165,116,0.3)" }}>بـ</div>
              <h2 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>{t.gate.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>{t.gate.sub}</p>
              <span style={{ fontSize: 10, color: "#d4a574", background: "rgba(212,165,116,0.1)", padding: "3px 10px", borderRadius: 4 }}>{t.gate.trial}</span>
            </div></Reveal>
            <Reveal delay={150}><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase" }}>{t.gate.name} *</label>
                <input value={leadName} onChange={e=>setLeadName(e.target.value)} style={inp()} onFocus={focusIn} onBlur={focusOut} /></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase" }}>{t.gate.email} *</label>
                <input value={leadEmail} onChange={e=>setLeadEmail(e.target.value)} type="email" placeholder="name@company.com" style={inp()} onFocus={focusIn} onBlur={focusOut} />
                <p style={{ fontSize:10,color:"rgba(255,255,255,0.2)",margin:"4px 0 0" }}>{lang==="ar"?"البريد الشخصي مثل Gmail/Yahoo غير مقبول":"Personal emails (Gmail, Yahoo, Hotmail, etc.) are not accepted"}</p></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase" }}>{t.gate.company} *</label>
                <input value={leadCompany} onChange={e=>setLeadCompany(e.target.value)} style={inp()} onFocus={focusIn} onBlur={focusOut} /></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase" }}>{t.gate.jobtitle} *</label>
                <input value={leadTitle} onChange={e=>setLeadTitle(e.target.value)} style={inp()} onFocus={focusIn} onBlur={focusOut} /></div>
              {leadError && <p style={{ color:"#ef4444",fontSize:12,margin:0,background:"rgba(239,68,68,0.1)",padding:"8px 12px",borderRadius:8 }}>{leadError}</p>}
              <button onClick={submitLead} style={{ width:"100%",padding:16,marginTop:4,background:"linear-gradient(135deg, #d4a574, #b8860b)",border:"none",borderRadius:12,color:"#0a0a0f",fontSize:15,fontWeight:700,fontFamily:ff,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,165,116,0.3)",transition:"transform 0.3s" }} onMouseEnter={e=>e.target.style.transform="translateY(-2px)"} onMouseLeave={e=>e.target.style.transform="none"}>{t.gate.submit}</button>
              <p style={{ fontSize:10,color:"rgba(255,255,255,0.2)",textAlign:"center",margin:0 }}>🔒 {t.gate.privacy}</p>
            </div></Reveal>
          </div>
        )}

        {/* ═══ AUDIT FORM ═══ */}
        {view === "audit" && (
          <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 0 48px", animation: "fadeIn 0.5s" }}>
            <Reveal><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8 }}>
              <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",margin:0 }}>{lang==="ar"?`مرحباً ${leadName}`:`Welcome, ${leadName}`} — {leadCompany}</p>
              <span style={{ fontSize:9,color:"#d4a574",background:"rgba(212,165,116,0.1)",padding:"3px 8px",borderRadius:4,fontWeight:600 }}>{lang==="ar"?"تجربة مجانية لمرة واحدة":"FREE ONE-TIME TRIAL"}</span>
            </div></Reveal>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="form-grid">
              <Reveal delay={50}><div><label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase"}}>{t.form.brandEn} *</label>
                <input value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="e.g. Aman Hospital" style={inp()} onFocus={focusIn} onBlur={focusOut} /></div></Reveal>
              <Reveal delay={100}><div><label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase",textAlign:"right",fontFamily:"'Noto Kufi Arabic'"}}>{t.form.brandAr}</label>
                <input value={brandNameAr} onChange={e=>setBrandNameAr(e.target.value)} dir="rtl" style={inp({fontFamily:"'Noto Kufi Arabic'"})} onFocus={focusIn} onBlur={focusOut} /></div></Reveal>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14 }} className="form-grid">
              <Reveal delay={150}><div><label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase"}}>{t.form.industry} *</label>
                <select value={industry} onChange={e=>setIndustry(e.target.value)} style={sel(!!industry)}><option value="" style={{background:"#1a1a2e"}}>...</option>
                  {INDUSTRIES.map(i=><option key={i.value} value={i.value} style={{background:"#1a1a2e"}}>{i.label} — {i.labelAr}</option>)}</select></div></Reveal>
              <Reveal delay={200}><div><label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase"}}>{t.form.market}</label>
                <select value={country} onChange={e=>setCountry(e.target.value)} style={sel(true)}>{["Qatar","Saudi Arabia","UAE","Kuwait","Bahrain","Oman","Egypt","Jordan","MENA Region"].map(c=><option key={c} value={c} style={{background:"#1a1a2e"}}>{c}</option>)}</select></div></Reveal>
            </div>
            <Reveal delay={250}><div style={{ marginTop:14 }}><label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase"}}>{t.form.website}</label>
              <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..." style={inp()} onFocus={focusIn} onBlur={focusOut} /></div></Reveal>
            <Reveal delay={300}><div style={{ marginTop:14 }}><label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",display:"block",marginBottom:5,textTransform:"uppercase"}}>{t.form.queries}</label>
              <textarea value={queries} onChange={e=>setQueries(e.target.value)} rows={3} style={inp({resize:"vertical"})} onFocus={focusIn} onBlur={focusOut} />
              <p style={{ fontSize:10,color:"rgba(255,255,255,0.2)",margin:"4px 0 0" }}>{t.form.queriesHint}</p>
              {/* Query examples */}
              {industry && <div style={{ marginTop:10,padding:"10px 14px",background:"rgba(212,165,116,0.04)",border:"1px solid rgba(212,165,116,0.1)",borderRadius:8 }}>
                <p style={{ fontSize:10,fontWeight:700,color:"rgba(212,165,116,0.7)",margin:"0 0 6px",textTransform:"uppercase" }}>{t.form.exTitle}</p>
                {queryExamples.map((q,i)=>(
                  <div key={i} onClick={()=>setQueries(prev=>prev?(prev+"\n"+q):q)} style={{ fontSize:11,color:"rgba(255,255,255,0.45)",cursor:"pointer",padding:"4px 8px",borderRadius:4,marginBottom:3,transition:"background 0.2s",display:"flex",alignItems:"center",gap:6 }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{ color:"#d4a574",fontSize:10 }}>+</span> {q}
                  </div>
                ))}
              </div>}
            </div></Reveal>
            {error && <p style={{ color:"#ef4444",fontSize:12,margin:"12px 0 0",background:"rgba(239,68,68,0.1)",padding:"8px 12px",borderRadius:8 }}>{error}</p>}
            <Reveal delay={350}><button onClick={runAudit} style={{ width:"100%",padding:16,marginTop:18,background:"linear-gradient(135deg, #d4a574, #b8860b)",border:"none",borderRadius:12,color:"#0a0a0f",fontSize:15,fontWeight:700,fontFamily:ff,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,165,116,0.3)",transition:"transform 0.3s" }} onMouseEnter={e=>e.target.style.transform="translateY(-2px)"} onMouseLeave={e=>e.target.style.transform="none"}>{t.form.run}</button>
              <p style={{ fontSize:10,color:"rgba(255,255,255,0.2)",textAlign:"center",margin:"6px 0 0" }}>{t.form.running}</p></Reveal>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {view === "loading" && <LoadingAnim stage={loadingStage} lang={lang} />}

        {/* ═══ USED AUDIT WALL ═══ */}
        {view === "usedAudit" && (
          <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 0", textAlign: "center", animation: "fadeIn 0.5s" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(212,165,116,0.1)", border: "1px solid rgba(212,165,116,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🔒</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>{t.usedAudit.title}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 28px" }}>{t.usedAudit.sub}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={()=>scrollTo("contact")} style={{ padding:"14px 28px",background:"linear-gradient(135deg, #d4a574, #b8860b)",border:"none",borderRadius:12,color:"#0a0a0f",fontSize:14,fontWeight:700,fontFamily:ff,cursor:"pointer" }}>{t.usedAudit.cta}</button>
              {results && <button onClick={()=>{setReportLang("en");setView("results");}} style={{ padding:"14px 28px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:14,fontWeight:600,fontFamily:ff,cursor:"pointer" }}>{t.usedAudit.viewReport}</button>}
            </div>
          </div>
        )}

        {/* ═══ RESULTS (uses reportLang for display) ═══ */}
        {view === "results" && results && (
          <div style={{ animation: "fadeIn 0.5s", paddingBottom: 40, direction: rDir, fontFamily: rff }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,margin:"16px 0 14px" }}>
              <button onClick={goHome} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:rff }}>{tR.results.newAudit}</button>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize:9,color:"#d4a574",background:"rgba(212,165,116,0.1)",padding:"3px 8px",borderRadius:4,fontWeight:700 }}>{tR.results.trialBadge}</span>
                <button onClick={()=>setReportLang(reportLang==="en"?"ar":"en")} style={{ background:"rgba(212,165,116,0.1)",border:"1px solid rgba(212,165,116,0.2)",borderRadius:8,padding:"6px 12px",color:"#d4a574",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Noto Kufi Arabic'" }}>{tR.results.switchLang}</button>
                <button onClick={()=>downloadReport(results,brandName,brandNameAr,industry,country,reportLang)} style={{ background:"linear-gradient(135deg, #d4a574, #b8860b)",border:"none",borderRadius:8,padding:"6px 12px",color:"#0a0a0f",fontSize:11,fontWeight:700,cursor:"pointer" }}>⬇ {tR.results.download}</button>
              </div>
            </div>

            {/* Hero Scores with Benchmarks */}
            <Reveal style={{ overflow: "visible" }}><div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"24px 16px",marginBottom:18,overflow:"visible" }}>
              <div style={{ marginBottom:18 }}>
                <h2 style={{ fontSize:"clamp(18px, 3.5vw, 24px)",fontWeight:700,color:"#fff",margin:0 }}>{brandName}{brandNameAr&&<span style={{ fontSize:"0.75em",color:"rgba(212,165,116,0.8)",marginLeft:10,fontFamily:"'Noto Kufi Arabic'" }}>{brandNameAr}</span>}</h2>
                <p style={{ fontSize:12,color:"rgba(255,255,255,0.35)",margin:"3px 0 0" }}>{INDUSTRIES.find(i=>i.value===industry)?.label} · {country}</p>
                <p style={{ fontSize:10,color:"rgba(255,255,255,0.2)",margin:"2px 0 0" }}>{reportLang==="ar"?"مرّر فوق المقاييس لعرض المعايير القياسية":"Hover over scores to see industry benchmarks"}</p>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(90px, 1fr))",gap:12,justifyItems:"center",overflow:"visible" }}>
                <ScoreRing score={results.overall_score} size={100} strokeWidth={8} label={tR.results.overall} delay={0} tooltip={tR.tooltips.overall} benchmarkKey="overall" reportLang={reportLang} />
                <ScoreRing score={results.brand_recognition_score} size={82} strokeWidth={6} label={tR.results.recognition} delay={150} tooltip={tR.tooltips.recognition} benchmarkKey="recognition" reportLang={reportLang} />
                <ScoreRing score={results.arabic_content_score} size={82} strokeWidth={6} label={tR.results.arabic} delay={300} tooltip={tR.tooltips.arabic} benchmarkKey="arabic" reportLang={reportLang} />
                <ScoreRing score={results.citation_reach_score||0} size={82} strokeWidth={6} label={tR.results.citationReach} delay={450} tooltip={tR.tooltips.citationReach} benchmarkKey="citationReach" reportLang={reportLang} />
                <ScoreRing score={results.content_depth_score||0} size={82} strokeWidth={6} label={tR.results.contentDepth} delay={600} tooltip={tR.tooltips.contentDepth} benchmarkKey="contentDepth" reportLang={reportLang} />
                <ScoreRing score={results.sentiment_index||50} size={82} strokeWidth={6} label={tR.results.sentimentIdx} delay={750} tooltip={tR.tooltips.sentimentIdx} benchmarkKey="sentimentIdx" reportLang={reportLang} />
              </div>
            </div></Reveal>

            <Reveal delay={100}>{results.key_findings&&<div style={{ background:"linear-gradient(135deg,rgba(212,165,116,0.06),rgba(212,165,116,0.02))",border:"1px solid rgba(212,165,116,0.12)",borderRadius:12,padding:"16px 18px",marginBottom:16 }}>
              <h3 style={{ fontSize:11,fontWeight:700,color:"#d4a574",margin:"0 0 8px",textTransform:"uppercase" }}>◆ {tR.results.findings}</h3>
              {results.key_findings.map((f,i)=><p key={i} style={{ fontSize:12,color:"rgba(255,255,255,0.6)",margin:"0 0 5px",lineHeight:1.6,paddingLeft:rDir==="ltr"?12:0,paddingRight:rDir==="rtl"?12:0,borderLeft:rDir==="ltr"?"2px solid rgba(212,165,116,0.25)":"none",borderRight:rDir==="rtl"?"2px solid rgba(212,165,116,0.25)":"none" }}>{f}</p>)}
            </div>}</Reveal>

            <Reveal delay={200}><h3 style={{ fontSize:14,fontWeight:700,color:"#fff",margin:"20px 0 12px" }}>{tR.results.platforms}</h3></Reveal>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",gap:12,marginBottom:20 }}>
              {PLATFORMS.map((p,i)=><PlatformCard key={p.id} platform={p} data={results.platforms?.[p.id]} delay={300+i*100} />)}
            </div>

            {results.arabic_gap_analysis&&<Reveal delay={200}><div style={{ background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)",borderRadius:10,padding:"14px 16px",marginBottom:12 }}><h3 style={{fontSize:10,fontWeight:700,color:"#ef4444",margin:"0 0 4px",textTransform:"uppercase"}}>{tR.results.gap}</h3><p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0,lineHeight:1.6}}>{results.arabic_gap_analysis}</p></div></Reveal>}
            {results.competitor_insight&&<Reveal delay={250}><div style={{ background:"rgba(59,130,246,0.04)",border:"1px solid rgba(59,130,246,0.1)",borderRadius:10,padding:"14px 16px",marginBottom:20 }}><h3 style={{fontSize:10,fontWeight:700,color:"#3b82f6",margin:"0 0 4px",textTransform:"uppercase"}}>{tR.results.competitor}</h3><p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0,lineHeight:1.6}}>{results.competitor_insight}</p></div></Reveal>}

            <Reveal delay={300}><h3 style={{ fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 8px" }}>{tR.results.recs} <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontWeight:400}}>— {results.recommendations?.length||0} {tR.results.items}</span></h3></Reveal>
            <div style={{ display:"flex",gap:5,marginBottom:12,flexWrap:"wrap" }}>
              {["high","medium","low"].map(p=>{const n=results.recommendations?.filter(r=>r.priority===p).length||0;const c={high:"#ef4444",medium:"#f59e0b",low:"#22c55e"};return n?<span key={p} style={{fontSize:9,color:c[p],background:`${c[p]}10`,border:`1px solid ${c[p]}25`,borderRadius:4,padding:"2px 6px",fontWeight:600,textTransform:"uppercase"}}>{n} {p}</span>:null;})}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
              {results.recommendations?.map((r,i)=><Reveal key={i} delay={350+i*60}><RecCard rec={r} rl={reportLang} /></Reveal>)}
            </div>

            {results.roadmap_summary&&<Reveal delay={400}><div style={{ background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.1)",borderRadius:12,padding:"18px 20px",marginBottom:20 }}>
              <h3 style={{ fontSize:12,fontWeight:700,color:"#22c55e",margin:"0 0 12px",textTransform:"uppercase" }}>{tR.results.roadmap}</h3>
              {[{k:"phase_1",l:tR.results.phase1,tm:tR.results.w14,c:"#22c55e"},{k:"phase_2",l:tR.results.phase2,tm:tR.results.m23,c:"#3b82f6"},{k:"phase_3",l:tR.results.phase3,tm:tR.results.m46,c:"#a855f7"}].map(ph=>results.roadmap_summary[ph.k]?<div key={ph.k} style={{borderLeft:rDir==="ltr"?`3px solid ${ph.c}`:"none",borderRight:rDir==="rtl"?`3px solid ${ph.c}`:"none",paddingLeft:rDir==="ltr"?12:0,paddingRight:rDir==="rtl"?12:0,marginBottom:10}}><span style={{fontSize:12,fontWeight:700,color:ph.c}}>{ph.l}</span><span style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginLeft:6}}>{ph.tm}</span><p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:"3px 0 0",lineHeight:1.6}}>{results.roadmap_summary[ph.k]}</p></div>:null)}
            </div></Reveal>}

            {/* CTA — Contact Us, not run another audit */}
            <Reveal delay={500}><div style={{ background:"linear-gradient(135deg,rgba(212,165,116,0.08),rgba(212,165,116,0.02))",border:"1px solid rgba(212,165,116,0.18)",borderRadius:16,padding:"32px 24px",textAlign:"center" }}>
              <h3 style={{ fontSize:"clamp(18px, 3vw, 22px)",fontWeight:700,color:"#fff",margin:"0 0 8px" }}>{tR.results.readyCta}</h3>
              <p style={{ fontSize:13,color:"rgba(255,255,255,0.35)",margin:"0 0 20px",maxWidth:460,marginLeft:"auto",marginRight:"auto",lineHeight:1.7 }}>{tR.results.readySub}</p>
              <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
                <button onClick={()=>downloadReport(results,brandName,brandNameAr,industry,country,reportLang)} style={{ padding:"12px 24px",background:"linear-gradient(135deg, #d4a574, #b8860b)",border:"none",borderRadius:10,color:"#0a0a0f",fontSize:13,fontWeight:700,fontFamily:rff,cursor:"pointer" }}>⬇ {tR.results.download}</button>
                <button onClick={()=>scrollTo("contact")} style={{ padding:"12px 24px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"#fff",fontSize:13,fontWeight:600,fontFamily:rff,cursor:"pointer" }}>{tR.results.contact}</button>
              </div>
            </div></Reveal>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:20 }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"40px 20px 24px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:32,marginBottom:32 }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,cursor:"pointer" }} onClick={goHome}>
                <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg, #d4a574, #b8860b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#0a0a0f",fontFamily:"'Noto Kufi Arabic'" }}>بـ</div>
                <span style={{ fontSize:16,fontWeight:700 }}>Bayyina.ai</span>
              </div>
              <p style={{ fontSize:12,color:"rgba(255,255,255,0.35)",lineHeight:1.7,margin:"0 0 14px" }}>{t.footer.tagline}</p>
              <p style={{ fontSize:11,color:"rgba(212,165,116,0.6)",margin:0 }}>{t.footer.made}</p>
            </div>
            <div>
              <h4 style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",marginBottom:12 }}>{t.footer.product}</h4>
              {[{l:t.footer.audit,id:"hero"},{l:t.nav.how,id:"how"},{l:t.nav.pricing,id:"pricing"}].map(lnk=>(<p key={lnk.id} style={{margin:"0 0 8px"}}><span onClick={()=>scrollTo(lnk.id)} style={{fontSize:12,color:"rgba(255,255,255,0.35)",cursor:"pointer",transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="#d4a574"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>{lnk.l}</span></p>))}
            </div>
            <div>
              <h4 style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",marginBottom:12 }}>{t.footer.company}</h4>
              {[{l:t.nav.about,id:"about"},{l:t.nav.contact,id:"contact"},{l:t.footer.careers,id:"contact"}].map((lnk,i)=>(<p key={i} style={{margin:"0 0 8px"}}><span onClick={()=>scrollTo(lnk.id)} style={{fontSize:12,color:"rgba(255,255,255,0.35)",cursor:"pointer",transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="#d4a574"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>{lnk.l}</span></p>))}
            </div>
            <div>
              <h4 style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",marginBottom:12 }}>{t.footer.resources}</h4>
              {[t.footer.docs,t.footer.blog,t.footer.privacy,t.footer.terms].map((lnk,i)=>(<p key={i} style={{margin:"0 0 8px"}}><span style={{fontSize:12,color:"rgba(255,255,255,0.35)",cursor:"pointer",transition:"color 0.2s"}} onMouseEnter={e=>e.target.style.color="#d4a574"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>{lnk}</span></p>))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
            <p style={{ fontSize:11,color:"rgba(255,255,255,0.25)",margin:0 }}>© {new Date().getFullYear()} Bayyina.ai (بيّنة). {t.footer.rights}</p>
            <div style={{ display:"flex",gap:12 }}>
              {["𝕏","in","◉"].map((icon,i)=>(<span key={i} style={{ width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"rgba(255,255,255,0.35)",cursor:"pointer",transition:"all 0.2s" }} onMouseEnter={e=>{e.target.style.color="#d4a574";e.target.style.borderColor="rgba(212,165,116,0.3)";}} onMouseLeave={e=>{e.target.style.color="rgba(255,255,255,0.35)";e.target.style.borderColor="rgba(255,255,255,0.06)";}}>{icon}</span>))}
            </div>
          </div>
        </div>
      </footer>

      <ChatAgent lang={lang} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 400px; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 4px 20px rgba(212,165,116,0.4); } 50% { box-shadow: 0 4px 32px rgba(212,165,116,0.7); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes corePulse { 0%,100% { r: 8; opacity: 0.8; } 50% { r: 11; opacity: 1; } }
        @keyframes sonarPing { 0% { r: 10; opacity: 0.4; stroke-width: 1.5; } 100% { r: 80; opacity: 0; stroke-width: 0.5; } }
        @keyframes labelFade { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes orbitPlatform0 { 0% { opacity: 1; transform: rotate(0deg) translateX(78px) rotate(0deg); } 100% { opacity: 1; transform: rotate(360deg) translateX(78px) rotate(-360deg); } }
        @keyframes orbitPlatform1 { 0% { opacity: 1; transform: rotate(72deg) translateX(78px) rotate(-72deg); } 100% { opacity: 1; transform: rotate(432deg) translateX(78px) rotate(-432deg); } }
        @keyframes orbitPlatform2 { 0% { opacity: 1; transform: rotate(144deg) translateX(78px) rotate(-144deg); } 100% { opacity: 1; transform: rotate(504deg) translateX(78px) rotate(-504deg); } }
        @keyframes orbitPlatform3 { 0% { opacity: 1; transform: rotate(216deg) translateX(78px) rotate(-216deg); } 100% { opacity: 1; transform: rotate(576deg) translateX(78px) rotate(-576deg); } }
        @keyframes orbitPlatform4 { 0% { opacity: 1; transform: rotate(288deg) translateX(78px) rotate(-288deg); } 100% { opacity: 1; transform: rotate(648deg) translateX(78px) rotate(-648deg); } }
        ::placeholder { color: rgba(255,255,255,0.22); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details > summary::before { content: "▸ "; color: #d4a574; }
        details[open] > summary::before { content: "▾ "; }
        @media (max-width: 640px) {
          .desk-nav { display: none !important; }
          .mob-btn { display: block !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .mob-btn { display: none !important; }
          .mob-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}

