import { z } from 'zod';
import { requireAdmin, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ masterId: string; versionId: string }> };

const publishSchema = z.object({ expectedRevision: z.number().int().nonnegative() }).strict();

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    verifyMutationRequest(request, session);
    const { masterId, versionId } = await context.params;
    const input = await parseJson(request, publishSchema);
    const master = await getStore().publishMaster({
      actorId: session.id,
      masterId,
      versionId,
      expectedRevision: input.expectedRevision,
    });
    return Response.json({ master });
  } catch (error) {
    return handleRouteError(error);
  }
}
