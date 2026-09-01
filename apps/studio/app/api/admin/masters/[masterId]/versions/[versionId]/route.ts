import { slideDocumentSchema } from '@open-slide/document';
import { z } from 'zod';
import { requireAdmin, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ masterId: string; versionId: string }> };

const updateSchema = z
  .object({
    expectedRevision: z.number().int().nonnegative(),
    document: slideDocumentSchema,
  })
  .strict();

export async function PUT(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    verifyMutationRequest(request, session);
    const { masterId, versionId } = await context.params;
    const input = await parseJson(request, updateSchema);
    const version = await getStore().updateMasterDraft({
      actorId: session.id,
      masterId,
      versionId,
      ...input,
    });
    return Response.json({ version });
  } catch (error) {
    return handleRouteError(error);
  }
}
