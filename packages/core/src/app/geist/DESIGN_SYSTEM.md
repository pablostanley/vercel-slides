# Geistcn source

The presentation workspace is pinned to `vercel/front@c87cb58834a5479f805511a046b86c5741425064`
(`2026-09-01T00:45:03Z`).

## Vendored sources

- `base.css`: `packages/geistcn/src/styles/themes/base.css`
- `dark.css`: `packages/geistcn/src/styles/themes/dark.css`
- `tailwind.css`: `packages/geistcn/src/styles/tailwind.css`
- `fonts/GeistVF.woff2`: `packages/geistcn/src/fonts/GeistVF.woff2`
- `fonts/GeistMonoVF.woff2`: `packages/geistcn/src/fonts/GeistMonoVF.woff2`
- `components/vercel-mark.tsx`: `packages/geistcn-assets/src/logos/named/logo-icon-vercel-svg.tsx`
- `components/geist-icons.tsx`: selected `packages/geistcn-assets/src/icons/named/icon-*.tsx`

At this pin, `@vercel/geistcn` is `1.0.3` and `@vercel/geistcn-assets` is `2.0.1`.

The upstream Tailwind engine and preflight imports are omitted from the vendored `tailwind.css` because open-slide already owns those layers in `styles.css`. The Geist compatibility graph loads before the Geist Tailwind token layer, matching upstream order. App aliases such as `background`, `foreground`, `muted`, and `brand` resolve to canonical `--ds-*` values so existing runtime components can migrate without a second token graph.

Refresh all vendored files from one fetched `origin/main` commit. Do not mix component, asset, font, or token versions.
