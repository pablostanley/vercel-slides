import { z } from 'zod';
import { requireAdmin, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, jsonError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ masterId: string }> };

const updateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    category: z.string().trim().min(1).max(120).optional(),
    tags: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .strict();

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    const { masterId } = await context.params;
    const master = await getStore().getAdminMaster(session.id, masterId);
    if (!master) return jsonError(404, 'not_found', 'Master not found');
    return Response.json({ master });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    verifyMutationRequest(request, session);
    const { masterId } = await context.params;
    const input = await parseJson(request, updateSchema);
    const master = await getStore().updateMaster({ actorId: session.id, masterId, ...input });
    return Response.json({ master });
  } catch (error) {
    return handleRouteError(error);
  }
}
