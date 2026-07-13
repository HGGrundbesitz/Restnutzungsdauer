import {AlertTriangle, ArrowRight, Download, RotateCcw} from 'lucide-react';
import {RND_DISCLAIMER, getResultCopy} from '@/lib/rnd/result-copy';
import type {RndInput, RndPropertyContext, RndResult} from '@/lib/rnd/types';

export default function ResultStep({
  result,
  input,
  property,
  onContinue,
  onEdit,
  onError,
}: {
  result: RndResult;
  input: RndInput;
  property: RndPropertyContext;
  onContinue: () => void;
  onEdit: () => void;
  onError: (message: string) => void;
}) {
  const copy = getResultCopy(result);

  const downloadPdf = async () => {
    onError('');
    try {
      const response = await fetch('/api/rnd-estimate/pdf', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({input, property}),
      });
      if (!response.ok) {
        throw new Error('Die PDF-Zusammenfassung konnte nicht erstellt werden.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'RND-Ersteinschaetzung.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'PDF-Download fehlgeschlagen.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center">
        <h3 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">{copy.title}</h3>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.8rem] border border-[rgba(37,99,235,0.2)] bg-[linear-gradient(160deg,#ffffff,var(--color-accent-soft))] p-7 text-center shadow-[0_28px_70px_-48px_rgba(37,99,235,0.55)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Rechnerische, vorläufige Restnutzungsdauer</p>
          {result.modifiedRnd === null ? (
            <p className="mt-6 font-heading text-3xl font-semibold text-[var(--color-ink)]">Manuelle Prüfung</p>
          ) : (
            <p className="mt-5 font-heading text-7xl font-semibold tracking-[-0.07em] text-[var(--color-ink)]">{result.modifiedRnd}<span className="ml-2 text-2xl font-medium text-[var(--color-text-muted)]">Jahre</span></p>
          )}
        </div>
        <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-white/84 p-6 sm:p-8">
          <p className="text-base leading-8 text-[var(--color-text-muted)]">{copy.body}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ResultValue label="GND" value={result.gndYears ? `${result.gndYears} J.` : '-'} />
            <ResultValue label="Alter" value={`${result.actualAge} J.`} />
            <ResultValue label="Punkte" value={`${result.modernizationPointsRounded}/20`} />
          </div>
          {result.warnings.length > 0 ? (
            <details className="mt-5 rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <summary className="flex cursor-pointer items-center gap-2 font-semibold"><AlertTriangle size={17} />Hinweise zur Prüfung</summary>
              <ul className="mt-3 space-y-2 pl-6 text-xs leading-5">
                {result.warnings.map((warning) => <li key={warning.code} className="list-disc">{warning.message}</li>)}
              </ul>
            </details>
          ) : null}
        </div>
      </div>
      <p className="mt-6 text-xs leading-6 text-[var(--color-text-muted)]">{RND_DISCLAIMER}</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onContinue} className="cta-btn gap-3 px-7 py-4 text-sm">Zusammenfassung per E-Mail<ArrowRight size={18} /></button>
        <button type="button" onClick={downloadPdf} className="rnd-secondary-btn"><Download size={17} />PDF herunterladen</button>
        <button type="button" onClick={onEdit} className="rnd-secondary-btn"><RotateCcw size={17} />Angaben korrigieren</button>
      </div>
    </div>
  );
}

function ResultValue({label, value}: {label: string; value: string}) {
  return <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3"><p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{label}</p><p className="mt-1 font-heading text-xl font-semibold text-[var(--color-ink)]">{value}</p></div>;
}
