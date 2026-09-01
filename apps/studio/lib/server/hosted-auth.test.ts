import { describe, expect, it } from 'vitest';
import {
  hostedAuthOrigin,
  hostedIdentity,
  isHostedAuthEnabled,
  isHostedAuthRequest,
  verifyHostedAccessCode,
} from './hosted-auth';

const hostedEnvironment = {
  NODE_ENV: 'production',
  STUDIO_HOSTED_AUTH: '1',
  STUDIO_HOSTED_ACCESS_CODE: 'a-secure-access-code-with-32-characters',
  STUDIO_HOSTED_USER_ID: 'vercel-user-1',
  STUDIO_HOSTED_USER_EMAIL: 'pabs@vercel.com',
  STUDIO_HOSTED_USER_NAME: 'Pabs',
  ADMIN_VERCEL_USER_IDS: 'vercel-user-1',
} as const;

describe('hosted authoring authentication', () => {
  it('requires production, a strong access code, and an admin identity', () => {
    expect(isHostedAuthEnabled(hostedEnvironment)).toBe(true);
    expect(isHostedAuthEnabled({ ...hostedEnvironment, NODE_ENV: 'development' })).toBe(false);
    expect(isHostedAuthEnabled({ ...hostedEnvironment, STUDIO_HOSTED_ACCESS_CODE: 'short' })).toBe(
      false,
    );
    expect(isHostedAuthEnabled({ ...hostedEnvironment, ADMIN_VERCEL_USER_IDS: '' })).toBe(false);
  });

  it('compares the configured code without accepting partial matches', () => {
    expect(
      verifyHostedAccessCode(hostedEnvironment.STUDIO_HOSTED_ACCESS_CODE, hostedEnvironment),
    ).toBe(true);
    expect(
      verifyHostedAccessCode('a-secure-access-code-with-32-character', hostedEnvironment),
    ).toBe(false);
    expect(verifyHostedAccessCode('', hostedEnvironment)).toBe(false);
  });

  it('accepts only same-origin requests', () => {
    const directRequest = new Request('https://vercel-slides.example.com/api/auth/hosted-session', {
      headers: { origin: 'https://vercel-slides.example.com' },
    });
    expect(isHostedAuthRequest(directRequest)).toBe(true);
    expect(hostedAuthOrigin(directRequest)).toBe('https://vercel-slides.example.com');
    expect(
      isHostedAuthRequest(
        new Request('https://internal.vercel.run/api/auth/hosted-session', {
          headers: {
            host: 'internal.vercel.run',
            origin: 'https://vercel-slides.example.com',
            'x-forwarded-host': 'vercel-slides.example.com',
            'x-forwarded-proto': 'https',
          },
        }),
      ),
    ).toBe(true);
    expect(
      isHostedAuthRequest(
        new Request('https://vercel-slides.example.com/api/auth/hosted-session', {
          headers: { origin: 'https://example.com' },
        }),
      ),
    ).toBe(false);
  });

  it('uses the configured stable admin identity', () => {
    expect(hostedIdentity(hostedEnvironment)).toEqual({
      id: 'vercel-user-1',
      email: 'pabs@vercel.com',
      name: 'Pabs',
      username: 'pabs',
      avatarUrl: null,
      role: 'admin',
    });
  });
});
