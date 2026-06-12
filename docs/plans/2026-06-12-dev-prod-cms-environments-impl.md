# Dev/Prod CMS Environments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Two deployed environments — `marcom.fta.care` (production, CMS disabled) and `marcom-dev.fta.care` (staging, CMS enabled with GitHub OAuth) — so content writers can edit via Decap CMS on dev and Joe promotes to production via GitHub PR.

**Architecture:** `dev` branch gets a Vercel deployment at `marcom-dev.fta.care` with two serverless API routes acting as a GitHub OAuth proxy. Decap CMS on `dev` authenticates writers via GitHub OAuth through that proxy and commits directly to the `dev` branch. `main` has no working OAuth proxy so the CMS is inert in production.

**Tech Stack:** Astro static site, Decap CMS, Vercel serverless functions (Node.js), GitHub OAuth, Cloudflare DNS

---

## Notes on Testing

This plan is infrastructure/config — there are no unit tests. Each task has a **Verify** step instead: run a specific command or open a URL and confirm the expected result before moving on.

---

## Task 1: Create the `dev` branch

**Files:**
- No file changes — branch operation only

**Step 1: Create and push `dev` from current CMS branch**

```bash
git checkout -b dev
git push -u origin dev
```

**Step 2: Verify**

```bash
git branch -a | grep dev
```
Expected: see `* dev` locally and `remotes/origin/dev`

**Step 3: Commit**

Nothing to commit — branch creation only.

---

## Task 2: Add OAuth proxy API routes

These two Vercel serverless functions handle the GitHub OAuth handshake so Decap CMS can authenticate writers without them needing to set up anything beyond a GitHub account.

**Files:**
- Create: `api/auth.js`
- Create: `api/callback.js`

**Step 1: Create `api/auth.js`**

```js
export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
```

**Step 2: Create `api/callback.js`**

```js
export default async function handler(req, res) {
  const { code } = req.query;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await tokenRes.json();
  const token = data.access_token;

  if (!token) {
    res.status(401).send('OAuth error: ' + (data.error || 'unknown'));
    return;
  }

  const message = `authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html><html><body><script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })()
  </script></body></html>`);
}
```

**Step 3: Verify files exist**

```bash
ls api/
```
Expected: `auth.js  callback.js`

**Step 4: Commit**

```bash
git add api/auth.js api/callback.js
git commit -m "feat: add GitHub OAuth proxy for Decap CMS"
```

---

## Task 3: Update Decap CMS config for the `dev` deployment

Switch `public/admin/config.yml` from `local_backend` mode to the real GitHub backend pointing at the `dev` branch and using our OAuth proxy.

**Files:**
- Modify: `public/admin/config.yml`

**Step 1: Replace the backend section**

Change the top of `public/admin/config.yml` from:

```yaml
backend:
  name: git-gateway

local_backend: true
```

To:

```yaml
backend:
  name: github
  repo: FTA-Docs/fta-marcom
  branch: dev
  base_url: https://marcom-dev.fta.care/api

local_backend: false
```

Leave everything else (media_folder, collections, etc.) unchanged.

**Step 2: Verify**

```bash
head -6 public/admin/config.yml
```
Expected output:
```
backend:
  name: github
  repo: FTA-Docs/fta-marcom
  branch: dev
  base_url: https://marcom-dev.fta.care/api

```

**Step 3: Commit**

```bash
git add public/admin/config.yml
git commit -m "feat: configure Decap CMS for dev GitHub backend"
```

**Step 4: Push `dev` branch**

```bash
git push origin dev
```

---

## Task 4: Manual — Create GitHub OAuth App

> This step is done in the browser. No code changes.

1. Go to: `https://github.com/organizations/FTA-Docs/settings/applications`
   (or your personal settings if the repo is under your account)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `alignd CMS (dev)`
   - **Homepage URL:** `https://marcom-dev.fta.care`
   - **Authorization callback URL:** `https://marcom-dev.fta.care/api/callback`
4. Click **Register application**
5. On the next screen, copy the **Client ID**
6. Click **Generate a new client secret** and copy the **Client Secret**
7. Keep these — you'll need them in Task 6

---

## Task 5: Manual — Set up Vercel dev deployment

> Done in the Vercel dashboard. No code changes.

**Option A — if `fta-marcom` is already a Vercel project pointing at `main`:**

1. In Vercel dashboard, open the `fta-marcom` project
2. Go to **Settings → Git**
3. Under **Production Branch**, confirm it is `main`
4. Vercel automatically creates preview deployments for other branches — the `dev` branch will get an auto-generated URL (e.g. `fta-marcom-git-dev-fta-docs.vercel.app`)
5. Go to **Settings → Domains**
6. Add `marcom-dev.fta.care` — Vercel will show you a DNS record to add
7. Set the domain to track the `dev` branch (not production)

**Option B — if you want a fully separate Vercel project for dev:**

1. In Vercel dashboard, click **Add New Project**
2. Import `FTA-Docs/fta-marcom` again
3. Under **Production Branch**, set it to `dev`
4. Deploy
5. Add `marcom-dev.fta.care` as a custom domain

**Verify:** After deployment, `https://marcom-dev.fta.care` should load the site (may take a few minutes for DNS to propagate).

---

## Task 6: Manual — Add Cloudflare DNS record

> Done in Cloudflare dashboard. No code changes.

1. Log in to Cloudflare, select the `fta.care` zone
2. Go to **DNS → Records → Add record**
3. Fill in:
   - **Type:** `CNAME`
   - **Name:** `marcom-dev`
   - **Target:** the Vercel hostname shown in the Vercel domain settings (e.g. `cname.vercel-dns.com` or the specific deployment hostname)
   - **Proxy status:** **DNS only** (grey cloud — Vercel handles SSL)
4. Save

**Verify:**

```bash
dig marcom-dev.fta.care CNAME +short
```
Expected: the Vercel hostname (may take 1–5 minutes to propagate)

---

## Task 7: Manual — Add env vars to Vercel dev deployment

> Done in Vercel dashboard. No code changes.

1. In Vercel, open the dev deployment/project
2. Go to **Settings → Environment Variables**
3. Add:
   - `GITHUB_CLIENT_ID` = (value from Task 4) — Environment: **Preview** and/or **Production** of the dev project
   - `GITHUB_CLIENT_SECRET` = (value from Task 4) — same
4. **Redeploy** the `dev` branch so the new env vars take effect:
   - In Vercel dashboard → Deployments → find the `dev` deployment → **Redeploy**
   - Or push a trivial commit to `dev`

**Verify:**

Visit `https://marcom-dev.fta.care/api/auth` in a browser.
Expected: redirects you to GitHub's OAuth authorization page.

---

## Task 8: Disable CMS on `main` branch

Switch back to `main` and remove the working local backend config so the CMS is inert in production.

**Files:**
- Modify: `public/admin/config.yml` (on `main` branch)

**Step 1: Switch to main**

```bash
git checkout main
```

**Step 2: Update `public/admin/config.yml`**

Replace:
```yaml
backend:
  name: git-gateway

local_backend: true
```

With:
```yaml
backend:
  name: github
  repo: FTA-Docs/fta-marcom
  branch: main
```

This removes `local_backend: true` (so it won't work locally either) and removes the `base_url` (so there's no OAuth proxy — CMS login will fail in production, which is intentional).

**Step 3: Verify**

```bash
head -5 public/admin/config.yml
```
Expected:
```
backend:
  name: github
  repo: FTA-Docs/fta-marcom
  branch: main
```

**Step 4: Commit and push**

```bash
git add public/admin/config.yml
git commit -m "chore: disable CMS in production (no OAuth proxy on main)"
git push origin main
```

---

## Task 9: End-to-end verification

**Step 1: Test dev CMS login**

1. Open `https://marcom-dev.fta.care/admin/index.html`
2. Click **Login with GitHub**
3. Expected: redirected to GitHub OAuth page
4. Authorize the app
5. Expected: redirected back to Decap CMS, logged in, collections visible

**Step 2: Test a content edit**

1. In the CMS, edit any field (e.g. a FAQ answer)
2. Click **Publish**
3. Expected: commit appears in `https://github.com/FTA-Docs/fta-marcom/commits/dev`
4. Vercel should auto-rebuild `marcom-dev.fta.care` within ~30 seconds

**Step 3: Confirm production CMS is disabled**

1. Open `https://marcom.fta.care/admin/index.html`
2. Click **Login with GitHub**
3. Expected: OAuth flow fails / hangs (no proxy on production) — the site itself should still load fine

**Step 4: Test promotion flow**

1. On GitHub, open a PR from `dev` → `main`
2. Confirm the diff shows only the content change from Step 2
3. Merge
4. Expected: Vercel deploys to `marcom.fta.care` with the updated content

---

## Summary of Manual Steps Required (in order)

1. Task 4 — Create GitHub OAuth App in `FTA-Docs` org → get Client ID + Secret
2. Task 5 — Add `marcom-dev` custom domain to Vercel dev deployment
3. Task 6 — Add `marcom-dev` CNAME record in Cloudflare
4. Task 7 — Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars in Vercel, redeploy
