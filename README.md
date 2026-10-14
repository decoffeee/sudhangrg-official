# Sudhan Gurung — Official Portfolio

Home page implemented from the Figma design (`q6WHeQGQPKZFgoNfWsOHKU`, node `242:1257`).

## Stack

- **Next.js 15 (App Router) + TypeScript** — statically prerendered, SEO-ready (metadata, Open Graph image, JSON-LD `Person`/`WebSite`/`ProfilePage`, `sitemap.xml`, `robots.txt`, semantic landmarks and headings).
- **CSS Modules** with design tokens in `src/app/globals.css`. Desktop geometry is expressed in design units (`--u = 100vw / 1728`) so the brush strokes line up with the photos exactly as in Figma; below 1024px every section switches to a flow layout.
- **Lenis** smooth scrolling synced to **GSAP ScrollTrigger**; **SplitText** (free since GSAP 3.13) for line/word/character text reveals.
- Fonts: Anton SC, Archivo Black, Archivo via `next/font`; Stack Sans Headline/Text via Google Fonts.

## Motion

- Hero intro: name characters rise through masks, subject slides up, nav/role lines stagger in, brush paints on load. Scroll-out parallax separates background, brush, name and subject.
- Every `-back` / `-front` photo pair (`ParallaxPair`) moves at different speeds (`data-parallax`); the red brush sits *between* the two layers, as in the design.
- Brush strokes (`Brush`) are the original SVGs revealed through a stroked SVG mask animated along the stroke's centre-line (`stroke-dashoffset`).
- Card rails are native horizontal scrollers with drag-to-scroll and a scroll-linked drift. The Gorkha district outline draws itself in; project markers pop in.
- Honors `prefers-reduced-motion`; all content is visible without JavaScript.

## Develop

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) for canonical/OG URLs in production.

## Content

All copy, cards, markers and links live in `src/data/content.ts`. Social URLs and the contact-form endpoint (`ContactForm.tsx`) are TODOs.
