import { z } from 'zod';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, jsonError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ deckId: string }> };

const updateDeckSchema = z
  .object({
    expectedRevision: z.number().int().nonnegative(),
    title: z.string().trim().min(1).max(200).optional(),
    visibility: z.enum(['private', 'team', 'link']).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .strict();

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { deckId } = await context.params;
    const access = await getStore().getDeckAccess(session.id, deckId);
    if (!access) return jsonError(404, 'not_found', 'Presentation not found');
    return Response.json(access);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const { deckId } = await context.params;
    const input = await parseJson(request, updateDeckSchema);
    const deck = await getStore().updateDeck({ ...input, actorId: session.id, deckId });
    return Response.json({ deck });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const { deckId } = await context.params;
    await getStore().deleteDeck(session.id, deckId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
