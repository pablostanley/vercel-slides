import {
  ALLOWED_ASSET_CONTENT_TYPES,
  uploadPathname,
  uploadPayloadSchema,
} from '@/lib/server/asset-upload';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError } from '@/lib/server/http';
import { StoreError } from '@/lib/server/store';

const MAX_TEST_ASSET_SIZE = 32 * 1024;

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.STUDIO_TEST_AUTH !== '1') {
      return new Response(null, { status: 404 });
    }
    const session = await requireSession();
    verifyMutationRequest(request, session);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new StoreError('invalid', 'An image file is required');
    if (
      !ALLOWED_ASSET_CONTENT_TYPES.includes(
        file.type as (typeof ALLOWED_ASSET_CONTENT_TYPES)[number],
      ) ||
      file.size > MAX_TEST_ASSET_SIZE
    ) {
      throw new StoreError('invalid', 'The test image type or size is invalid');
    }
    const payload = uploadPayloadSchema.parse({
      deckId: form.get('deckId'),
      size: file.size,
      width: Number(form.get('width')),
      height: Number(form.get('height')),
    });
    const access = await getStore().getDeckAccess(session.id, payload.deckId);
    if (!access || access.role === 'viewer') {
      throw new StoreError('forbidden', 'Upload access denied');
    }
    const url = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;
    await getStore().recordAsset({
      id: `asset:${crypto.randomUUID()}`,
      ownerId: session.id,
      deckId: payload.deckId,
      blobUrl: url,
      pathname: uploadPathname(session.id, payload.deckId, file.name),
      contentType: file.type,
      width: payload.width,
      height: payload.height,
      size: file.size,
    });
    return Response.json({ url });
  } catch (error) {
    return handleRouteError(error);
  }
}
