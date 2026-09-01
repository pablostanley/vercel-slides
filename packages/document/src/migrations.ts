import {
  SLIDE_HEIGHT,
  SLIDE_SCHEMA_VERSION,
  SLIDE_WIDTH,
  type SlideDocument,
  slideDocumentSchema,
} from './schema';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function migrateElement(element: unknown, index: number) {
  if (!isRecord(element)) {
    throw new Error(`Legacy element ${index} is not an object`);
  }
  const type = element.type;
  if (type !== 'text' && type !== 'shape' && type !== 'image') {
    throw new Error(`Legacy element type ${String(type)} cannot be migrated`);
  }
  const migrated = {
    id:
      typeof element.id === 'string' ? element.id : `element-${String(index + 1).padStart(3, '0')}`,
    x: typeof element.x === 'number' ? element.x : 0,
    y: typeof element.y === 'number' ? element.y : 0,
    width: typeof element.width === 'number' ? element.width : 100,
    height: typeof element.height === 'number' ? element.height : 100,
    rotation: typeof element.rotation === 'number' ? element.rotation : 0,
    opacity: typeof element.opacity === 'number' ? element.opacity : 1,
    visible: element.visible !== false,
    locked: element.locked === true,
    zIndex: typeof element.zIndex === 'number' ? element.zIndex : index,
    ...element,
  };
  if (type === 'text') {
    return {
      ...migrated,
      type,
      text: typeof element.text === 'string' ? element.text : '',
      style: isRecord(element.style)
        ? element.style
        : {
            fontFamily: 'geist-sans',
            fontSize: 48,
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: 0,
            color: '#000000',
            align: 'left',
            verticalAlign: 'top',
          },
    };
  }
  if (type === 'image') {
    return {
      ...migrated,
      type,
      src: typeof element.src === 'string' ? element.src : '',
      alt: typeof element.alt === 'string' ? element.alt : '',
      fit: element.fit ?? 'cover',
      style: isRecord(element.style) ? element.style : { strokeWidth: 0, radius: 0 },
    };
  }
  return {
    ...migrated,
    type,
    shape: element.shape ?? 'rectangle',
    style: isRecord(element.style) ? element.style : { fill: '#ffffff', strokeWidth: 0, radius: 0 },
  };
}

function migrateVersionZero(input: Record<string, unknown>): SlideDocument {
  const elements = Array.isArray(input.elements) ? input.elements : [];
  return slideDocumentSchema.parse({
    schemaVersion: SLIDE_SCHEMA_VERSION,
    id: typeof input.id === 'string' ? input.id : 'slide:migrated',
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    background: isRecord(input.background) ? input.background : { color: '#ffffff' },
    theme: isRecord(input.theme)
      ? input.theme
      : { colors: {}, fonts: { sans: 'geist-sans', mono: 'geist-mono' } },
    elements: elements.map(migrateElement),
    accessibility: isRecord(input.accessibility) ? input.accessibility : undefined,
  });
}

export function migrateSlideDocument(input: unknown): SlideDocument {
  if (!isRecord(input)) {
    throw new Error('Slide document must be an object');
  }
  const version = typeof input.schemaVersion === 'number' ? input.schemaVersion : 0;
  if (version === SLIDE_SCHEMA_VERSION) {
    return slideDocumentSchema.parse(input);
  }
  if (version === 0) {
    return migrateVersionZero(input);
  }
  throw new Error(`Unsupported slide schema version: ${version}`);
}
