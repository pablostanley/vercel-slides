import { z } from 'zod';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ deckId: string }> };

const shareSchema = z
  .object({ email: z.string().email(), role: z.enum(['viewer', 'editor']) })
  .strict();
const unshareSchema = z.object({ email: z.string().email() }).strict();

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { deckId } = await context.params;
    return Response.json({ members: await getStore().listMembers(session.id, deckId) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const { deckId } = await context.params;
    const input = await parseJson(request, shareSchema);
    const member = await getStore().shareDeck({ ...input, actorId: session.id, deckId });
    return Response.json({ member });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const { deckId } = await context.params;
    const input = await parseJson(request, unshareSchema);
    await getStore().unshareDeck(session.id, deckId, input.email);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
