import AdminRequestPageClient from '@/components/admin/AdminRequestPageClient';

export default async function AdminRequestPage({
  params,
}: {
  params: Promise<{requestId: string}>;
}) {
  const {requestId} = await params;

  return <AdminRequestPageClient requestId={requestId} />;
}
