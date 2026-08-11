# TODO

- [ ] **COM-B Venn diagram graphic.** Eric is finalizing an updated Venn diagram graphic for the About page COM-B panel (currently a coded/CSS Venn in `src/pages/about.astro`, not an image).
- [ ] **Technology panel graphic.** Eric is finalizing a new graphic for the About page Technology panel. Drop the final asset path into `content/about/page.json` under `technology.image` (placeholder currently shows "Graphic" in the panel's left-hand slot).
- [ ] **Self-host web fonts (GDPR).** Figtree and Lora currently load from `fonts.googleapis.com` (see `src/layouts/BaseLayout.astro`), which sends visitor IPs to Google — a German court ruled this a GDPR violation in 2022. If EU privacy compliance matters, self-host both fonts (e.g. `@fontsource/figtree` + `@fontsource/lora`) and remove the Google Fonts `<link>`/preconnect tags. Both fonts are SIL OFL — no licensing cost either way.
