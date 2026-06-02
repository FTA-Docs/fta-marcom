# alignd Design System

## Design Philosophy
- Grayscale-first: full high-fidelity in neutral grays, then skin with brand
- Token-driven: all values from CSS custom properties in tokens/
- Progressive enhancement: works without JS; animations layer on top
- WCAG 2.2 AA: keyboard nav, sufficient contrast, semantic HTML

## Token Architecture

### Structure Tokens (src/styles/tokens/structure.css) — IMMUTABLE during skinning
- Spacing: --space-1 through --space-24 (clamp-based fluid sizing)
- Grid: --grid-cols (12), --grid-gap
- Container: --container-max (1280px), --container-narrow (768px), --container-pad
- Z-index: --z-below (-1) through --z-modal (200)
- Transitions: --transition-fast (150ms), --transition-base (250ms), --transition-slow (400ms)
- Masthead height: --masthead-h (4rem mobile, 4.5rem desktop)

### Skin Tokens (src/styles/tokens/skin.css) — REPLACE during skinning
- Color palette: --gray-0 through --gray-1000
- Semantic colors: --color-bg, --color-surface, --color-text, --color-accent, etc.
- Masthead: --masthead-bg, --masthead-text, --masthead-border
- Footer: --footer-bg, --footer-text, etc.
- Typography: --font-body, --font-heading, --font-mono
- Type scale: --text-xs through --text-6xl (all fluid via clamp)
- Shadows: --shadow-sm through --shadow-xl

## Grid System
- 12-column CSS Grid
- Utility classes: .grid, .col-1 through .col-12
- Responsive: stacks to 1 column below 768px
- Gap: var(--grid-gap) fluid

## Breakpoints
- Mobile: < 768px (single column, stacked nav)
- Tablet: 768px – 1023px
- Desktop: 1024px+
- Wide: 1280px+

## Component Catalog
- Panel: full-bleed section (background variants: default, surface, raised, dark)
- Masthead: sticky header, logo left, nav right, hamburger mobile
- Footer: 3-column grid, collapses on mobile
- HorizontalScroller: GSAP-pinned horizontal, native scroll fallback
- Reveal: fade-in via IntersectionObserver (non-GSAP pages) or GSAP ScrollTrigger
- PricingBlock: 3-column pricing grid with featured tier highlight
- Accordion: accessible expand/collapse for FAQs
- Buttons: .btn base + --primary, --secondary, --ghost, --lg modifiers

## Animation System
- GSAP + ScrollTrigger: homepage ONLY (index.astro loads it async)
  - Hero parallax: y-translate on scroll
  - Horizontal sections: pinned horizontal scrub
  - Reveal: ScrollTrigger fade-ins
- IntersectionObserver: all other pages
  - [data-reveal] elements fade in when 10-15% visible
- prefers-reduced-motion: ALL motion disabled; static fallback shown
  - CSS: transitions set to 0.01ms in reset.css
  - JS: GSAP init skipped; IntersectionObserver still adds .is-revealed immediately

## Skinning Checklist (future)
- [ ] Confirm brand typefaces (add @font-face or CDN link in BaseLayout.astro head)
- [ ] Set --font-body and --font-heading in skin.css
- [ ] Define brand color palette (map to --gray-* or add new semantic tokens)
- [ ] Set --color-accent (primary CTA), --color-accent-hover, --color-accent-text
- [ ] Update --masthead-bg, --footer-bg as needed
- [ ] Review all shadow values for brand feel
- [ ] Test at all breakpoints
- [ ] Run WCAG contrast audit
