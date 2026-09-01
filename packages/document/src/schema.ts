import { z } from 'zod';

export const SLIDE_SCHEMA_VERSION = 1 as const;
export const SLIDE_WIDTH = 1920 as const;
export const SLIDE_HEIGHT = 1080 as const;

const idSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/);
const colorSchema = z.string().min(1).max(128);
const tokenBindingSchema = z
  .object({
    token: z.string().min(1).max(160),
    fallback: z.union([z.string(), z.number()]).optional(),
  })
  .strict();

const accessibilitySchema = z
  .object({
    label: z.string().max(500).optional(),
    description: z.string().max(2000).optional(),
    decorative: z.boolean().optional(),
  })
  .strict();

const baseElementShape = {
  id: idSchema,
  name: z.string().min(1).max(160).optional(),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().nonnegative(),
  height: z.number().finite().nonnegative(),
  rotation: z.number().finite().default(0),
  opacity: z.number().finite().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  zIndex: z.number().int().finite(),
  parentId: idSchema.nullable().optional(),
  bindings: z.record(z.string(), tokenBindingSchema).optional(),
  accessibility: accessibilitySchema.optional(),
};

const typographySchema = z
  .object({
    fontFamily: z.enum(['geist-sans', 'geist-mono']).default('geist-sans'),
    fontSize: z.number().finite().positive(),
    fontWeight: z.number().int().min(100).max(900).default(400),
    lineHeight: z.number().finite().positive().default(1.2),
    letterSpacing: z.number().finite().default(0),
    color: colorSchema,
    align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
    verticalAlign: z.enum(['top', 'middle', 'bottom']).default('top'),
  })
  .strict();

const boxStyleSchema = z
  .object({
    fill: colorSchema.optional(),
    stroke: colorSchema.optional(),
    strokeWidth: z.number().finite().nonnegative().default(0),
    radius: z.number().finite().nonnegative().default(0),
    shadow: z
      .object({
        color: colorSchema,
        x: z.number().finite(),
        y: z.number().finite(),
        blur: z.number().finite().nonnegative(),
        spread: z.number().finite(),
      })
      .strict()
      .optional(),
  })
  .strict();

const textSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('text'),
    text: z.string().max(50_000),
    style: typographySchema,
  })
  .strict();

const richTextRunSchema = z
  .object({
    text: z.string().max(50_000),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    code: z.boolean().optional(),
    color: colorSchema.optional(),
    link: z.string().url().optional(),
  })
  .strict();

const richTextSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('richText'),
    paragraphs: z
      .array(
        z
          .object({
            id: idSchema,
            runs: z.array(richTextRunSchema).max(1000),
            align: z.enum(['left', 'center', 'right', 'justify']).optional(),
          })
          .strict(),
      )
      .max(1000),
    style: typographySchema,
  })
  .strict();

const imageSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('image'),
    src: z.string().min(1).max(4000),
    alt: z.string().max(1000),
    fit: z.enum(['cover', 'contain', 'fill']).default('cover'),
    focalPoint: z
      .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
      .strict()
      .optional(),
    style: boxStyleSchema,
  })
  .strict();

const shapeSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('shape'),
    shape: z.enum(['rectangle', 'ellipse', 'triangle', 'diamond', 'pill']),
    style: boxStyleSchema,
  })
  .strict();

const lineSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('line'),
    stroke: colorSchema,
    strokeWidth: z.number().finite().positive(),
    dash: z.array(z.number().finite().nonnegative()).max(16).optional(),
    startMarker: z.enum(['none', 'arrow', 'dot']).default('none'),
    endMarker: z.enum(['none', 'arrow', 'dot']).default('none'),
  })
  .strict();

const groupSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('group'),
    childIds: z.array(idSchema).max(1000),
  })
  .strict();

const listSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('list'),
    ordered: z.boolean().default(false),
    items: z.array(z.string().max(10_000)).max(200),
    marker: z.enum(['disc', 'dash', 'number', 'check']).default('disc'),
    gap: z.number().finite().nonnegative().default(16),
    style: typographySchema,
  })
  .strict();

const metricSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('metric'),
    value: z.string().max(1000),
    label: z.string().max(5000),
    detail: z.string().max(5000).optional(),
    valueStyle: typographySchema,
    labelStyle: typographySchema,
  })
  .strict();

const tableCellSchema = z
  .object({
    value: z.string().max(10_000),
    colspan: z.number().int().positive().max(100).default(1),
    rowspan: z.number().int().positive().max(100).default(1),
  })
  .strict();

const tableSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('table'),
    columns: z.array(z.number().finite().positive()).min(1).max(100),
    rows: z.array(z.array(tableCellSchema).max(100)).max(1000),
    headerRows: z.number().int().min(0).max(100).default(1),
    style: z
      .object({
        text: typographySchema,
        headerText: typographySchema,
        fill: colorSchema,
        headerFill: colorSchema,
        border: colorSchema,
        borderWidth: z.number().finite().nonnegative(),
        padding: z.number().finite().nonnegative(),
      })
      .strict(),
  })
  .strict();

const chartSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('chart'),
    chart: z.enum(['bar', 'line', 'area', 'pie', 'donut']),
    categories: z.array(z.string().max(500)).max(500),
    series: z
      .array(
        z
          .object({
            id: idSchema,
            name: z.string().max(500),
            values: z.array(z.number().finite().nullable()).max(500),
            color: colorSchema,
          })
          .strict(),
      )
      .max(100),
    showLegend: z.boolean().default(true),
    showAxes: z.boolean().default(true),
    showGrid: z.boolean().default(true),
    style: boxStyleSchema,
  })
  .strict();

const codeSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('code'),
    code: z.string().max(200_000),
    language: z.string().min(1).max(100),
    theme: z.enum(['light', 'dark']),
    showLineNumbers: z.boolean().default(true),
    highlightedLines: z.array(z.number().int().positive()).max(10_000).default([]),
    style: boxStyleSchema,
  })
  .strict();

const logoSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('logo'),
    asset: z.enum(['vercel-mark', 'vercel-wordmark', 'partner-wordmark', 'custom']),
    src: z.string().max(4000).optional(),
    color: colorSchema.default('#000000'),
    alt: z.string().max(1000).default(''),
  })
  .strict();

const primitiveSchema = z
  .object({
    ...baseElementShape,
    type: z.literal('primitive'),
    primitive: z.enum(['grid', 'corner-mark', 'pixel-field', 'gradient-orb', 'brand-rail']),
    variant: z.string().max(160).optional(),
    colors: z.array(colorSchema).max(16).default([]),
    density: z.number().finite().min(0).max(100).default(1),
  })
  .strict();

export const slideElementSchema = z.discriminatedUnion('type', [
  textSchema,
  richTextSchema,
  imageSchema,
  shapeSchema,
  lineSchema,
  groupSchema,
  listSchema,
  metricSchema,
  tableSchema,
  chartSchema,
  codeSchema,
  logoSchema,
  primitiveSchema,
]);

export const slideThemeSchema = z
  .object({
    colors: z.record(z.string(), colorSchema).default({}),
    fonts: z
      .object({ sans: z.literal('geist-sans'), mono: z.literal('geist-mono') })
      .strict()
      .default({ sans: 'geist-sans', mono: 'geist-mono' }),
  })
  .strict();

export const slideDocumentSchema = z
  .object({
    schemaVersion: z.literal(SLIDE_SCHEMA_VERSION),
    id: idSchema,
    width: z.literal(SLIDE_WIDTH),
    height: z.literal(SLIDE_HEIGHT),
    background: z
      .object({
        color: colorSchema.default('#ffffff'),
        image: z.string().max(4000).optional(),
      })
      .strict(),
    theme: slideThemeSchema,
    elements: z.array(slideElementSchema).max(5000),
    accessibility: z
      .object({
        title: z.string().max(1000).optional(),
        description: z.string().max(5000).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((document, context) => {
    const ids = new Set<string>();
    for (const element of document.elements) {
      if (ids.has(element.id)) {
        context.addIssue({
          code: 'custom',
          path: ['elements'],
          message: `Duplicate element id: ${element.id}`,
        });
      }
      ids.add(element.id);
    }
    for (const element of document.elements) {
      if (element.parentId && !ids.has(element.parentId)) {
        context.addIssue({
          code: 'custom',
          path: ['elements'],
          message: `Missing parent element: ${element.parentId}`,
        });
      }
    }
  });

export type SlideElement = z.infer<typeof slideElementSchema>;
export type SlideDocument = z.infer<typeof slideDocumentSchema>;
export type TextElement = Extract<SlideElement, { type: 'text' }>;
export type ImageElement = Extract<SlideElement, { type: 'image' }>;
export type ShapeElement = Extract<SlideElement, { type: 'shape' }>;

export function createDocumentId(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`;
}

export function createBlankSlideDocument(id = createDocumentId('slide')): SlideDocument {
  return slideDocumentSchema.parse({
    schemaVersion: SLIDE_SCHEMA_VERSION,
    id,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    background: { color: '#ffffff' },
    theme: { colors: {}, fonts: { sans: 'geist-sans', mono: 'geist-mono' } },
    elements: [],
  });
}
