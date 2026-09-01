import { describe, expect, it } from 'vitest';
import { isLocalAuthEnabled, isLocalAuthRequest, localIdentity } from './local-auth';

describe('local authoring authentication', () => {
  it('cannot be enabled in production', () => {
    expect(isLocalAuthEnabled({ NODE_ENV: 'production', STUDIO_LOCAL_AUTH: '1' })).toBe(false);
    expect(isLocalAuthEnabled({ NODE_ENV: 'development', STUDIO_LOCAL_AUTH: '1' })).toBe(true);
    expect(isLocalAuthEnabled({ NODE_ENV: 'development' })).toBe(false);
  });

  it('accepts only same-origin loopback requests', () => {
    expect(
      isLocalAuthRequest(
        new Request('http://localhost:3100/api/auth/local-session', {
          headers: { origin: 'http://127.0.0.1:3100' },
        }),
      ),
    ).toBe(true);
    expect(
      isLocalAuthRequest(
        new Request('http://127.0.0.1:3100/api/auth/local-session', {
          headers: { 'sec-fetch-site': 'same-origin' },
        }),
      ),
    ).toBe(true);
    expect(
      isLocalAuthRequest(
        new Request('http://127.0.0.1:3100/api/auth/local-session', {
          headers: { origin: 'https://example.com' },
        }),
      ),
    ).toBe(false);
    expect(
      isLocalAuthRequest(
        new Request('http://192.168.1.4:3100/api/auth/local-session', {
          headers: { origin: 'http://192.168.1.4:3100' },
        }),
      ),
    ).toBe(false);
  });

  it('uses a stable local admin identity by default', () => {
    expect(localIdentity({})).toMatchObject({
      id: 'local:author',
      email: 'local-author@vercel.test',
      role: 'admin',
    });
    expect(
      localIdentity({
        STUDIO_LOCAL_USER_ID: 'local:pabs',
        STUDIO_LOCAL_USER_EMAIL: 'pabs@vercel.com',
        STUDIO_LOCAL_USER_NAME: 'Pabs',
        STUDIO_LOCAL_USER_ROLE: 'user',
      }),
    ).toMatchObject({
      id: 'local:pabs',
      email: 'pabs@vercel.com',
      name: 'Pabs',
      username: 'pabs',
      role: 'user',
    });
  });
});
