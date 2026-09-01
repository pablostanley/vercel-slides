import { type NextRequest, NextResponse } from 'next/server';
import { createOAuthValues, setOAuthCookies } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
  if (!clientId) {
    return Response.json(
      { error: { code: 'auth_not_configured', message: 'Sign in with Vercel is not configured' } },
      { status: 503 },
    );
  }
  const values = createOAuthValues();
  await setOAuthCookies(values);
  const parameters = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${request.nextUrl.origin}/api/auth/callback`,
    state: values.state,
    nonce: values.nonce,
    code_challenge: values.challenge,
    code_challenge_method: 'S256',
    response_type: 'code',
    scope: 'openid email profile',
  });
  return NextResponse.redirect(`https://vercel.com/oauth/authorize?${parameters}`);
}
