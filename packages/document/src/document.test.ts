import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  cloneMasterDocument,
  commitHistory,
  createBlankSlideDocument,
  createHistory,
  createVercelStarterDocuments,
  migrateSlideDocument,
  redoHistory,
  SlideRenderer,
  slideDocumentSchema,
  undoHistory,
} from './index';

describe('slide document schema', () => {
  it('accepts a trusted 1920x1080 scene graph and rejects executable element types', () => {
    const document = createBlankSlideDocument('slide:test');
    expect(slideDocumentSchema.parse(document)).toEqual(document);
    expect(() =>
      slideDocumentSchema.parse({
        ...document,
        elements: [
          {
            id: 'script:1',
            type: 'javascript',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            zIndex: 0,
            source: 'alert(1)',
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects duplicate element ids and missing group parents', () => {
    const document = createBlankSlideDocument('slide:test');
    const text = {
      id: 'text:1',
      type: 'text' as const,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      text: 'Hello',
      style: {
        fontFamily: 'geist-sans' as const,
        fontSize: 48,
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: 0,
        color: '#000000',
        align: 'left' as const,
        verticalAlign: 'top' as const,
      },
    };
    expect(() => slideDocumentSchema.parse({ ...document, elements: [text, text] })).toThrow(
      'Duplicate element id',
    );
    expect(() =>
      slideDocumentSchema.parse({
        ...document,
        elements: [{ ...text, parentId: 'group:missing' }],
      }),
    ).toThrow('Missing parent element');
  });
});

describe('document migrations', () => {
  it('migrates legacy text deterministically', () => {
    const legacy = {
      id: 'slide:legacy',
      elements: [{ type: 'text', text: 'Legacy', x: 20, y: 40, width: 400, height: 80 }],
    };
    const first = migrateSlideDocument(legacy);
    const second = migrateSlideDocument(legacy);
    expect(first).toEqual(second);
    expect(first.schemaVersion).toBe(1);
    expect(first.elements[0]?.id).toBe('element-001');
  });
});

describe('history helpers', () => {
  it('commits, undoes, and redoes independent snapshots', () => {
    const history = commitHistory(createHistory({ title: 'One' }), { title: 'Two' });
    const undone = undoHistory(history);
    expect(undone.present.title).toBe('One');
    expect(redoHistory(undone).present.title).toBe('Two');
  });
});

describe('template cloning', () => {
  it('deep-copies a master and remaps element relationships', () => {
    const master = createBlankSlideDocument('master:cover');
    master.elements = [
      {
        id: 'group:hero',
        type: 'group',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0,
        childIds: ['text:title'],
      },
      {
        id: 'text:title',
        type: 'text',
        parentId: 'group:hero',
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        text: 'Title',
        style: {
          fontFamily: 'geist-sans',
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: 0,
          color: '#000000',
          align: 'left',
          verticalAlign: 'top',
        },
      },
    ];
    const clone = cloneMasterDocument(master, 'slide:new', (id) => `copy:${id}`);
    expect(clone.id).toBe('slide:new');
    expect(clone.elements[0]).toMatchObject({
      id: 'copy:group:hero',
      childIds: ['copy:text:title'],
    });
    expect(clone.elements[1]).toMatchObject({ id: 'copy:text:title', parentId: 'copy:group:hero' });
    clone.elements[1] = { ...clone.elements[1], x: 200 };
    expect(master.elements[1]?.x).toBe(0);
  });
});

describe('Vercel starter', () => {
  it('creates the curated seven-slide sequence as valid independent documents', () => {
    const documents = createVercelStarterDocuments();
    expect(documents).toHaveLength(7);
    expect(new Set(documents.map((document) => document.id)).size).toBe(7);
    for (const document of documents) expect(slideDocumentSchema.parse(document)).toEqual(document);
  });
});

describe('scene renderer', () => {
  it('renders trusted text without interpreting it as markup', () => {
    const document = createVercelStarterDocuments()[0];
    const first = document.elements.find((element) => element.type === 'text');
    if (first?.type !== 'text') throw new Error('Expected seeded text');
    first.text = '<script>alert(1)</script>';
    const markup = renderToStaticMarkup(createElement(SlideRenderer, { document }));
    expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(markup).not.toContain('<script>');
  });
});
