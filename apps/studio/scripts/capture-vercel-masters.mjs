import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { VERCEL_MASTER_DEFINITIONS } from '../../../packages/document/src/vercel-master-definitions.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '../../..');
const demoUrl = process.env.OPEN_SLIDE_DEMO_URL ?? 'http://localhost:5173/s/vercel-starter';
const outputPath = resolve(
  repositoryRoot,
  process.env.VERCEL_MASTER_OUTPUT ??
    'packages/document/src/vercel-master-documents.generated.json',
);
const reportPath = resolve(
  repositoryRoot,
  process.env.VERCEL_MASTER_REPORT ??
    'packages/document/src/vercel-master-migration-report.generated.json',
);
const screenshotDirectory = process.env.VERCEL_MASTER_SCREENSHOTS;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: 'reduce',
});

try {
  await page.goto(demoUrl, { waitUntil: 'networkidle' });
  await page.locator('[data-osd-canvas="true"]').first().waitFor();
  if (screenshotDirectory) await mkdir(screenshotDirectory, { recursive: true });

  const masters = [];
  const report = [];

  for (const [index, definition] of VERCEL_MASTER_DEFINITIONS.entries()) {
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-osd-canvas="true"]')].some(
        (element) => element.getBoundingClientRect().width > 1000,
      ),
    );
    const selectedCanvas = page.locator('[data-osd-canvas="true"]').filter({
      has: page.locator('[data-slide-loc]'),
    });
    const canvasCount = await selectedCanvas.count();
    let selectedIndex = -1;
    for (let candidate = 0; candidate < canvasCount; candidate += 1) {
      if ((await selectedCanvas.nth(candidate).boundingBox())?.width > 1000) {
        selectedIndex = candidate;
        break;
      }
    }
    if (selectedIndex < 0) throw new Error(`Could not locate source canvas ${index + 1}`);
    const activeCanvas = selectedCanvas.nth(selectedIndex);

    const captured = await activeCanvas.evaluate(
      (root, input) => {
        const { slug } = input;
        const canvasRect = root.getBoundingClientRect();
        const scaleX = canvasRect.width / 1920;
        const scaleY = canvasRect.height / 1080;
        let zIndex = 1;
        let elementIndex = 1;
        const elements = [];
        const unsupported = new Set();
        const skipped = new Set();
        const round = (value) => Math.round(value * 1000) / 1000;

        function elementId(kind) {
          const id = `master:vercel:${slug}:element:${elementIndex}:${kind}`;
          elementIndex += 1;
          return id;
        }

        function visibleRect(rect) {
          return (
            rect.width > 0.5 &&
            rect.height > 0.5 &&
            rect.right > canvasRect.left &&
            rect.bottom > canvasRect.top &&
            rect.left < canvasRect.right &&
            rect.top < canvasRect.bottom
          );
        }

        function rotationFor(element) {
          const transform = getComputedStyle(element).transform;
          if (!transform || transform === 'none') return 0;
          const matrix = new DOMMatrixReadOnly(transform);
          return round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
        }

        function geometry(element, rect = element.getBoundingClientRect()) {
          const rotation = rotationFor(element);
          if (Math.abs(rotation) > 0.01) {
            const width = element.offsetWidth || rect.width / scaleX;
            const height = element.offsetHeight || rect.height / scaleY;
            const centerX = (rect.left + rect.width / 2 - canvasRect.left) / scaleX;
            const centerY = (rect.top + rect.height / 2 - canvasRect.top) / scaleY;
            return {
              x: round(centerX - width / 2),
              y: round(centerY - height / 2),
              width: round(width),
              height: round(height),
              rotation,
            };
          }
          return {
            x: round((rect.left - canvasRect.left) / scaleX),
            y: round((rect.top - canvasRect.top) / scaleY),
            width: round(rect.width / scaleX),
            height: round(rect.height / scaleY),
            rotation: 0,
          };
        }

        function effectiveOpacity(element) {
          let opacity = 1;
          let current = element;
          while (current && current !== root) {
            opacity *= Number.parseFloat(getComputedStyle(current).opacity || '1');
            current = current.parentElement;
          }
          return round(Math.max(0, Math.min(1, opacity)));
        }

        function colorVisible(value) {
          if (value === 'transparent') return false;
          const legacyAlpha = value.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)$/);
          const modernAlpha = value.match(/\/\s*([\d.]+)%?\s*\)$/);
          if (legacyAlpha) return Number.parseFloat(legacyAlpha[1]) > 0;
          if (modernAlpha) return Number.parseFloat(modernAlpha[1]) > 0;
          return true;
        }

        function parsePixels(value) {
          const parsed = Number.parseFloat(value);
          return Number.isFinite(parsed) ? parsed : 0;
        }

        function fontFamily(style) {
          const family = style.fontFamily.toLowerCase();
          if (family.includes('pixel')) return 'geist-pixel';
          if (family.includes('mono')) return 'geist-mono';
          return 'geist-sans';
        }

        function textValue(node, style) {
          let value = node.textContent ?? '';
          if (style.whiteSpace === 'normal' || style.whiteSpace === 'nowrap') {
            value = value.replace(/\s+/g, ' ');
          }
          value = value.trim();
          if (style.textTransform === 'uppercase') value = value.toUpperCase();
          if (style.textTransform === 'lowercase') value = value.toLowerCase();
          return value;
        }

        function typography(style) {
          const fontSize = Math.max(1, parsePixels(style.fontSize));
          const lineHeightPixels = parsePixels(style.lineHeight);
          const weight = Number.parseInt(style.fontWeight, 10);
          return {
            fontFamily: fontFamily(style),
            fontSize: round(fontSize),
            fontWeight: Number.isFinite(weight) ? Math.max(100, Math.min(900, weight)) : 400,
            lineHeight: round(lineHeightPixels > 0 ? lineHeightPixels / fontSize : 1.2),
            letterSpacing: round(parsePixels(style.letterSpacing)),
            color: style.color,
            align: ['center', 'right', 'justify'].includes(style.textAlign)
              ? style.textAlign
              : 'left',
            verticalAlign: 'top',
          };
        }

        function base(element, kind, rect = element.getBoundingClientRect()) {
          return {
            id: elementId(kind),
            ...geometry(element, rect),
            opacity: effectiveOpacity(element),
            visible: true,
            locked: false,
            zIndex: zIndex++,
          };
        }

        function backgroundPaint(style) {
          const hasImage = style.backgroundImage && style.backgroundImage !== 'none';
          const hasColor = colorVisible(style.backgroundColor);
          if (!hasImage) return hasColor ? style.backgroundColor : undefined;
          const color = hasColor ? `${style.backgroundColor} ` : '';
          return `${color}${style.backgroundImage} ${style.backgroundPosition} / ${style.backgroundSize} ${style.backgroundRepeat}`;
        }

        function addBox(element) {
          const rect = element.getBoundingClientRect();
          if (!visibleRect(rect)) return;
          const style = getComputedStyle(element);
          const fill = backgroundPaint(style);
          const borderWidths = [
            parsePixels(style.borderTopWidth),
            parsePixels(style.borderRightWidth),
            parsePixels(style.borderBottomWidth),
            parsePixels(style.borderLeftWidth),
          ];
          const borderColors = [
            style.borderTopColor,
            style.borderRightColor,
            style.borderBottomColor,
            style.borderLeftColor,
          ];
          const uniformBorder =
            borderWidths.every((width) => width === borderWidths[0]) &&
            borderColors.every((color) => color === borderColors[0]);
          const clipPath = style.clipPath !== 'none' ? style.clipPath : undefined;
          const isFullBackground =
            rect.width / scaleX > 1919 &&
            rect.height / scaleY > 1079 &&
            !clipPath &&
            borderWidths.every((width) => width === 0);

          if ((fill || (uniformBorder && borderWidths[0] > 0)) && !isFullBackground) {
            elements.push({
              ...base(element, 'shape', rect),
              type: 'shape',
              shape: style.borderRadius === '50%' ? 'ellipse' : 'rectangle',
              ...(clipPath ? { clipPath } : {}),
              style: {
                ...(fill ? { fill } : {}),
                ...(uniformBorder && borderWidths[0] > 0
                  ? { stroke: borderColors[0], strokeWidth: round(borderWidths[0]) }
                  : { strokeWidth: 0 }),
                radius: round(parsePixels(style.borderTopLeftRadius)),
              },
            });
          }

          if (!uniformBorder) {
            const box = geometry(element, rect);
            const sides = [
              {
                width: box.width,
                height: borderWidths[0],
                x: box.x,
                y: box.y,
                color: borderColors[0],
              },
              {
                width: borderWidths[1],
                height: box.height,
                x: box.x + box.width - borderWidths[1],
                y: box.y,
                color: borderColors[1],
              },
              {
                width: box.width,
                height: borderWidths[2],
                x: box.x,
                y: box.y + box.height - borderWidths[2],
                color: borderColors[2],
              },
              {
                width: borderWidths[3],
                height: box.height,
                x: box.x,
                y: box.y,
                color: borderColors[3],
              },
            ];
            for (const side of sides) {
              if (side.width <= 0 || side.height <= 0 || !colorVisible(side.color)) continue;
              elements.push({
                id: elementId('border'),
                type: 'shape',
                shape: 'rectangle',
                x: round(side.x),
                y: round(side.y),
                width: round(side.width),
                height: round(side.height),
                rotation: 0,
                opacity: effectiveOpacity(element),
                visible: true,
                locked: false,
                zIndex: zIndex++,
                style: { fill: side.color, strokeWidth: 0, radius: 0 },
              });
            }
          }

          if (style.filter !== 'none') unsupported.add(`filter:${style.filter}`);
          if (style.maskImage && style.maskImage !== 'none') {
            unsupported.add(`mask-image:${style.maskImage}`);
          }
          const before = getComputedStyle(element, '::before');
          const after = getComputedStyle(element, '::after');
          if (before.content !== 'none' && before.content !== 'normal')
            unsupported.add('pseudo-element');
          if (after.content !== 'none' && after.content !== 'normal')
            unsupported.add('pseudo-element');
        }

        function addText(element, node) {
          const style = getComputedStyle(element);
          const value = textValue(node, style);
          if (!value) return;
          const range = document.createRange();
          range.selectNodeContents(node);
          const rangeRect = range.getBoundingClientRect();
          if (!visibleRect(rangeRect)) return;
          const elementRect = element.getBoundingClientRect();
          const aligned = ['center', 'right', 'justify'].includes(style.textAlign);
          const rect = aligned ? elementRect : rangeRect;
          const lineHeight = parsePixels(style.lineHeight) || parsePixels(style.fontSize) * 1.2;
          const geometryValue = geometry(element, rect);
          elements.push({
            id: elementId('text'),
            type: 'text',
            text: value,
            ...geometryValue,
            height: round(Math.max(geometryValue.height + lineHeight * 0.24, lineHeight * 1.1)),
            opacity: effectiveOpacity(element),
            visible: true,
            locked: false,
            zIndex: zIndex++,
            style: typography(style),
          });
        }

        function isInlineTextContainer(element) {
          if (!element.textContent?.trim() || element.children.length === 0) return false;
          return [...element.children].every((child) => {
            if (child.tagName === 'BR') return true;
            if (child instanceof HTMLImageElement || child instanceof SVGElement) return false;
            return ['inline', 'inline-block'].includes(getComputedStyle(child).display);
          });
        }

        function addRichText(element) {
          const rect = element.getBoundingClientRect();
          if (!visibleRect(rect)) return;
          const elementStyle = getComputedStyle(element);
          const baseTypography = typography(elementStyle);
          const runs = [];

          function appendRun(node) {
            if (node instanceof HTMLBRElement) {
              runs.push({ text: '\n' });
              return;
            }
            if (node.nodeType === Node.TEXT_NODE) {
              const parent = node.parentElement ?? element;
              const style = getComputedStyle(parent);
              let text = node.textContent ?? '';
              if (style.whiteSpace === 'normal' || style.whiteSpace === 'nowrap') {
                text = text.replace(/\s+/g, ' ');
              }
              if (!text) return;
              const weight = Number.parseInt(style.fontWeight, 10);
              const run = { text };
              if (style.color !== baseTypography.color) run.color = style.color;
              if (style.fontStyle === 'italic' || style.fontStyle === 'oblique') run.italic = true;
              if (style.textDecorationLine.includes('underline')) run.underline = true;
              if (
                fontFamily(style) === 'geist-mono' &&
                baseTypography.fontFamily !== 'geist-mono'
              ) {
                run.code = true;
              }
              if (Number.isFinite(weight) && weight !== baseTypography.fontWeight) {
                run.fontWeight = Math.max(100, Math.min(900, weight));
              }
              const previous = runs.at(-1);
              const signature = ({ text: _text, ...properties }) => JSON.stringify(properties);
              if (previous && signature(previous) === signature(run)) previous.text += run.text;
              else runs.push(run);
              return;
            }
            for (const child of node.childNodes) appendRun(child);
          }

          for (const child of element.childNodes) appendRun(child);
          const capturedBase = base(element, 'rich-text', rect);
          elements.push({
            ...capturedBase,
            type: 'richText',
            paragraphs: [
              {
                id: `${capturedBase.id}:paragraph:1`,
                runs: runs.map((run, runIndex) => ({
                  id: `${capturedBase.id}:run:${runIndex + 1}`,
                  ...run,
                })),
                align: baseTypography.align,
              },
            ],
            style: baseTypography,
          });
        }

        function addImage(element) {
          const rect = element.getBoundingClientRect();
          if (!visibleRect(rect)) return;
          const source = element.currentSrc || element.src;
          const assetMarker = '/apps/demo/assets/vercel/';
          const assetIndex = decodeURIComponent(source).indexOf(assetMarker);
          const src =
            assetIndex >= 0
              ? `/assets/vercel/${decodeURIComponent(source).slice(assetIndex + assetMarker.length)}`
              : source;
          const style = getComputedStyle(element);
          elements.push({
            ...base(element, 'image', rect),
            type: 'image',
            src,
            alt: element.alt ?? '',
            fit: ['contain', 'fill'].includes(style.objectFit) ? style.objectFit : 'cover',
            style: {
              strokeWidth: 0,
              radius: round(parsePixels(style.borderTopLeftRadius)),
            },
          });
        }

        function addSvg(element) {
          const rect = element.getBoundingClientRect();
          if (!visibleRect(rect)) return;
          const serialized = new XMLSerializer().serializeToString(element);
          const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
          elements.push({
            ...base(element, 'svg', rect),
            type: 'image',
            src,
            alt: element.getAttribute('aria-label') ?? '',
            fit: 'fill',
            style: { strokeWidth: 0, radius: 0 },
          });
        }

        function visit(element) {
          if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) return;
          if (['STYLE', 'SCRIPT', 'NOSCRIPT'].includes(element.tagName)) return;
          if (element instanceof HTMLCanvasElement || element instanceof HTMLVideoElement) {
            unsupported.add(element.tagName.toLowerCase());
            return;
          }
          if (element instanceof HTMLImageElement) {
            addImage(element);
            return;
          }
          if (element instanceof SVGSVGElement) {
            addSvg(element);
            return;
          }
          if (element instanceof HTMLElement) {
            addBox(element);
            if (isInlineTextContainer(element)) {
              addRichText(element);
              return;
            }
          }
          for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && element instanceof HTMLElement) {
              addText(element, node);
            } else if (node instanceof Element) {
              visit(node);
            }
          }
        }

        const slideRoot = root.querySelector(':scope > [data-slide-loc]') ?? root.firstElementChild;
        if (!slideRoot) throw new Error('Slide root not found');
        const slideStyle = getComputedStyle(slideRoot);
        const background = colorVisible(slideStyle.backgroundColor)
          ? slideStyle.backgroundColor
          : getComputedStyle(root).backgroundColor;
        visit(slideRoot);
        const boundedElements = elements.filter((element) => {
          const inBounds =
            element.x + element.width > -1 &&
            element.y + element.height > -1 &&
            element.x < 1921 &&
            element.y < 1081;
          if (!inBounds) skipped.add(element.type);
          return inBounds;
        });
        return {
          document: {
            schemaVersion: 1,
            id: `master:vercel:${slug}:document:1`,
            width: 1920,
            height: 1080,
            background: { color: background },
            elements: boundedElements,
            theme: {
              colors: {
                background,
                foreground: slideStyle.color,
                accent: '#0070F3',
              },
              fonts: { sans: 'geist-sans', mono: 'geist-mono' },
            },
            accessibility: { title: `Vercel ${slug} master` },
          },
          unsupported: [...unsupported].sort(),
          skipped: [...skipped].sort(),
        };
      },
      { slug: definition.slug },
    );

    masters.push({ ...definition, document: captured.document });
    report.push({
      position: index,
      slug: definition.slug,
      elementCount: captured.document.elements.length,
      unsupported: captured.unsupported,
      skipped: captured.skipped,
    });

    if (screenshotDirectory) {
      await activeCanvas.screenshot({
        path: resolve(
          screenshotDirectory,
          `${String(index + 1).padStart(2, '0')}-${definition.slug}.png`,
        ),
        animations: 'disabled',
      });
    }

    if (index < VERCEL_MASTER_DEFINITIONS.length - 1) {
      const previousText = await activeCanvas.innerText();
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(
        (text) =>
          [...document.querySelectorAll('[data-osd-canvas="true"]')].some(
            (element) =>
              element.getBoundingClientRect().width > 1000 && element.textContent !== text,
          ),
        previousText,
      );
    }
  }

  const payload = {
    source: 'apps/demo/slides/vercel-starter/index.tsx',
    sourceRevision: 1,
    schemaVersion: 1,
    masters,
  };
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        source: payload.source,
        schemaVersion: payload.schemaVersion,
        masterCount: masters.length,
        unsupportedMasterCount: report.filter((entry) => entry.unsupported.length > 0).length,
        masters: report,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Captured ${masters.length} Vercel masters to ${outputPath}`);
} finally {
  await browser.close();
}
