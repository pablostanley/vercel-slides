import { z } from 'zod';
import { issueSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { handleRouteError, parseJson } from '@/lib/server/http';

const schema = z
  .object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(['user', 'admin']).default('user'),
  })
  .strict();

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.STUDIO_TEST_AUTH !== '1') {
      return new Response(null, { status: 404 });
    }
    const input = await parseJson(request, schema);
    const identity = {
      ...input,
      username: input.email.split('@')[0] ?? null,
      avatarUrl: null,
    };
    await getStore().ensureUser(identity);
    const session = await issueSession(identity);
    return Response.json({ session });
  } catch (error) {
    return handleRouteError(error);
  }
}
