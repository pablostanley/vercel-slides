import { requireSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError } from '@/lib/server/http';

type Context = { params: Promise<{ librarySlug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { librarySlug } = await context.params;
    const masters = await getStore().listPublishedMasters(session.id, librarySlug);
    return Response.json({ masters });
  } catch (error) {
    return handleRouteError(error);
  }
}
