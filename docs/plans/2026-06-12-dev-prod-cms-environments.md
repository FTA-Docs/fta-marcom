# Dev/Prod CMS Environment Design

## Goal

Two deployed environments for the alignd marcom site:

| | Branch | URL | CMS |
|---|---|---|---|
| **Production** | `main` | marcom.fta.care | disabled |
| **Dev/Staging** | `dev` | marcom-dev.fta.care | enabled |

Content writers use the CMS at `marcom-dev.fta.care/admin/index.html`, log in with their GitHub accounts, make changes that commit to `dev`, preview them live, then signal readiness. Joe opens a PR from `dev` → `main` on GitHub, reviews, and merges — Vercel deploys to production automatically.

## Auth Approach

Decap CMS uses GitHub OAuth. Since the site is hosted on Vercel (not Netlify), a small OAuth proxy is deployed alongside the site as two Vercel serverless functions:

- `api/auth.js` — initiates the GitHub OAuth flow
- `api/callback.js` — handles the GitHub callback and returns a token to Decap CMS

A GitHub OAuth App (created in the FTA-Docs org) provides the Client ID and Secret, stored as Vercel env vars on the `dev` deployment only.

Access control: add/remove GitHub repo collaborators to grant or revoke CMS edit access.

## Implementation Steps

1. **Create `dev` branch** from current `2026-06-11-CMS` branch
2. **Vercel** — create a new project (or deployment) for the `dev` branch; assign custom domain `marcom-dev.fta.care`
3. **Cloudflare** — add CNAME: `marcom-dev` → Vercel-assigned hostname
4. **GitHub OAuth App** — create in org settings; callback URL: `https://marcom-dev.fta.care/api/callback`
5. **OAuth proxy** — add `api/auth.js` and `api/callback.js` to `dev` branch
6. **Decap config on `dev`** — update `public/admin/config.yml`: switch from `local_backend` to `github` backend pointing at `dev` branch, auth endpoint at `/api`
7. **Disable CMS on `main`** — update `public/admin/config.yml` on `main` to remove working backend
8. **Vercel env vars** — add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to the dev deployment only

## Promotion Workflow

```
writer saves in CMS
  → commits to dev branch
  → Vercel rebuilds marcom-dev.fta.care automatically
  → writer previews, iterates
  → signals ready
  → Joe opens PR: dev → main on GitHub
  → reviews diff
  → merges
  → Vercel deploys to marcom.fta.care
```

## What Is NOT Automated

- The PR open/merge step is manual (intentional — Joe reviews before production)
- DNS record in Cloudflare (one-time manual step)
- GitHub OAuth App creation (one-time manual step, requires org admin)

## Files Changed

| File | Branch | Change |
|---|---|---|
| `public/admin/config.yml` | `dev` | Switch to GitHub backend, point at `dev` branch |
| `public/admin/config.yml` | `main` | Remove working backend (disable CMS) |
| `api/auth.js` | `dev` | New — OAuth proxy initiation |
| `api/callback.js` | `dev` | New — OAuth proxy callback |
