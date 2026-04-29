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
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const {
          data: {session},
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSession(session);
        setSessionError(null);
      } catch (error) {
        console.error('Failed to initialize admin session:', error);

        if (!isMounted) {
          return;
        }

        setSession(null);
        setSessionError(
          'Supabase konnte nicht erreicht werden. Bitte prüfen Sie die NEXT_PUBLIC_SUPABASE_URL in Ihrer .env.local und starten Sie den Dev-Server neu.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setSessionError(null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
    return <AdminLogin externalError={sessionError} />;
  }

  return <AdminDashboard session={session} />;
}
