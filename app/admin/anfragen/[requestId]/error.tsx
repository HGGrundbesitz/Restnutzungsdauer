'use client';

import Link from 'next/link';
import {AlertTriangle, RefreshCw} from 'lucide-react';

export default function AdminRequestRouteError({
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="admin-card max-w-xl rounded-[2rem] p-8 text-center">
        <AlertTriangle className="mx-auto text-amber-600" size={26} />
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
          Anfrage konnte nicht geöffnet werden
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
          Bitte versuchen Sie es erneut. Ihre gespeicherten Daten und Prüfentscheidungen bleiben unverändert.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="admin-solid-btn inline-flex min-h-11 items-center gap-2 rounded-[0.95rem] px-4 text-sm font-semibold"
          >
            <RefreshCw size={15} />
            Erneut versuchen
          </button>
          <Link href="/admin" className="admin-ghost-btn inline-flex min-h-11 items-center rounded-[0.95rem] px-4 text-sm font-semibold">
            Zurück zu Anfragen
          </Link>
        </div>
      </div>
    </div>
  );
}
