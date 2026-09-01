import { z } from 'zod';
import { requireAdmin, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ masterId: string }> };

const draftSchema = z.object({ sourceVersionId: z.string().min(1).max(160) }).strict();

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    verifyMutationRequest(request, session);
    const { masterId } = await context.params;
    const input = await parseJson(request, draftSchema);
    const version = await getStore().createMasterDraft({
      actorId: session.id,
      masterId,
      versionId: `master-version:${crypto.randomUUID()}`,
      sourceVersionId: input.sourceVersionId,
    });
    return Response.json({ version }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
