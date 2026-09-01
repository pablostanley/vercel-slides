import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createRemoteJWKSet, type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { StudioUser } from '@/lib/models';
import { getStore } from './get-store';

const SESSION_COOKIE = 'studio_session';
const OAUTH_STATE_COOKIE = 'studio_oauth_state';
const OAUTH_NONCE_COOKIE = 'studio_oauth_nonce';
const OAUTH_VERIFIER_COOKIE = 'studio_oauth_verifier';
const SESSION_ISSUER = 'vercel-slides-studio';
const SESSION_AUDIENCE = 'vercel-slides';
const VERCEL_JWKS = createRemoteJWKSet(new URL('https://vercel.com/.well-known/jwks'));

export type SessionIdentity = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: StudioUser['role'];
  csrfToken: string;
};

type VercelClaims = JWTPayload & {
  sub: string;
  email: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  nonce?: string;
};

function valueSet(value: string | undefined) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

function sessionSecret() {
  const configured = process.env.STUDIO_SESSION_SECRET;
  if (configured) {
    if (configured.length < 32)
      throw new Error('STUDIO_SESSION_SECRET must be at least 32 characters');
    return new TextEncoder().encode(configured);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('STUDIO_SESSION_SECRET is required in production');
  }
  return new TextEncoder().encode('development-only-vercel-slides-secret');
}

function isAllowed(identity: Pick<SessionIdentity, 'id' | 'email'>) {
  if (process.env.NODE_ENV !== 'production') return true;
  const userIds = valueSet(process.env.ALLOWED_VERCEL_USER_IDS);
  const domains = valueSet(process.env.ALLOWED_EMAIL_DOMAINS);
  const domain = identity.email.split('@').at(-1)?.toLowerCase();
  return userIds.has(identity.id.toLowerCase()) || (domain !== undefined && domains.has(domain));
}

function roleForUser(id: string): StudioUser['role'] {
  return valueSet(process.env.ADMIN_VERCEL_USER_IDS).has(id.toLowerCase()) ? 'admin' : 'user';
}

function secureCookie(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

function safeEqual(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createOAuthValues() {
  const state = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url');
  const verifier = randomBytes(64).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { state, nonce, verifier, challenge };
}

export async function setOAuthCookies(values: ReturnType<typeof createOAuthValues>) {
  const cookieStore = await cookies();
  const options = secureCookie(10 * 60);
  cookieStore.set(OAUTH_STATE_COOKIE, values.state, options);
  cookieStore.set(OAUTH_NONCE_COOKIE, values.nonce, options);
  cookieStore.set(OAUTH_VERIFIER_COOKIE, values.verifier, options);
}

export async function consumeOAuthCookies(request: NextRequest, state: string | null) {
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const nonce = request.cookies.get(OAUTH_NONCE_COOKIE)?.value;
  const verifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (!safeEqual(state, storedState) || !nonce || !verifier) {
    throw new Error('The sign-in request expired or did not match');
  }
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_NONCE_COOKIE);
  cookieStore.delete(OAUTH_VERIFIER_COOKIE);
  return { nonce, verifier };
}

export async function verifyVercelIdToken(idToken: string, expectedNonce: string) {
  const clientId = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
  if (!clientId) throw new Error('NEXT_PUBLIC_VERCEL_APP_CLIENT_ID is required');
  const { payload } = await jwtVerify(idToken, VERCEL_JWKS, {
    issuer: 'https://vercel.com',
    audience: clientId,
  });
  const claims = payload as VercelClaims;
  if (!claims.sub || !claims.email || !safeEqual(claims.nonce, expectedNonce)) {
    throw new Error('The Vercel ID token is missing required verified claims');
  }
  const identity: Omit<SessionIdentity, 'csrfToken'> = {
    id: claims.sub,
    email: claims.email.toLowerCase(),
    name: claims.name ?? claims.preferred_username ?? claims.email,
    username: claims.preferred_username ?? null,
    avatarUrl: claims.picture ?? null,
    role: roleForUser(claims.sub),
  };
  if (!isAllowed(identity)) throw new Error('This Vercel account is not approved for the studio');
  return identity;
}

export async function issueSession(identity: Omit<SessionIdentity, 'csrfToken'>) {
  const csrfToken = randomBytes(32).toString('base64url');
  const token = await new SignJWT({ ...identity, csrfToken })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(identity.id)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(sessionSecret());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, secureCookie(8 * 60 * 60));
  return { ...identity, csrfToken };
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.csrfToken !== 'string'
    ) {
      return null;
    }
    const developmentRole =
      process.env.NODE_ENV !== 'production' &&
      (process.env.STUDIO_TEST_AUTH === '1' || process.env.STUDIO_LOCAL_AUTH === '1')
        ? payload.role
        : undefined;
    const identity: SessionIdentity = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      username: typeof payload.username === 'string' ? payload.username : null,
      avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : null,
      role:
        developmentRole === 'admin' || developmentRole === 'user'
          ? developmentRole
          : roleForUser(payload.sub),
      csrfToken: payload.csrfToken,
    };
    if (!isAllowed(identity)) return null;
    await getStore().ensureUser(identity);
    return identity;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new AuthError('unauthorized', 'Sign in is required');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'admin')
    throw new AuthError('forbidden', 'Administrator access is required');
  return session;
}

export function verifyMutationRequest(request: Request, session: SessionIdentity) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? requestUrl.host;
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;
  const publicOrigin = `${protocol}//${host}`;
  if (origin && new URL(origin).origin !== publicOrigin) {
    throw new AuthError('forbidden', 'Cross-origin mutation rejected');
  }
  if (!safeEqual(request.headers.get('x-csrf-token'), session.csrfToken)) {
    throw new AuthError('forbidden', 'CSRF token is missing or invalid');
  }
}

export class AuthError extends Error {
  constructor(
    public readonly code: 'unauthorized' | 'forbidden',
    message: string,
  ) {
    super(message);
  }
}
