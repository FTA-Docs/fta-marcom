# consent.alignd.care

Friends & Family testing consent form ([fta-marcom#32](https://github.com/FTA-Docs/fta-marcom/issues/32)).
A Cloudflare Worker serves the static pages in `public/` and writes each signed consent to a D1 database.
It is separate from the Astro site, and Vercel doesn't build it.

- `public/index.html`: full agreement and sign form (styles mirror `src/styles/tokens/skin.css`)
- `public/thanks.html`: thank-you page, links to www.alignd.care
- `src/worker.js`: `POST /api/consent` validates the form and inserts into `consents`
- `schema.sql`: the `consents` table (name, email, timestamp, agreement version + SHA-256 of the page shown, IP, country, UA)

## Local
    npm install
    npm run db:init:local
    npm run dev            # http://localhost:8787

## First deploy
    npx wrangler d1 create alignd-consent      # paste database_id into wrangler.jsonc
    npm run db:init:remote
    # uncomment the consent.alignd.care route in wrangler.jsonc
    npm run deploy

## Records
    npm run records

## Changing the agreement text
Edit `public/index.html` and bump `AGREEMENT_VERSION` in `wrangler.jsonc` so new signatures are tied to the new text.
