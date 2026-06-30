'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';

const STORAGE_KEY = 'rnd-cookie-notice-accepted';

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(window.localStorage.getItem(STORAGE_KEY) !== 'true');
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-4xl rounded-[1.35rem] border border-[var(--color-border)] bg-white/92 p-4 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:bottom-5 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--color-ink)]">Cookies & Datenschutz</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
            Wir nutzen notwendige Cookies und lokale Speicherung, damit die Seite technisch sauber funktioniert. Weitere Informationen finden Sie in unseren
            {' '}
            <Link href="/datenschutz" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]">Datenschutzhinweisen</Link>
            {' '}und unter{' '}
            <Link href="/cookies" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]">Cookies</Link>.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
          <Link href="/cookies" className="theme-panel rounded-full px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] transition-all hover:-translate-y-0.5">
            Mehr Infos
          </Link>
          <button type="button" onClick={accept} className="rounded-full bg-[var(--color-contrast-surface)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-contrast-ink)] shadow-[0_18px_34px_-24px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5">
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
