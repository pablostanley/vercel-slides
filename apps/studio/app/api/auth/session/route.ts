import { getSession } from '@/lib/server/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ session: null }, { status: 401 });
  }
  return Response.json({ session });
}
