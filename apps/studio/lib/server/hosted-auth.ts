import { timingSafeEqual } from 'node:crypto';
import type { IdentityInput } from './store';

type AuthEnvironment = Readonly<Record<string, string | undefined>>;

function valueSet(value: string | undefined) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isHostedAuthEnabled(env: AuthEnvironment = process.env) {
  const userId = env.STUDIO_HOSTED_USER_ID?.trim().toLowerCase();
  return (
    env.NODE_ENV === 'production' &&
    env.STUDIO_HOSTED_AUTH === '1' &&
    (env.STUDIO_HOSTED_ACCESS_CODE?.length ?? 0) >= 32 &&
    Boolean(userId && env.STUDIO_HOSTED_USER_EMAIL?.trim()) &&
    valueSet(env.ADMIN_VERCEL_USER_IDS).has(userId ?? '')
  );
}

export function verifyHostedAccessCode(
  accessCode: string | null | undefined,
  env: AuthEnvironment = process.env,
) {
  if (!isHostedAuthEnabled(env) || !accessCode) return false;
  const configured = env.STUDIO_HOSTED_ACCESS_CODE;
  if (!configured) return false;
  const providedBuffer = Buffer.from(accessCode);
  const configuredBuffer = Buffer.from(configured);
  return (
    providedBuffer.length === configuredBuffer.length &&
    timingSafeEqual(providedBuffer, configuredBuffer)
  );
}

export function isHostedAuthRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') === 'same-origin';
  try {
    return new URL(origin).origin === hostedAuthOrigin(request);
  } catch {
    return false;
  }
}

export function hostedAuthOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? requestUrl.host;
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;
  return `${protocol}//${host}`;
}

export function hostedIdentity(env: AuthEnvironment = process.env): IdentityInput {
  if (!isHostedAuthEnabled(env)) throw new Error('Hosted Studio access is not configured safely');
  const id = env.STUDIO_HOSTED_USER_ID?.trim();
  const email = env.STUDIO_HOSTED_USER_EMAIL?.trim().toLowerCase();
  if (!id || !email) throw new Error('Hosted Studio identity is incomplete');
  return {
    id,
    email,
    name: env.STUDIO_HOSTED_USER_NAME?.trim() || email,
    username: email.split('@')[0] ?? null,
    avatarUrl: null,
    role: 'admin',
  };
}
