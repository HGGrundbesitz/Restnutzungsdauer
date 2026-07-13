'use client';

import {useEffect, useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {Loader2} from 'lucide-react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import {isSupabaseConfigured, supabase} from '@/lib/supabase';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let verificationId = 0;

    const verifyAdminSession = async (candidate: Session | null) => {
      const currentVerification = ++verificationId;

      if (!candidate) {
        if (isMounted && currentVerification === verificationId) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const {data: membership, error: membershipError} = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', candidate.user.id)
        .eq('active', true)
        .maybeSingle();

      if (!isMounted || currentVerification !== verificationId) {
        return;
      }

      if (membershipError) {
        console.error('Admin membership verification failed:', membershipError);
        setSession(null);
        setSessionError('Die Admin-Berechtigung konnte nicht geprüft werden. Bitte führen Sie zuerst das Supabase-SQL-Setup aus.');
        setLoading(false);
        return;
      }

      if (!membership) {
        setSession(null);
        setSessionError('Dieses Konto ist nicht als Administrator freigeschaltet.');
        setLoading(false);
        await supabase.auth.signOut({scope: 'local'});
        return;
      }

      setSession(candidate);
      setSessionError(null);
      setLoading(false);
    };

    const loadSession = async () => {
      if (!isSupabaseConfigured) {
        setSessionError('Supabase ist nicht vollständig konfiguriert. Prüfen Sie URL und Publishable Key in der .env.local.');
        setLoading(false);
        return;
      }

      try {
        const {
          data: {session: currentSession},
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        await verifyAdminSession(currentSession);
      } catch (error) {
        console.error('Failed to initialize admin session:', error);
        if (isMounted) {
          setSession(null);
          setSessionError('Supabase konnte nicht erreicht werden. Prüfen Sie SUPABASE_URL und starten Sie den Dev-Server neu.');
          setLoading(false);
        }
      }
    };

    void loadSession();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => {
        if (isMounted) {
          void verifyAdminSession(nextSession);
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      verificationId += 1;
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
