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
    <div role="dialog" aria-label="Cookies und Datenschutz" className="fixed inset-x-2 bottom-2 z-[120] mx-auto max-w-4xl rounded-[1.2rem] border border-[var(--color-border)] bg-white/94 p-3 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:inset-x-3 sm:bottom-5 sm:rounded-[1.35rem] sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--color-ink)]">Cookies & Datenschutz</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)] sm:text-sm sm:leading-6">
            Wir verwenden nur technisch notwendige Cookies und lokale Speicherung. Details finden Sie unter{' '}
            <Link href="/datenschutz" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]">Datenschutz</Link>
            {' '}und{' '}
            <Link href="/cookies" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]">Cookies</Link>.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
          <Link href="/cookies" className="theme-panel rounded-full px-4 py-2.5 text-center text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition-all hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.12em]">
            Mehr Infos
          </Link>
          <button type="button" onClick={accept} className="rounded-full bg-[var(--color-contrast-surface)] px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--color-contrast-ink)] shadow-[0_18px_34px_-24px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.12em]">
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
