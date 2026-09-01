import { z } from 'zod';

export const ALLOWED_ASSET_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
export const MAX_ASSET_SIZE = 10 * 1024 * 1024;

export const uploadPayloadSchema = z
  .object({
    deckId: z.string().min(1).max(160),
    size: z.number().int().positive().max(MAX_ASSET_SIZE),
    width: z.number().int().positive().max(20_000).nullable().default(null),
    height: z.number().int().positive().max(20_000).nullable().default(null),
  })
  .strict();

export function uploadPathname(userId: string, deckId: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-160) || 'image';
  return `slides/${encodeURIComponent(userId)}/${encodeURIComponent(deckId)}/${safe}`;
}

export function isAllowedUploadPath(pathname: string, userId: string, deckId: string) {
  return pathname.startsWith(`slides/${encodeURIComponent(userId)}/${encodeURIComponent(deckId)}/`);
}
