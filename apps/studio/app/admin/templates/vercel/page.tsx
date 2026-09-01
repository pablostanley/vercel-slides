import { AdminMasterLibrary } from '@/components/admin-master-library';
import { requireAdmin } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';

export default async function VercelMasterLibraryPage() {
  const session = await requireAdmin();
  const masters = await getStore().listAdminMasters(session.id, 'vercel');
  return <AdminMasterLibrary session={session} initialMasters={masters} />;
}
