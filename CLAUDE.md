# alignd.care — Claude Code Project Guide

## Project Overview

- Company: Family Technology Advisors, Inc. (brand: alignd)
- Stack: Astro static site, custom CSS Grid, GSAP for homepage animations
- Deploy: Vercel (static output)
- Site URL: https://alignd.care

## Architecture

- Content-first: all copy lives in content/ JSON and MD files; markup never contains hardcoded copy
- Grayscale-first: full design in neutral grays; brand colors/fonts are a "skin" applied later
- Token split: structure.css (layout — NEVER change during skinning) vs skin.css (visual — replace during skinning)
- GSAP loaded ONLY on homepage (index.astro); other pages use IntersectionObserver

## File Locations

- Design tokens: src/styles/tokens/{structure,skin}.css
- Global styles: src/styles/global.css
- Components: src/components/
- Layouts: src/layouts/BaseLayout.astro
- Pages: src/pages/
- Content: content/ (site.json, home.json, about.md, faqs.json, legal/)

## Token Conventions

- Use ONLY token variables in CSS — never hard-code colors, font sizes, or spacing values
- Structure tokens: --space-*, --grid-*, --container-*, --radius-*, --z-*, --transition-*, --masthead-h
- Skin tokens: --gray-*, --color-*, --font-*, --weight-*, --text-*, --leading-*, --tracking-*, --shadow-*
- When skinning: edit ONLY src/styles/tokens/skin.css; layout must not change

## Component Conventions

- Panel.astro: full-bleed section wrapper; use for every homepage/page section
- Reveal.astro: fade-in wrapper; add data-reveal attribute via component
- HorizontalScroller.astro: GSAP-driven horizontal scroll; fallback is native overflow-x scroll
- Masthead.astro and Footer.astro: read from content/site.json

## SEO / A11Y Rules

- One h1 per page only — in the hero or page header
- All interactive elements must be keyboard-navigable
- All images must have alt text
- Respect prefers-reduced-motion: GSAP skips on reduced-motion, IntersectionObserver still runs
- JSON-LD, OG tags, Twitter cards all set in BaseLayout.astro via props

## Content Editing

- Nav items, CTAs, footer → content/site.json
- Homepage sections → content/home.json
- About page copy → content/about.md
- FAQs → content/faqs.json
- Legal pages → content/legal/{terms,privacy}.md

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build to dist/
- `npm run preview` — preview production build

## Skinning Workflow (when ready)

1. Edit ONLY src/styles/tokens/skin.css
2. Replace --font-body, --font-heading with brand font families
3. Replace --color-accent and related semantic color tokens
4. Add @font-face or Google Fonts link in BaseLayout.astro head
5. Test at all breakpoints — layout must not change
