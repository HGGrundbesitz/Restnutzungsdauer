'use client';

import {useEffect, useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {Loader2} from 'lucide-react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import {supabase} from '@/lib/supabase';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="admin-card-muted flex items-center gap-3 rounded-full px-5 py-3 text-[var(--color-text-muted)]">
          <Loader2 className="animate-spin text-[var(--color-accent)]" size={18} />
          <span className="text-sm font-medium">Admin wird geladen</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  return <AdminDashboard session={session} />;
}
