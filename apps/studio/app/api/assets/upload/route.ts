import { type HandleUploadBody, handleUpload } from '@vercel/blob/client';
import { z } from 'zod';
import {
  ALLOWED_ASSET_CONTENT_TYPES,
  isAllowedUploadPath,
  MAX_ASSET_SIZE,
  uploadPayloadSchema,
} from '@/lib/server/asset-upload';
import { requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError } from '@/lib/server/http';
import { StoreError } from '@/lib/server/store';

type TokenPayload = {
  ownerId: string;
  deckId: string;
  size: number;
  width: number | null;
  height: number | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    let tokenIdentity: TokenPayload | null = null;
    if (body.type === 'blob.generate-client-token') {
      const session = await requireSession();
      verifyMutationRequest(request, session);
      const payload = uploadPayloadSchema.parse(JSON.parse(body.payload.clientPayload ?? '{}'));
      const access = await getStore().getDeckAccess(session.id, payload.deckId);
      if (!access || access.role === 'viewer') {
        throw new StoreError('forbidden', 'Upload access denied');
      }
      tokenIdentity = { ownerId: session.id, ...payload };
    }
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!tokenIdentity) throw new Error('Upload identity is missing');
        if (!isAllowedUploadPath(pathname, tokenIdentity.ownerId, tokenIdentity.deckId)) {
          throw new Error('Invalid upload pathname');
        }
        return {
          allowedContentTypes: [...ALLOWED_ASSET_CONTENT_TYPES],
          maximumSizeInBytes: MAX_ASSET_SIZE,
          addRandomSuffix: true,
          allowOverwrite: false,
          tokenPayload: JSON.stringify(tokenIdentity),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const identity = uploadPayloadSchema
          .extend({ ownerId: z.string().min(1).max(160) })
          .parse(JSON.parse(tokenPayload ?? '{}'));
        await getStore().recordAsset({
          id: `asset:${crypto.randomUUID()}`,
          ownerId: identity.ownerId,
          deckId: identity.deckId,
          blobUrl: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType,
          width: identity.width,
          height: identity.height,
          size: identity.size,
        });
      },
    });
    return Response.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
