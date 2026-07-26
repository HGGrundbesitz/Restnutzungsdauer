'use client';

import AdminPortalShell from '@/components/admin/AdminPortalShell';
import AdminRequestWorkspace from '@/components/admin/AdminRequestWorkspace';
import AdminSessionBoundary from '@/components/admin/AdminSessionBoundary';
import {RequestWorkspaceProvider} from '@/components/admin/RequestWorkspaceController';

export default function AdminRequestPageClient({requestId}: {requestId: string}) {
  return (
    <AdminSessionBoundary>
      {(session) => (
        <AdminPortalShell session={session} active="request">
          <RequestWorkspaceProvider requestId={requestId}>
            <AdminRequestWorkspace />
          </RequestWorkspaceProvider>
        </AdminPortalShell>
      )}
    </AdminSessionBoundary>
  );
}
