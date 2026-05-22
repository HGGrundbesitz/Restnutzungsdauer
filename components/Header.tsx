'use client';

import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {cn} from '@/lib/utils';

const navItems = [
  {href: '#ersteinschaetzung', label: 'Ersteinschätzung'},
  {href: '#vorteile', label: 'Vorteile'},
  {href: '#prozess', label: 'Prozess'},
  {href: '#warum-wir', label: 'Warum wir'},
  {href: '#faq', label: 'FAQ'},
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="creative-header"
      className={cn(
        'fixed inset-x-0 z-50 px-4 transition-all duration-500 sm:px-6',
        isScrolled ? 'top-2.5' : 'top-4',
      )}
    >
      <div className="mx-auto max-w-[1320px]">
        <div
          className={cn(
            'theme-panel-strong relative z-20 rounded-[1.55rem] border px-3 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-4',
            isScrolled ? 'shadow-[var(--shadow-lift)]' : 'shadow-[var(--shadow-soft)]',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <a href="#hero" className="flex min-w-0 items-center gap-2.5 rounded-[1.1rem] py-1 pr-2" onClick={closeMobileMenu}>
              <div className="theme-contrast-panel flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.95rem] shadow-[0_12px_26px_-18px_rgba(0,0,0,0.4)] sm:h-10 sm:w-10">
                <span className="font-heading text-base sm:text-[1.05rem]">R</span>
              </div>

              <div className="min-w-0">
                <div className="truncate font-heading text-[1.35rem] leading-none tracking-[-0.04em] text-[var(--color-ink)] sm:text-[1.55rem]">
                  RND Gutachten
                </div>
                <div className="mt-1 hidden text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)] sm:block">
                  Digitale Restnutzungsdauer
                </div>
              </div>
            </a>

            <nav className="hidden items-center gap-5 px-4 lg:flex xl:gap-7">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group relative py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition-colors duration-300 hover:text-[var(--color-ink)] xl:text-[11px]"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="#anfrage"
                className="hidden items-center gap-1.5 rounded-full bg-[var(--color-contrast-surface)] px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-contrast-ink)] shadow-[0_18px_34px_-22px_rgba(0,0,0,0.34)] transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex"
              >
                Anfrage
                <ArrowUpRight size={14} />
              </a>

              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="theme-panel flex h-10 w-10 items-center justify-center rounded-[0.95rem] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-strong)] lg:hidden"
              >
                {isMobileMenuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Menü schließen"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.18}}
                onClick={closeMobileMenu}
                className="fixed inset-0 -z-10 bg-[var(--color-ink)]/10 backdrop-blur-[2px] lg:hidden"
              />

              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
                className="theme-panel-strong relative z-20 mt-2 rounded-[1.45rem] border p-3 shadow-[var(--shadow-lift)] lg:hidden"
              >
                <div className="mb-2 px-1 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  Navigation
                </div>

                <div className="space-y-1.5">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="theme-panel flex items-center justify-between rounded-[1rem] px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-ink)] transition-all hover:bg-[var(--color-surface-strong)]"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight size={14} className="text-[var(--color-accent)]" />
                    </a>
                  ))}
                </div>

                <a
                  href="#anfrage"
                  onClick={closeMobileMenu}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-contrast-surface)] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-contrast-ink)]"
                >
                  Jetzt anfragen
                  <ArrowUpRight size={14} />
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}