import { type NextRequest, NextResponse } from 'next/server';
import { consumeOAuthCookies, issueSession, verifyVercelIdToken } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';

type TokenResponse = { id_token?: string };

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) throw new Error('Authorization code is missing');
    const oauth = await consumeOAuthCookies(request, request.nextUrl.searchParams.get('state'));
    const clientId = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
    const clientSecret = process.env.VERCEL_APP_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Sign in with Vercel is not configured');
    const response = await fetch('https://api.vercel.com/login/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier: oauth.verifier,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback`,
      }),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Vercel rejected the authorization code');
    const token = (await response.json()) as TokenResponse;
    if (!token.id_token) throw new Error('Vercel did not return an ID token');
    const identity = await verifyVercelIdToken(token.id_token, oauth.nonce);
    await getStore().ensureUser(identity);
    await issueSession(identity);
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/?authError=1', request.url));
  }
}
