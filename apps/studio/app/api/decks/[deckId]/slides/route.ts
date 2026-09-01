import {
  cloneMasterDocument,
  createBlankSlideDocument,
  slideDocumentSchema,
} from '@open-slide/document';
import { z } from 'zod';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, jsonError, parseJson } from '@/lib/server/http';

type Context = { params: Promise<{ deckId: string }> };

const mutationSchema = z.discriminatedUnion('operation', [
  z
    .object({
      operation: z.literal('update'),
      expectedRevision: z.number().int().nonnegative(),
      slideId: z.string().min(1).max(160),
      document: slideDocumentSchema.optional(),
      notes: z.string().max(100_000).optional(),
    })
    .strict()
    .refine((value) => value.document !== undefined || value.notes !== undefined, {
      message: 'A document or notes update is required',
    }),
  z
    .object({
      operation: z.literal('insert-master'),
      expectedRevision: z.number().int().nonnegative(),
      afterSlideId: z.string().min(1).max(160).nullable(),
      masterVersionId: z.string().min(1).max(160),
      slideId: z.string().min(1).max(160),
    })
    .strict(),
  z
    .object({
      operation: z.literal('insert-blank'),
      expectedRevision: z.number().int().nonnegative(),
      afterSlideId: z.string().min(1).max(160).nullable(),
      slideId: z.string().min(1).max(160),
    })
    .strict(),
  z
    .object({
      operation: z.literal('duplicate'),
      expectedRevision: z.number().int().nonnegative(),
      slideId: z.string().min(1).max(160),
      newSlideId: z.string().min(1).max(160),
    })
    .strict(),
  z
    .object({
      operation: z.literal('delete'),
      expectedRevision: z.number().int().nonnegative(),
      slideId: z.string().min(1).max(160),
    })
    .strict(),
  z
    .object({
      operation: z.literal('reorder'),
      expectedRevision: z.number().int().nonnegative(),
      slideIds: z.array(z.string().min(1).max(160)).max(1000),
    })
    .strict(),
  z
    .object({
      operation: z.literal('restore'),
      expectedRevision: z.number().int().nonnegative(),
      slides: z
        .array(
          z
            .object({
              id: z.string().min(1).max(160),
              document: slideDocumentSchema,
              notes: z.string().max(100_000),
              masterSlideId: z.string().min(1).max(160).nullable(),
              masterVersionId: z.string().min(1).max(160).nullable(),
            })
            .strict(),
        )
        .max(1000),
    })
    .strict(),
]);

function cloneDocument(document: Parameters<typeof cloneMasterDocument>[0], slideId: string) {
  return cloneMasterDocument(document, slideId, () => `element:${crypto.randomUUID()}`);
}

export async function PUT(request: Request, context: Context) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const { deckId } = await context.params;
    const input = await parseJson(request, mutationSchema);
    const store = getStore();
    if (input.operation === 'insert-master') {
      const master = await store.getPublishedMaster(session.id, input.masterVersionId);
      if (!master) return jsonError(404, 'not_found', 'Published master not found');
      const slideId = input.slideId;
      const access = await store.mutateDeckSlides({
        actorId: session.id,
        deckId,
        expectedRevision: input.expectedRevision,
        mutation: {
          operation: 'insert',
          slideId,
          afterSlideId: input.afterSlideId,
          document: cloneDocument(master.version.document, slideId),
          masterSlideId: master.id,
          masterVersionId: master.version.id,
        },
      });
      return Response.json({ access, selectedSlideId: slideId });
    }
    if (input.operation === 'insert-blank') {
      const slideId = input.slideId;
      const access = await store.mutateDeckSlides({
        actorId: session.id,
        deckId,
        expectedRevision: input.expectedRevision,
        mutation: {
          operation: 'insert',
          slideId,
          afterSlideId: input.afterSlideId,
          document: createBlankSlideDocument(slideId),
          masterSlideId: null,
          masterVersionId: null,
        },
      });
      return Response.json({ access, selectedSlideId: slideId });
    }
    if (input.operation === 'duplicate') {
      const current = await store.getDeckAccess(session.id, deckId);
      const source = current?.slides.find((slide) => slide.id === input.slideId);
      if (!source) return jsonError(404, 'not_found', 'Slide not found');
      const newSlideId = input.newSlideId;
      const access = await store.mutateDeckSlides({
        actorId: session.id,
        deckId,
        expectedRevision: input.expectedRevision,
        mutation: {
          operation: 'duplicate',
          slideId: input.slideId,
          newSlideId,
          document: cloneDocument(source.document, newSlideId),
        },
      });
      return Response.json({ access, selectedSlideId: newSlideId });
    }
    const access = await store.mutateDeckSlides({
      actorId: session.id,
      deckId,
      expectedRevision: input.expectedRevision,
      mutation: input,
    });
    return Response.json({ access });
  } catch (error) {
    return handleRouteError(error);
  }
}
