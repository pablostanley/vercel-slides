import { describe, expect, it } from 'vitest';
import {
  isAllowedUploadPath,
  MAX_ASSET_SIZE,
  uploadPathname,
  uploadPayloadSchema,
} from './asset-upload';

describe('asset upload policy', () => {
  it('namespaces uploads by stable user and deck IDs', () => {
    const pathname = uploadPathname('user:one', 'deck:one', '../../cover image.png');
    expect(pathname).toBe('slides/user%3Aone/deck%3Aone/..-..-cover-image.png');
    expect(isAllowedUploadPath(pathname, 'user:one', 'deck:one')).toBe(true);
    expect(isAllowedUploadPath(pathname, 'user:two', 'deck:one')).toBe(false);
  });

  it('rejects oversized client payloads', () => {
    expect(() =>
      uploadPayloadSchema.parse({
        deckId: 'deck:one',
        size: MAX_ASSET_SIZE + 1,
        width: 100,
        height: 100,
      }),
    ).toThrow();
  });
});
