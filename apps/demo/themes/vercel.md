---
name: Vercel
description: Internal Vercel presentation system — black canvas, white Geist type, precise rules, and canonical product assets.
mode: dark
---

# Vercel

## Palette

| Role       | Value     | Notes                                      |
| ---------- | --------- | ------------------------------------------ |
| bg         | `#000000` | primary canvas                             |
| surface    | `#111111` | quiet inset areas and screenshot frames    |
| text       | `#FFFFFF` | headlines, marks, primary copy             |
| muted      | `#A1A1A1` | supporting copy and captions               |
| faint      | `#666666` | tertiary metadata                          |
| hairline   | `#333333` | visible dividers and chart rules           |
| line       | `#1F1F1F` | structural grid and low-contrast borders   |
| blue       | `#0070F3` | product accent, links, selected data       |
| cyan       | `#50E3C2` | secondary data accent                      |
| amber      | `#F5A623` | warnings and highlighted timeline moments  |
| red        | `#E5484D` | destructive states and negative deltas     |
| green      | `#46A758` | positive states and confirmed outcomes     |

## Typography

- Display font: `'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` — use the bundled variable font, weight 600 for almost every headline, and reserve 700 for short statements only.
- Body font: `'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` — weight 400, with 500 for labels.
- Mono font: `'Geist Mono', 'SFMono-Regular', Consolas, monospace` — code, dates, labels, and chart metadata.
- Pixel font: `'Geist Pixel', 'Geist Mono', monospace` — rare decorative labels paired with Lil Pix or Geist pixel art.
- Type scale:
  - Hero title: 144 px, line-height 0.94, letter-spacing -0.06em.
  - Statement: 100 px, line-height 1.01, letter-spacing -0.055em.
  - Page heading: 70 px, line-height 1.04, letter-spacing -0.045em.
  - Subheading: 40 px, line-height 1.15, letter-spacing -0.035em.
  - Body: 32 px, line-height 1.4, letter-spacing -0.02em.
  - Caption: 22 px, line-height 1.35, letter-spacing -0.01em.
  - Mono label: 18 px, line-height 1.2, letter-spacing 0.04em.

## Layout

- Canvas: 1920 × 1080, always black unless a content asset intentionally fills the frame.
- Content padding: 120 px horizontal. Standard content begins at 112 px and clears the 88 px lower rail.
- Primary content width: 1680 px. Long-form body copy stays below 1160 px.
- Grid: 12 columns with 24 px gutters. Use hairlines to explain alignment or data structure, not as ambient decoration on every page.
- Alignment: predominantly left. Centered compositions are reserved for chapter breaks, quotes, and single-metric pages.
- Spacing follows a 4 px base. Default jumps are 24, 32, 48, 64, 96, and 120 px.
- Corners: 0 px by default; 8 px for screenshots and code surfaces; 999 px only for real status dots.
- Persistent anchors: 120 px canvas inset, brand mark at 60 px from the top, footer at 36 px from the bottom.
- Use exactly two brand modes: top-right for standard content; top-left for covers and partner presentations. Do not move these anchors slide by slide.
- Framed partner layouts use a 120 px inset hairline with 21 px crosshair markers at all four corners.
- Keep the bottom 88 px clear for the footer and the top 96 px clear when a header mark is present.

## Type rendering

- Bundle `@assets/vercel/fonts/GeistVF.woff2` and `GeistMonoVF.woff2`; do not depend on a system-installed Geist font.
- Register Geist Sans and Geist Mono once at module scope with variable ranges `100 900`.
- Apply `font-feature-settings: "rlig" 1, "calt" 0, "ss11" 1`, normal kerning, optical sizing, and antialiasing at the page root.
- Use tabular numerals for metrics, tables, dates, and page counters.
- Optical alignment wins over mathematical centering: marks, display numerals, and portrait crops may move a few pixels to look aligned with the type.

## Fixed components

### Canonical assets

The shared catalog lives under `@assets/vercel/` and was captured from `vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92`.

- Wordmarks and product marks: `@assets/vercel/logos/` — Vercel, Next.js, v0, AI SDK, AI Gateway, Eve, Workflow, Turbo, Turborepo, Turbopack, Geist, Flags, Fluid, Sandbox, Connect, Chat SDK, FX, Vercel OSS, and Vercel IRL. Use `*-dark.svg` on this theme.
- Lil Pix: `@assets/vercel/logos/logo-lil-pix-dark.svg`, success variant, plus `@assets/vercel/lil-pix/*.gif`.
- Geist pixels: `@assets/vercel/pixels/` — the complete current pixel set in dark and light variants.
- Fonts: `@assets/vercel/fonts/GeistVF.woff2`, `GeistMonoVF.woff2`, and `GeistPixel-Square.woff2`.

### Starter layout catalog

The reference deck contains 62 layouts: general and product covers, agenda, section divider, statement, title and body, bullets, two- and three-column arguments, quote, large metric, metric set, comparison, timeline, process, bar chart, data table, code, product screenshot, split image, full-bleed image, architecture, roadmap, launch reveal, session opener, team lineup, customer story, data story, recommendation, principles, risks and responses, option spectrum, progress rail, photo quote, weekly team update, executive partner cover, visual agenda, presenter roster, partnership stream divider, workstream matrix, partnership history, status triptych, proof collage, metric horizon, value bridge, six-step process grid, evidence-rich case study, dual trend, agent pipeline, risk landscape, use-case gallery, binary model, product demo, agent primitives, partner interstitial, product ecosystem, wordmark gallery, icon gallery, Geist pixel gallery, Lil Pix gallery, discussion, and closing.

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      margin: 0,
      maxWidth: 1500,
      color: '#FFFFFF',
      fontFamily: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 144,
      fontWeight: 600,
      lineHeight: 0.94,
      letterSpacing: '-0.06em',
    }}
  >
    {children}
  </h1>
);
```

### Footer

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = ({ label = 'Vercel' }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#666666',
        fontFamily: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
        fontSize: 17,
        lineHeight: 1,
        letterSpacing: '0.02em',
        fontFeatureSettings: '"tnum" 1, "ss11" 1',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#FFFFFF', fontSize: 14 }}>▲</span>
        {label}
      </span>
      <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};
```

### Eyebrow

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      color: '#A1A1A1',
      fontFamily: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
      fontSize: 19,
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }}
  >
    {children}
  </div>
);
```

## Motion

- Philosophy: subtle. Slides should feel edited, not animated.
- Use one 220 ms opacity-and-8 px rise for page entrances. Keep charts, logos, and structural rules still.
- Respect reduced motion by removing transforms and shortening fades to 1 ms.

```css
@keyframes vercel-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .vercel-enter { animation-duration: 1ms !important; transform: none !important; }
}
```

## Aesthetic

This is the internal Vercel presentation register: a black field, high-contrast Geist typography, disciplined margins, and a small amount of visible structure. Hierarchy comes from scale, weight, alignment, and monochrome contrast before color. Product marks are canonical assets, never redrawn. Use grid lines only when they carry information, keep screenshots crisp and flat, and ration blue or spectral product colors to a single focal idea. Avoid generic SaaS card walls, soft shadows, glass, decorative gradients, oversized rounded rectangles, emoji, and fake interface chrome.

## Example usage

```tsx
const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 40,
      padding: '96px 120px',
      background: '#000000',
      color: '#FFFFFF',
      fontFamily: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    }}
  >
    <Eyebrow>Internal · 2026</Eyebrow>
    <Title>Build what comes next.</Title>
    <p style={{ maxWidth: 1120, margin: 0, color: '#A1A1A1', fontSize: 32, lineHeight: 1.4 }}>
      A short subtitle with one clear job.
    </p>
    <Footer label="Vercel presentation" />
  </div>
);
```
