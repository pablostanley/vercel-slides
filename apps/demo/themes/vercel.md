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

- Display font: `'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` — weight 600 for almost every headline; reserve 700 for short statements and big numbers.
- Body font: `'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` — weight 400, with 500 for labels.
- Mono font: `'Geist Mono', 'SFMono-Regular', Consolas, monospace` — code, dates, labels, and chart metadata.
- Pixel font: `'Geist Pixel', 'Geist Mono', monospace` — rare decorative labels paired with Lil Pix or Geist pixel art.
- Type scale:
  - Hero title: 152 px, line-height 0.96, letter-spacing -0.055em.
  - Statement: 96 px, line-height 1.02, letter-spacing -0.05em.
  - Page heading: 72 px, line-height 1.08, letter-spacing -0.04em.
  - Subheading: 44 px, line-height 1.2, letter-spacing -0.03em.
  - Body: 34 px, line-height 1.45, letter-spacing -0.02em.
  - Caption: 22 px, line-height 1.35, letter-spacing -0.01em.
  - Mono label: 18 px, line-height 1.2, letter-spacing 0.04em.

## Layout

- Canvas: 1920 × 1080, always black unless a content asset intentionally fills the frame.
- Content padding: 120 px horizontal and 96 px vertical.
- Primary content width: 1680 px. Long-form body copy stays below 1160 px.
- Grid: 12 columns with 24 px gutters. Use hairlines to explain alignment or data structure, not as ambient decoration on every page.
- Alignment: predominantly left. Centered compositions are reserved for chapter breaks, quotes, and single-metric pages.
- Spacing follows a 4 px base. Default jumps are 24, 32, 48, 64, 96, and 120 px.
- Corners: 0 px by default; 8 px for screenshots and code surfaces; 999 px only for real status dots.
- Keep the bottom 64 px clear for the footer and the top 64 px clear when a header mark is present.

## Fixed components

### Canonical assets

The shared catalog lives under `@assets/vercel/` and was captured from `vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92`.

- Wordmarks and product marks: `@assets/vercel/logos/` — Vercel, Next.js, v0, AI SDK, AI Gateway, Eve, Workflow, Turbo, Turborepo, Turbopack, Geist, Flags, Fluid, Sandbox, Connect, Chat SDK, FX, Vercel OSS, and Vercel IRL. Use `*-dark.svg` on this theme.
- Lil Pix: `@assets/vercel/logos/logo-lil-pix-dark.svg`, success variant, plus `@assets/vercel/lil-pix/*.gif`.
- Geist pixels: `@assets/vercel/pixels/` — the complete current pixel set in dark and light variants.
- Geist Pixel: `@assets/vercel/fonts/GeistPixel-Square.woff2`.

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      margin: 0,
      maxWidth: 1500,
      color: '#FFFFFF',
      fontFamily: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 152,
      fontWeight: 600,
      lineHeight: 0.96,
      letterSpacing: '-0.055em',
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
        bottom: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#666666',
        fontFamily: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
        fontSize: 18,
        lineHeight: 1,
        letterSpacing: '0.04em',
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
      fontSize: 18,
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.04em',
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
    <p style={{ maxWidth: 1120, margin: 0, color: '#A1A1A1', fontSize: 34, lineHeight: 1.45 }}>
      A short subtitle with one clear job.
    </p>
    <Footer label="Vercel presentation" />
  </div>
);
```
