import {RequestWorkspaceSkeleton} from '@/components/admin/AdminRequestWorkspace';

export default function AdminRequestLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-4 lg:px-6">
      <RequestWorkspaceSkeleton />
    </div>
  );
}
