import { z } from 'zod';
import { requireAdmin, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ masterId: string }> };

const duplicateSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    verifyMutationRequest(request, session);
    const { masterId } = await context.params;
    const input = await parseJson(request, duplicateSchema);
    const master = await getStore().duplicateMaster(
      session.id,
      masterId,
      `master:${crypto.randomUUID()}`,
      `master-version:${crypto.randomUUID()}`,
      input.slug,
    );
    return Response.json({ master }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
