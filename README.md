# Bayyina.ai — Deployment Guide (Netlify)

## Project Structure

```
bayyina-deploy/
├── index.html                 # Entry HTML with meta tags, OG, fonts
├── package.json               # Dependencies (React + Vite)
├── vite.config.js             # Vite build config
├── netlify.toml               # Netlify build + function config
├── .env.example               # Environment variable template
├── .gitignore
├── public/
│   └── favicon.svg            # بـ favicon
├── src/
│   ├── main.jsx               # React mount
│   └── App.jsx                # Full Bayyina.ai application
└── netlify/
    └── functions/
        ├── audit.js           # AI audit proxy (Anthropic API)
        └── chat.js            # Chat agent proxy (Anthropic API)
```

---

## Step 1: Prerequisites

- **Node.js 20+** — Download from https://nodejs.org
- **Git** — https://git-scm.com
- **Netlify account** — Free at https://app.netlify.com/signup
- **Anthropic API key** — Get one at https://console.anthropic.com/settings/keys
- **Your domain** — e.g. `bayyina.ai` or `audit.bayyina.ai`

---

## Step 2: Local Setup

```bash
# Navigate to the project
cd bayyina-deploy

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and paste your Anthropic API key
```

---

## Step 3: Test Locally

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run local dev server with functions
netlify dev
```

This starts:
- Vite dev server on port 3000
- Netlify Functions on `/.netlify/functions/*`
- Opens http://localhost:8888 (Netlify's unified proxy)

Test the full flow: lead gate → audit form → loading → results → chat agent.

---

## Step 4: Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Bayyina.ai — initial deploy"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bayyina-ai.git
git branch -M main
git push -u origin main
```

---

## Step 5: Deploy to Netlify

### Option A: Via Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account and select the `bayyina-ai` repo
4. Netlify auto-detects the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Click **"Deploy site"**

### Option B: Via CLI

```bash
# Link to Netlify
netlify login
netlify init

# Deploy
netlify deploy --prod
```

---

## Step 6: Set Environment Variable

**Critical** — the API key must be set on Netlify, not just locally.

1. In Netlify dashboard → your site → **Site configuration** → **Environment variables**
2. Add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-xxxxxxxxxxxxxxxx`
3. Click **Save**
4. **Redeploy** the site (Deploys → Trigger deploy → Deploy site)

---

## Step 7: Connect Custom Domain

### In Netlify:

1. Go to **Domain management** → **Add a domain**
2. Enter your domain: `bayyina.ai` (or `audit.bayyina.ai` for a subdomain)
3. Netlify will show you the required DNS records

### At Your DNS Provider:

**For apex domain (bayyina.ai):**

| Type | Name | Value                        |
|------|------|------------------------------|
| A    | @    | 75.2.60.5                    |

**For subdomain (audit.bayyina.ai):**

| Type  | Name  | Value                                    |
|-------|-------|------------------------------------------|
| CNAME | audit | your-site-name.netlify.app               |

> The exact Netlify IP / CNAME will be shown in your dashboard.
> DNS propagation takes 5 minutes to 48 hours (usually under 30 min).

### SSL Certificate:

Netlify provisions a free Let's Encrypt SSL certificate automatically once DNS is verified. No action needed — HTTPS just works.

---

## Step 8: Verify Everything Works

1. Visit `https://bayyina.ai` (or your chosen domain)
2. Test the full flow:
   - ✅ Hero page loads with animations
   - ✅ Lead gate accepts business emails only
   - ✅ Audit form shows query examples per industry
   - ✅ Loading radar animation plays during analysis
   - ✅ Results appear in English with Arabic toggle
   - ✅ KPI tooltips show benchmarks without clipping
   - ✅ PDF download works
   - ✅ One-time trial gate blocks second audit
   - ✅ Chat agent responds
   - ✅ All sections scroll smoothly
   - ✅ Mobile responsive

---

## Ongoing Maintenance

### Redeploying
Any push to `main` on GitHub triggers an automatic redeploy on Netlify.

### Monitoring
- **Netlify Analytics** — Built-in, privacy-friendly (paid add-on)
- **Function logs** — Dashboard → Functions → select function → View logs

### API Cost Control
The Anthropic API charges per token. To control costs:
- The audit uses `claude-sonnet-4-20250514` with `max_tokens: 16000`
- The chat uses `max_tokens: 800`
- The one-time trial gate limits free usage
- Consider adding rate limiting via Netlify Edge Functions for production scale

### Upgrading Netlify Plan
- **Free tier**: 125K function invocations/month, 10s function timeout
- **Pro ($19/mo)**: 125K invocations, 26s timeout — recommended for audit function
- **For 60s audit timeout**: You may need Netlify's Background Functions (Pro+)

> **Important**: The free tier's 10s function timeout may not be enough for the
> audit function (which can take 15-30s). Upgrading to Pro is recommended for
> production. Alternatively, you can convert `audit.js` to a background function
> by renaming it to `audit-background.js` — background functions get up to 15
> minutes but return immediately with a 202 status (requires polling for results).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "API key not configured" | Set `ANTHROPIC_API_KEY` in Netlify environment variables and redeploy |
| Audit times out | Upgrade to Netlify Pro for 26s timeout, or use background functions |
| CORS errors | The function headers already handle CORS — check browser console for the actual error |
| Blank page after deploy | Check build logs in Netlify dashboard — usually a missing dependency |
| DNS not resolving | Wait up to 48h; verify records with `dig bayyina.ai` or https://dnschecker.org |
| Chat agent not responding | Check function logs in Netlify dashboard → Functions |

---

## Files You May Want to Customize

- `index.html` — Update OG image path, meta descriptions
- `public/favicon.svg` — Replace with your actual brand favicon
- `public/og-image.png` — Create a 1200×630 OG image for social sharing
- `src/App.jsx` — All application logic and content
