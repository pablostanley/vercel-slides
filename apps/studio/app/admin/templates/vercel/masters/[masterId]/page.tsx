import { notFound } from 'next/navigation';
import { MasterEditor } from '@/components/master-editor';
import { requireAdmin } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';

export default async function MasterEditorPage({
  params,
}: {
  params: Promise<{ masterId: string }>;
}) {
  const session = await requireAdmin();
  const { masterId } = await params;
  const store = getStore();
  const direct = await store.getAdminMaster(session.id, masterId);
  const master =
    direct ??
    (await store.listAdminMasters(session.id, 'vercel')).find((item) => item.slug === masterId) ??
    null;
  if (!master) notFound();
  return <MasterEditor session={session} initialMaster={master} />;
}
