'use client';

import {ReactNode} from 'react';
import {motion} from 'motion/react';
import {ShieldCheck} from 'lucide-react';

type AdminAuthShellProps = {
  cardEyebrow: string;
  cardTitle: string;
  cardDescription: string;
  children: ReactNode;
};

export default function AdminAuthShell({
  cardEyebrow,
  cardTitle,
  cardDescription,
  children,
}: AdminAuthShellProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[var(--color-accent-soft)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[var(--color-accent-soft)] blur-[120px]" />

      <div className="section-shell relative z-10 flex w-full items-center justify-center py-10">
        <div className="w-full max-w-[520px]">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.55}}
            className="admin-card mx-auto w-full rounded-[2rem] p-6 sm:p-8"
          >
            <div className="mb-8">
              <div className="theme-panel mb-5 inline-flex items-center gap-3 rounded-full px-4 py-3">
                <span className="theme-contrast-panel flex h-10 w-10 items-center justify-center rounded-full">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">Admin Portal</div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Login
                  </div>
                </div>
              </div>

              <div className="section-eyebrow mb-5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                {cardEyebrow}
              </div>
              <h2 className="font-heading text-[2rem] font-semibold tracking-[-0.05em] text-[var(--color-ink)]">{cardTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{cardDescription}</p>
            </div>

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
