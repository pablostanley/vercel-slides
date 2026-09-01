import type { IdentityInput } from './store';

type AuthEnvironment = Readonly<Record<string, string | undefined>>;

export function isLocalAuthEnabled(env: AuthEnvironment = process.env) {
  return env.NODE_ENV !== 'production' && env.STUDIO_LOCAL_AUTH === '1';
}

export function isLocalAuthRequest(request: Request) {
  const requestUrl = new URL(request.url);
  const isLoopback = (hostname: string) =>
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  if (!isLoopback(requestUrl.hostname)) return false;
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') === 'same-origin';
  const originUrl = new URL(origin);
  return (
    isLoopback(originUrl.hostname) &&
    originUrl.protocol === requestUrl.protocol &&
    originUrl.port === requestUrl.port
  );
}

export function localIdentity(env: AuthEnvironment = process.env): IdentityInput {
  const email = env.STUDIO_LOCAL_USER_EMAIL?.trim() || 'local-author@vercel.test';
  return {
    id: env.STUDIO_LOCAL_USER_ID?.trim() || 'local:author',
    email,
    name: env.STUDIO_LOCAL_USER_NAME?.trim() || 'Local author',
    username: email.split('@')[0] ?? null,
    avatarUrl: null,
    role: env.STUDIO_LOCAL_USER_ROLE === 'user' ? 'user' : 'admin',
  };
}
