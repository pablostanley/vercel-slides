import { AuthError, issueSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import {
  hostedAuthOrigin,
  hostedIdentity,
  isHostedAuthEnabled,
  isHostedAuthRequest,
  verifyHostedAccessCode,
} from '@/lib/server/hosted-auth';
import { handleRouteError } from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    if (!isHostedAuthEnabled()) return new Response(null, { status: 404 });
    if (!isHostedAuthRequest(request)) {
      throw new AuthError('forbidden', 'Hosted sign-in requires a same-origin request');
    }
    const formData = await request.formData();
    const accessCode = formData.get('accessCode');
    if (!verifyHostedAccessCode(typeof accessCode === 'string' ? accessCode : null)) {
      return Response.redirect(new URL('/?accessError=1', hostedAuthOrigin(request)), 303);
    }
    const identity = hostedIdentity();
    await getStore().ensureUser(identity);
    await issueSession(identity);
    return Response.redirect(new URL('/', hostedAuthOrigin(request)), 303);
  } catch (error) {
    return handleRouteError(error);
  }
}
