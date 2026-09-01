import { clearSession, requireSession, verifyMutationRequest } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    verifyMutationRequest(request, session);
    await clearSession();
    return Response.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
