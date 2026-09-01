import { type SlideDocument, slideDocumentSchema } from './schema';
import { createVercelStarterDocuments } from './starter';

export const VERCEL_LIBRARY_ID = 'library:vercel';

export type PublishedMasterDocument = {
  id: string;
  versionId: string;
  version: number;
  libraryId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  position: number;
  document: SlideDocument;
};

const starterMetadata = [
  ['cover', 'Cover — What will you ship?', 'Covers', ['cover', 'title', 'opening']],
  ['agenda', 'Agenda — Numbered list', 'Agenda', ['agenda', 'contents', 'numbered']],
  ['section', 'Section — Numbered divider', 'Sections', ['section', 'divider', 'chapter']],
  ['title-body', 'Content — Title and body', 'Content', ['content', 'title', 'body']],
  ['data-bars', 'Data — Bar chart', 'Data', ['data', 'chart', 'metrics']],
  ['decision', 'Comparison — Decision', 'Comparison', ['comparison', 'decision', 'options']],
  ['closing', 'Closing — Thank you', 'Closing', ['closing', 'thank you', 'questions']],
] as const;

function stableDocument(document: SlideDocument, slug: string) {
  const elementIds = new Map(
    document.elements.map((element, index) => [
      element.id,
      `master:vercel:${slug}:element:${index + 1}`,
    ]),
  );
  return slideDocumentSchema.parse({
    ...document,
    id: `master:vercel:${slug}:document:1`,
    elements: document.elements.map((element) => ({
      ...element,
      id: elementIds.get(element.id),
      parentId: element.parentId ? elementIds.get(element.parentId) : element.parentId,
      ...(element.type === 'group'
        ? { childIds: element.childIds.map((id) => elementIds.get(id) ?? id) }
        : {}),
      ...(element.type === 'chart'
        ? {
            series: element.series.map((series, seriesIndex) => ({
              ...series,
              id: `master:vercel:${slug}:series:${seriesIndex + 1}`,
            })),
          }
        : {}),
    })),
  });
}

export function createPreviewMasterCatalog(): PublishedMasterDocument[] {
  return createVercelStarterDocuments().map((document, index) => {
    const [slug, title, category, tags] = starterMetadata[index];
    return {
      id: `master:vercel:${slug}`,
      versionId: `master-version:vercel:${slug}:1`,
      version: 1,
      libraryId: VERCEL_LIBRARY_ID,
      slug,
      title,
      description: `Vercel ${category.toLowerCase()} master slide`,
      category,
      tags: [...tags],
      position: index,
      document: stableDocument(document, slug),
    };
  });
}
