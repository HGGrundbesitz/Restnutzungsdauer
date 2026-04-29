'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole} from 'lucide-react';
import AdminAuthShell from './AdminAuthShell';
import {getAuthErrorMessage} from '@/lib/admin-auth';
import {supabase} from '@/lib/supabase';

export default function AdminResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errorDescription = hashParams.get('error_description');

      if (errorDescription && isMounted) {
        setError(getAuthErrorMessage(decodeURIComponent(errorDescription)));
      }

      const {
        data: {session},
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setHasRecoverySession(Boolean(session));
      setChecking(false);
    };

    void resolveRecoverySession();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasRecoverySession(Boolean(session));
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 10) {
      setError('Bitte waehlen Sie ein Passwort mit mindestens 10 Zeichen.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die beiden Passwoerter stimmen nicht ueberein.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const {error: updateError} = await supabase.auth.updateUser({password});

    if (updateError) {
      setError(getAuthErrorMessage(updateError.message));
      setLoading(false);
      return;
    }

    setSuccess('Ihr Passwort wurde aktualisiert. Sie werden jetzt zum Adminbereich weitergeleitet.');
    window.history.replaceState({}, document.title, '/admin/reset-password');

    setTimeout(() => {
      router.replace('/admin');
    }, 1200);
  };

  return (
    <AdminAuthShell
      cardEyebrow="Passwort Reset"
      cardTitle="Neues Passwort setzen"
      cardDescription="Vergeben Sie ein neues Passwort für Ihren Adminzugang. Nach dem Speichern geht es direkt zurück in den Adminbereich."
    >
      {checking ? (
        <div className="admin-card-muted flex items-center justify-center gap-3 rounded-[1rem] px-4 py-4 text-sm text-[var(--color-text-muted)]">
          <Loader2 size={18} className="animate-spin text-[var(--color-accent)]" />
          Recovery-Session wird geprueft
        </div>
      ) : !hasRecoverySession ? (
        <div className="space-y-5">
          <div className="rounded-[1rem] border border-amber-200/70 bg-amber-50/80 p-4 text-sm leading-7 text-amber-700">
            {error || 'Der Reset-Link ist nicht mehr gültig. Fordern Sie bitte einen neuen Passwort-Link über den Admin-Login an.'}
          </div>

          <Link
            href="/admin"
            className="admin-ghost-btn inline-flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3.5 text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Zurück zum Admin Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">Neues Passwort</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input w-full rounded-[1rem] py-3.5 pl-11 pr-12 text-sm"
                placeholder="Mindestens 10 Zeichen"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-ink)]"
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">Passwort bestätigen</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="admin-input w-full rounded-[1rem] py-3.5 pl-11 pr-12 text-sm"
                placeholder="Passwort wiederholen"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-ink)]"
                aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-7 text-[var(--color-text-muted)]">
            Verwenden Sie am besten ein neues Passwort mit mindestens 10 Zeichen, das nur für den Adminzugang genutzt wird.
          </div>

          {error && <div className="rounded-[1rem] border border-red-200/70 bg-red-50/80 p-4 text-sm text-red-600">{error}</div>}
          {success && (
            <div className="rounded-[1rem] border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm text-emerald-700">{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-solid-btn flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Passwort wird gespeichert
              </>
            ) : (
              <>
                Passwort aktualisieren
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </AdminAuthShell>
  );
}


