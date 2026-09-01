import { createBlankSlideDocument } from '@open-slide/document';
import { z } from 'zod';
import { requireAdmin, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ librarySlug: string }> };

const mutationSchema = z.discriminatedUnion('operation', [
  z
    .object({
      operation: z.literal('create'),
      slug: z
        .string()
        .trim()
        .min(1)
        .max(120)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().max(1000),
      category: z.string().trim().min(1).max(120),
      tags: z.array(z.string().trim().min(1).max(80)).max(40),
    })
    .strict(),
  z
    .object({
      operation: z.literal('reorder'),
      masterIds: z.array(z.string().min(1).max(160)).max(1000),
    })
    .strict(),
]);

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    const { librarySlug } = await context.params;
    return Response.json({ masters: await getStore().listAdminMasters(session.id, librarySlug) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireAdmin();
    verifyMutationRequest(request, session);
    const { librarySlug } = await context.params;
    const input = await parseJson(request, mutationSchema);
    if (input.operation === 'reorder') {
      await getStore().reorderMasters(session.id, librarySlug, input.masterIds);
      return Response.json({ ok: true });
    }
    const masterId = `master:${crypto.randomUUID()}`;
    const master = await getStore().createMaster({
      actorId: session.id,
      librarySlug,
      id: masterId,
      versionId: `master-version:${crypto.randomUUID()}`,
      slug: input.slug,
      title: input.title,
      description: input.description,
      category: input.category,
      tags: input.tags,
      document: createBlankSlideDocument(`master-document:${crypto.randomUUID()}`),
    });
    return Response.json({ master }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
