import { cloneMasterDocument } from '@open-slide/document';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, jsonError } from '@/lib/server/http';

type Context = { params: Promise<{ deckId: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const { deckId } = await context.params;
    const store = getStore();
    const source = await store.getDeckAccess(session.id, deckId);
    if (!source) return jsonError(404, 'not_found', 'Presentation not found');
    const deck = await store.createDeck({
      id: `deck:${crypto.randomUUID()}`,
      ownerId: session.id,
      title: `${source.deck.title} copy`,
      templateLibraryId: source.deck.templateLibraryId,
      slides: source.slides.map((slide) => {
        const id = `slide:${crypto.randomUUID()}`;
        return {
          id,
          document: cloneMasterDocument(slide.document, id, () => `element:${crypto.randomUUID()}`),
          notes: slide.notes,
          masterSlideId: slide.masterSlideId,
          masterVersionId: slide.masterVersionId,
        };
      }),
    });
    return Response.json({ deck }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
