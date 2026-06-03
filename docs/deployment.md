# Deployment

## How it works

This repo is connected to Vercel. Every push to `main` triggers an automatic build and deployment — no manual steps required.

- **Live URL:** https://marcom.fta.care
- **Vercel project:** fta-marcom (under jranft's personal Vercel account)
- **GitHub repo:** github.com/FTA-Docs/fta-marcom (public)

## Making changes

1. Edit files locally (see [Content Editing](#content-editing) below)
2. Commit and push to `main`
3. Vercel builds and deploys automatically — live within ~1 minute

## Content editing

Most updates don't require touching any code — edit the files in `content/`:

| What | File |
|---|---|
| Nav, CTAs, footer | `content/site.json` |
| Homepage sections | `content/home.json` |
| About page | `content/about/` |
| FAQs | `content/faqs.json` |
| Legal pages | `content/legal/` |

## DNS

`marcom.fta.care` is a Cloudflare CNAME pointing to `cname.vercel-dns.com`. SSL is managed by Vercel automatically.

## Local development

```bash
npm install
npm run dev
```

Site runs at http://localhost:4321.
