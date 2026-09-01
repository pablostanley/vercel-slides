import { type SlideDocument, slideDocumentSchema } from './schema';

export function cloneMasterDocument(
  source: SlideDocument,
  slideId: string,
  createElementId: (sourceId: string) => string,
): SlideDocument {
  const elementIds = new Map(
    source.elements.map((element) => [element.id, createElementId(element.id)]),
  );
  return slideDocumentSchema.parse({
    ...structuredClone(source),
    id: slideId,
    elements: source.elements.map((element) => ({
      ...structuredClone(element),
      id: elementIds.get(element.id),
      parentId: element.parentId ? elementIds.get(element.parentId) : element.parentId,
      ...(element.type === 'group'
        ? { childIds: element.childIds.map((childId) => elementIds.get(childId) ?? childId) }
        : {}),
    })),
  });
}
