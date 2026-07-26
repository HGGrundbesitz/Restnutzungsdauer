'use client';

import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminPortalShell from '@/components/admin/AdminPortalShell';
import AdminSessionBoundary from '@/components/admin/AdminSessionBoundary';

export default function AdminPage() {
  return (
    <AdminSessionBoundary>
      {(session) => (
        <AdminPortalShell session={session} active="dashboard">
          <AdminDashboard />
        </AdminPortalShell>
      )}
    </AdminSessionBoundary>
  );
}
