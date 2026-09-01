import { AuthError, issueSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError } from '@/lib/server/http';
import { isLocalAuthEnabled, isLocalAuthRequest, localIdentity } from '@/lib/server/local-auth';

export async function POST(request: Request) {
  try {
    if (!isLocalAuthEnabled()) return new Response(null, { status: 404 });
    if (!isLocalAuthRequest(request)) {
      throw new AuthError('forbidden', 'Local sign-in requires a same-origin loopback request');
    }
    const identity = localIdentity();
    await getStore().ensureUser(identity);
    await issueSession(identity);
    const requestUrl = new URL(request.url);
    const redirectOrigin =
      request.headers.get('origin') ??
      `${requestUrl.protocol}//${request.headers.get('host') ?? requestUrl.host}`;
    return Response.redirect(new URL('/', redirectOrigin), 303);
  } catch (error) {
    return handleRouteError(error);
  }
}
