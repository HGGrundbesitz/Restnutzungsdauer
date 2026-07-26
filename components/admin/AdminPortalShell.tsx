'use client';

import type {ReactNode} from 'react';
import type {Session} from '@supabase/supabase-js';
import Link from 'next/link';
import {ExternalLink, FileSearch, LayoutDashboard, LogOut, ShieldCheck} from 'lucide-react';
import {supabase} from '@/lib/supabase';

export default function AdminPortalShell({
  session,
  active,
  children,
}: {
  session: Session;
  active: 'dashboard' | 'request';
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-ink)]">
      <div className="pointer-events-none absolute left-[-10rem] top-[-7rem] h-[26rem] w-[26rem] rounded-full bg-[var(--color-accent-soft)] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[var(--color-accent-soft)] blur-[130px]" />

      <div className="relative z-10 flex min-h-screen flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:gap-6 lg:px-6">
        <aside className="admin-card flex w-full shrink-0 flex-col rounded-[1.6rem] p-3 sm:p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72 lg:rounded-[2rem] lg:p-5">
          <div className="flex items-center gap-3 rounded-[1.2rem] px-2 py-1">
            <div className="theme-contrast-panel flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-[0_16px_28px_-18px_rgba(0,0,0,0.35)]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
                Admin Portal
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Restnutzungsdauer
              </div>
            </div>
          </div>

          <div className="admin-card-muted mt-5 hidden rounded-[1.6rem] p-4 lg:block">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Interner Bereich
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
              Anfragen, Dokumente und Status im Überblick.
            </p>
          </div>

          <nav className="mt-3 grid grid-cols-2 gap-2 lg:mt-5 lg:grid-cols-1" aria-label="Admin-Navigation">
            <Link
              href="/admin"
              aria-current={active === 'dashboard' ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-[1.05rem] px-4 py-3 text-sm font-semibold ${
                active === 'dashboard' ? 'admin-solid-btn' : 'admin-ghost-btn'
              }`}
            >
              <LayoutDashboard size={18} />
              Übersicht
            </Link>
            {active === 'request' ? (
              <div className="admin-solid-btn flex items-center gap-3 rounded-[1.05rem] px-4 py-3 text-sm font-semibold">
                <FileSearch size={18} />
                Anfrage
              </div>
            ) : (
              <Link
                href="/"
                target="_blank"
                className="admin-ghost-btn flex items-center gap-3 rounded-[1.05rem] px-4 py-3 text-sm font-semibold"
              >
                <ExternalLink size={18} />
                Zur Website
              </Link>
            )}
          </nav>

          <div className="mt-auto hidden pt-6 lg:block">
            <div className="admin-card-muted rounded-[1.5rem] p-4">
              <div className="flex items-center gap-3">
                <div className="theme-panel-muted flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-[var(--color-ink)]">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{session.user.email}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Administrator
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void supabase.auth.signOut()}
              className="admin-ghost-btn mt-3 flex w-full items-center justify-center gap-2 rounded-[1.15rem] px-4 py-3 text-sm font-semibold"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
