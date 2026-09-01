import { cloneMasterDocument } from '@open-slide/document';
import { z } from 'zod';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, jsonError, parseJson } from '@/lib/server/http';

const createDeckSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    source: z.enum(['blank', 'vercel-starter']),
  })
  .strict();

export async function GET() {
  try {
    const session = await requireSession();
    return Response.json({ decks: await getStore().listDecks(session.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const input = await parseJson(request, createDeckSchema);
    const store = getStore();
    const starterSlugs = [
      'cover',
      'agenda',
      'section',
      'title-body',
      'data-bars',
      'decision',
      'closing',
    ];
    const masters =
      input.source === 'vercel-starter'
        ? (await store.listPublishedMasters(session.id, 'vercel'))
            .filter((master) => starterSlugs.includes(master.slug))
            .sort(
              (left, right) => starterSlugs.indexOf(left.slug) - starterSlugs.indexOf(right.slug),
            )
        : [];
    if (input.source === 'vercel-starter' && masters.length !== starterSlugs.length) {
      return jsonError(503, 'template_unavailable', 'The published Vercel Starter is not ready');
    }
    const deck = await store.createDeck({
      id: `deck:${crypto.randomUUID()}`,
      ownerId: session.id,
      title: input.title,
      templateLibraryId: 'library:vercel',
      slides: masters.map((master) => {
        const id = `slide:${crypto.randomUUID()}`;
        return {
          id,
          document: cloneMasterDocument(
            master.version.document,
            id,
            () => `element:${crypto.randomUUID()}`,
          ),
          notes: '',
          masterSlideId: master.id,
          masterVersionId: master.version.id,
        };
      }),
    });
    return Response.json({ deck, source: input.source }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
