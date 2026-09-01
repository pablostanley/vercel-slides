import { type SlideDocument, slideDocumentSchema } from './schema';
import generatedCatalog from './vercel-master-documents.generated.json';

export const VERCEL_LIBRARY_ID = 'library:vercel';
export const VERCEL_MASTER_SEED_VERSION = 'vercel-masters-v1';

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

type GeneratedMaster = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  document: unknown;
};

const parsedCatalog = (generatedCatalog.masters as GeneratedMaster[]).map(
  (master, position): PublishedMasterDocument => ({
    id: `master:vercel:${master.slug}`,
    versionId: `master-version:vercel:${master.slug}:1`,
    version: 1,
    libraryId: VERCEL_LIBRARY_ID,
    slug: master.slug,
    title: master.title,
    description: `Vercel ${master.title.toLowerCase()} master slide`,
    category: master.category,
    tags: [...master.tags],
    position,
    document: slideDocumentSchema.parse(master.document),
  }),
);

export function createVercelMasterCatalog(): PublishedMasterDocument[] {
  return parsedCatalog.map((master) => ({
    ...master,
    tags: [...master.tags],
    document: structuredClone(master.document),
  }));
}

export const createPreviewMasterCatalog = createVercelMasterCatalog;
