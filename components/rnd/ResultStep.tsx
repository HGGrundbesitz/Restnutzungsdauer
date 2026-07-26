import {ArrowRight, BadgeCheck} from 'lucide-react';
import {RND_DISCLAIMER, getResultCopy} from '@/lib/rnd/result-copy';
import type {RndResult} from '@/lib/rnd/types';

export default function ResultStep({
  result,
  onContinue,
}: {
  result: RndResult;
  onContinue: () => void;
}) {
  const copy = getResultCopy(result);

  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-emerald-50 text-emerald-700">
        <BadgeCheck size={31} strokeWidth={1.8} />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Ergebnis</p>
      <h3 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
        {copy.title}
      </h3>

      <div className="mx-auto mt-8 max-w-2xl rounded-[1.8rem] border border-[rgba(37,99,235,0.2)] bg-[linear-gradient(160deg,#ffffff,var(--color-accent-soft))] px-6 py-9 shadow-[0_28px_70px_-48px_rgba(37,99,235,0.55)] sm:px-10">
        <p className="font-heading text-7xl font-semibold tracking-[-0.07em] text-[var(--color-ink)]">
          {result.modifiedRnd}
          <span className="ml-2 text-2xl font-medium text-[var(--color-text-muted)]">Jahre</span>
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[var(--color-text-muted)]">{copy.body}</p>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-xs leading-6 text-[var(--color-text-muted)]">{RND_DISCLAIMER}</p>
      <button type="button" onClick={onContinue} className="cta-btn mx-auto mt-8 gap-3 px-8 py-4 text-sm">
        Gutachten anfragen
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
