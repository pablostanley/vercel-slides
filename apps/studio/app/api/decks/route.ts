import { createVercelStarterDocuments } from '@open-slide/document';
import { z } from 'zod';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

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
    const documents = input.source === 'vercel-starter' ? createVercelStarterDocuments() : [];
    const deck = await getStore().createDeck({
      id: `deck:${crypto.randomUUID()}`,
      ownerId: session.id,
      title: input.title,
      templateLibraryId: 'library:vercel',
      slides: documents.map((document) => {
        const id = `slide:${crypto.randomUUID()}`;
        return {
          id,
          document: { ...document, id },
          notes: '',
          masterSlideId: null,
          masterVersionId: null,
        };
      }),
    });
    return Response.json({ deck, source: input.source }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
