'use client';

import {useState} from 'react';
import {ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail} from 'lucide-react';
import AdminAuthShell from './AdminAuthShell';
import {getAdminResetRedirectUrl, getAuthErrorMessage} from '@/lib/admin-auth';
import {isSupabaseConfigured, supabase} from '@/lib/supabase';

export default function AdminLogin() {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured) {
      setError('Supabase ist lokal nicht konfiguriert. Bitte legen Sie eine gueltige .env.local mit URL und Anon Key an und starten Sie den Dev-Server neu.');
      setLoading(false);
      return;
    }

    try {
      const {error: loginError} = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError(getAuthErrorMessage(loginError.message));
        setLoading(false);
        return;
      }
    } catch {
      setError('Supabase konnte nicht erreicht werden. Bitte pruefen Sie Ihre .env.local, Ihre Internetverbindung und starten Sie den Dev-Server neu.');
      setLoading(false);
      return;
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured) {
      setError('Supabase ist lokal nicht konfiguriert. Bitte legen Sie eine gueltige .env.local mit URL und Anon Key an und starten Sie den Dev-Server neu.');
      setLoading(false);
      return;
    }

    try {
      const {error: resetError} = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getAdminResetRedirectUrl(),
      });

      if (resetError) {
        setError(getAuthErrorMessage(resetError.message));
        setLoading(false);
        return;
      }
    } catch {
      setError('Der Reset-Link konnte nicht angefordert werden. Bitte pruefen Sie Ihre Verbindung und starten Sie den Dev-Server neu.');
      setLoading(false);
      return;
    }

    setSuccess('Der Reset-Link wurde versendet. Bitte pruefen Sie Ihr Postfach und folgen Sie dem Link zum neuen Passwort.');
    setLoading(false);
  };

  return (
    <AdminAuthShell
      cardEyebrow={mode === 'login' ? 'Admin Login' : 'Passwort Reset'}
      cardTitle={mode === 'login' ? 'Willkommen zurueck' : 'Passwort zuruecksetzen'}
      cardDescription={
        mode === 'login'
          ? 'Melden Sie sich an, um Anfragen, Dokumente und Status im Adminbereich zu verwalten.'
          : 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden den Reset-Link direkt an Ihr Postfach.'
      }
    >
      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input w-full rounded-[1rem] py-3.5 pl-11 pr-4 text-sm"
                placeholder="team@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-[var(--color-ink)]">Passwort</label>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-semibold text-[var(--color-accent)] transition-opacity hover:opacity-80"
              >
                Passwort vergessen?
              </button>
            </div>

            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={16}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input w-full rounded-[1rem] py-3.5 pl-11 pr-12 text-sm"
                placeholder="Passwort eingeben"
                autoComplete="current-password"
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
                Anmeldung laeuft
              </>
            ) : (
              <>
                Einloggen
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">E-Mail Adresse</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input w-full rounded-[1rem] py-3.5 pl-11 pr-4 text-sm"
                placeholder="team@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-7 text-[var(--color-text-muted)]">
            Der Reset-Link wird an diese Adresse gesendet. Von dort koennen Sie Ihr Passwort direkt neu setzen.
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
                Link wird gesendet
              </>
            ) : (
              <>
                Reset-Link senden
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }}
            className="admin-ghost-btn flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3.5 text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Zurueck zum Login
          </button>
        </form>
      )}
    </AdminAuthShell>
  );
}
