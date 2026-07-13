'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  FileSearch,
  Filter,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {
  DOCUMENT_FIELD_LABELS,
  type DocumentConflictRecord,
  type DocumentFactRecord,
  type FactReviewStatus,
  type NormalizedFactValue,
  type ReviewBundle,
} from '@/lib/rnd/document-analysis/types';
import type {ReviewedFactMappingPreview} from '@/lib/rnd/map-reviewed-facts-to-input';
import type {RndResult} from '@/lib/rnd/types';

type DocumentReviewPanelProps = {
  requestId: string;
  documentCount: number;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
};

type CalculationResponse = {
  preview: ReviewedFactMappingPreview;
  result?: RndResult;
  snapshot?: {id: string; created_at: string};
};

const STATUS_LABELS: Record<FactReviewStatus, string> = {
  pending_review: 'Offen',
  accepted: 'Übernommen',
  edited: 'Bearbeitet',
  rejected: 'Abgelehnt',
};

export default function DocumentReviewPanel({requestId, documentCount, onToast}: DocumentReviewPanelProps) {
  const [bundle, setBundle] = useState<ReviewBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [documentFilter, setDocumentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [resolvingConflictId, setResolvingConflictId] = useState<string | null>(null);
  const [resolutionValue, setResolutionValue] = useState('');
  const [calculation, setCalculation] = useState<CalculationResponse | null>(null);
  const [loadingCalculation, setLoadingCalculation] = useState(false);

  const loadBundle = useCallback(async () => {
    try {
      const response = await adminFetch(`/api/admin/requests/${requestId}/document-review`);
      const result = (await response.json()) as ReviewBundle & {error?: string};
      if (!response.ok) throw new Error(result.error || 'Die Dokumentprüfung konnte nicht geladen werden.');
      setBundle(result);
    } catch (error) {
      onToast?.(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast, requestId]);

  useEffect(() => {
    setLoading(true);
    setBundle(null);
    setCalculation(null);
    void loadBundle();
  }, [loadBundle]);

  const openConflictFactIds = useMemo(
    () => new Set(bundle?.conflicts.filter((conflict) => conflict.resolution_status === 'open').flatMap((conflict) => conflict.fact_ids) ?? []),
    [bundle?.conflicts],
  );
  const files = useMemo(
    () => Array.from(new Set(bundle?.facts.map((fact) => fact.file_name) ?? [])),
    [bundle?.facts],
  );
  const visibleFacts = useMemo(
    () =>
      (bundle?.facts ?? []).filter(
        (fact) =>
          (documentFilter === 'all' || fact.file_name === documentFilter) &&
          (statusFilter === 'all' || fact.review_status === statusFilter || (statusFilter === 'conflict' && openConflictFactIds.has(fact.id))),
      ),
    [bundle?.facts, documentFilter, openConflictFactIds, statusFilter],
  );

  const analyzeDocuments = async () => {
    if (
      bundle?.runs.length &&
      !window.confirm(
        'Die erneute Prüfung ersetzt die bisher erkannten Angaben und deren Prüfentscheidungen. Möchten Sie fortfahren?',
      )
    ) {
      return;
    }
    setAnalyzing(true);
    try {
      const response = await adminFetch('/api/analyze-document', {
        method: 'POST',
        body: JSON.stringify({requestId, force: Boolean(bundle?.runs.length)}),
      });
      const result = (await response.json()) as {error?: string; results?: Array<{status: string}>};
      if (!response.ok) throw new Error(result.error || 'Die Dokumente konnten nicht geprüft werden.');
      const completed = result.results?.filter((item) => item.status !== 'failed').length ?? 0;
      const failed = result.results?.filter((item) => item.status === 'failed').length ?? 0;
      onToast?.(
        failed > 0
          ? `${completed} Dokument${completed === 1 ? '' : 'e'} geprüft, ${failed} nicht ausgewertet`
          : `${completed} Dokument${completed === 1 ? '' : 'e'} geprüft`,
        failed > 0 ? 'info' : 'success',
      );
      setCalculation(null);
      await loadBundle();
    } catch (error) {
      onToast?.(getErrorMessage(error), 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const reviewFact = async (fact: DocumentFactRecord, action: 'accept' | 'edit' | 'reject') => {
    setBusyId(fact.id);
    try {
      const value = action === 'edit' ? parseEditorValue(editValue, fact.normalized_value) : undefined;
      const response = await adminFetch(`/api/admin/document-facts/${fact.id}`, {
        method: 'PATCH',
        body: JSON.stringify({action, value}),
      });
      const result = (await response.json()) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'Die Entscheidung konnte nicht gespeichert werden.');
      setEditingFactId(null);
      setEditValue('');
      setCalculation(null);
      await loadBundle();
      onToast?.('Prüfentscheidung gespeichert', 'success');
    } catch (error) {
      onToast?.(getErrorMessage(error), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const resolveConflict = async (conflict: DocumentConflictRecord, action: 'resolve' | 'acknowledge') => {
    setBusyId(conflict.id);
    try {
      const exampleValue = conflict.source_values[0]?.value ?? '';
      const value = action === 'resolve' ? parseEditorValue(resolutionValue, exampleValue) : undefined;
      const response = await adminFetch(`/api/admin/document-conflicts/${conflict.id}`, {
        method: 'PATCH',
        body: JSON.stringify({action, value}),
      });
      const result = (await response.json()) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'Der Widerspruch konnte nicht gespeichert werden.');
      setResolvingConflictId(null);
      setResolutionValue('');
      setCalculation(null);
      await loadBundle();
      onToast?.('Widerspruch gespeichert', 'success');
    } catch (error) {
      onToast?.(getErrorMessage(error), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const loadCalculationPreview = async () => {
    setLoadingCalculation(true);
    try {
      const response = await adminFetch(`/api/admin/requests/${requestId}/calculation-preview`);
      const result = (await response.json()) as CalculationResponse & {error?: string};
      if (!response.ok) throw new Error(result.error || 'Die Rechenwerte konnten nicht vorbereitet werden.');
      setCalculation(result);
    } catch (error) {
      onToast?.(getErrorMessage(error), 'error');
    } finally {
      setLoadingCalculation(false);
    }
  };

  const runApprovedCalculation = async () => {
    setLoadingCalculation(true);
    try {
      const response = await adminFetch(`/api/admin/requests/${requestId}/calculation-preview`, {
        method: 'POST',
        body: JSON.stringify({confirm: true}),
      });
      const result = (await response.json()) as CalculationResponse & {error?: string};
      if (!response.ok) throw new Error(result.error || 'Die neue Berechnung konnte nicht gespeichert werden.');
      setCalculation(result);
      onToast?.('Neue Rechenprüfung gespeichert', 'success');
    } catch (error) {
      onToast?.(getErrorMessage(error), 'error');
    } finally {
      setLoadingCalculation(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-card-muted flex items-center justify-center rounded-[1.25rem] px-4 py-8 text-sm text-[var(--color-text-muted)]">
        <Loader2 size={17} className="mr-2 animate-spin text-[var(--color-accent)]" />
        Dokumentprüfung wird geladen
      </div>
    );
  }

  const acceptedCount = bundle?.facts.filter((fact) => fact.review_status === 'accepted' || fact.review_status === 'edited').length ?? 0;
  const pendingCount = bundle?.facts.filter((fact) => fact.review_status === 'pending_review').length ?? 0;
  const openConflicts = bundle?.conflicts.filter((conflict) => conflict.resolution_status === 'open') ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
            <FileSearch size={17} className="text-[var(--color-accent)]" />
            Angaben aus Dokumenten
          </div>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
            Erkannte Angaben werden erst nach Ihrer Prüfung verwendet.
          </p>
        </div>
        <button
          type="button"
          onClick={analyzeDocuments}
          disabled={analyzing || documentCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--color-btn-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--color-btn-text)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
        >
          {analyzing ? <Loader2 size={15} className="animate-spin" /> : bundle?.runs.length ? <RefreshCw size={15} /> : <Sparkles size={15} />}
          {bundle?.runs.length ? 'Erneut prüfen' : 'Dokumente prüfen'}
        </button>
      </div>

      {bundle?.runs.some((run) => run.status === 'failed') ? (
        <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Mindestens ein Dokument konnte nicht ausgewertet werden. Sie können die Prüfung erneut starten.
        </div>
      ) : null}

      {bundle?.runs.length ? (
        <div className="grid grid-cols-3 gap-2">
          <ReviewMetric label="Offen" value={pendingCount} tone="amber" />
          <ReviewMetric label="Bestätigt" value={acceptedCount} tone="green" />
          <ReviewMetric label="Widersprüche" value={openConflicts.length} tone="red" />
        </div>
      ) : (
        <div className="admin-card-muted rounded-[1.25rem] px-4 py-5 text-sm leading-6 text-[var(--color-text-muted)]">
          Starten Sie die Prüfung, um belegte Angaben mit Quelle und PDF-Seite zu erhalten.
        </div>
      )}

      {openConflicts.length > 0 ? (
        <div className="space-y-3">
          {openConflicts.map((conflict) => (
            <ConflictCard
              key={conflict.id}
              conflict={conflict}
              busy={busyId === conflict.id}
              isResolving={resolvingConflictId === conflict.id}
              resolutionValue={resolutionValue}
              onResolutionValueChange={setResolutionValue}
              onStartResolve={() => {
                setResolvingConflictId(conflict.id);
                setResolutionValue(formatValue(conflict.source_values[0]?.value ?? ''));
              }}
              onCancel={() => setResolvingConflictId(null)}
              onResolve={(action) => void resolveConflict(conflict, action)}
            />
          ))}
        </div>
      ) : null}

      {bundle?.facts.length ? (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <FilterSelect value={documentFilter} onChange={setDocumentFilter} ariaLabel="Dokument filtern">
              <option value="all">Alle Dokumente</option>
              {files.map((file) => <option key={file} value={file}>{file}</option>)}
            </FilterSelect>
            <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Prüfstatus filtern">
              <option value="all">Alle Prüfstatus</option>
              <option value="pending_review">Offen</option>
              <option value="accepted">Übernommen</option>
              <option value="edited">Bearbeitet</option>
              <option value="rejected">Abgelehnt</option>
              <option value="conflict">Widerspruch</option>
            </FilterSelect>
          </div>

          <div className="space-y-3">
            {visibleFacts.map((fact) => (
              <FactCard
                key={fact.id}
                fact={fact}
                hasConflict={openConflictFactIds.has(fact.id)}
                sourceUrl={bundle.signedDocumentUrls[fact.document_path]}
                busy={busyId === fact.id}
                editing={editingFactId === fact.id}
                editValue={editValue}
                onEditValueChange={setEditValue}
                onStartEdit={() => {
                  setEditingFactId(fact.id);
                  setEditValue(formatValue(fact.reviewed_value ?? fact.normalized_value));
                }}
                onCancelEdit={() => setEditingFactId(null)}
                onAction={(action) => void reviewFact(fact, action)}
              />
            ))}
          </div>

          <div className="rounded-[1.35rem] border border-[var(--color-border)] bg-white/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-ink)]">Bestätigte Rechenwerte</h4>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                  Original und bestätigte Werte werden vor einer neuen Berechnung gegenübergestellt.
                </p>
              </div>
              <button
                type="button"
                onClick={loadCalculationPreview}
                disabled={loadingCalculation || acceptedCount === 0}
                className="admin-ghost-btn inline-flex items-center justify-center gap-2 rounded-[0.9rem] px-3.5 py-2.5 text-xs font-semibold disabled:opacity-50"
              >
                {loadingCalculation ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Werte vergleichen
              </button>
            </div>

            {calculation?.preview ? (
              <CalculationPreview
                calculation={calculation}
                busy={loadingCalculation}
                onCalculate={() => void runApprovedCalculation()}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FactCard({
  fact,
  hasConflict,
  sourceUrl,
  busy,
  editing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
  onAction,
}: {
  fact: DocumentFactRecord;
  hasConflict: boolean;
  sourceUrl?: string;
  busy: boolean;
  editing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onAction: (action: 'accept' | 'edit' | 'reject') => void;
}) {
  const shownValue = fact.reviewed_value ?? fact.normalized_value;
  return (
    <article className={`rounded-[1.2rem] border p-4 ${hasConflict ? 'border-amber-300 bg-amber-50/65' : 'border-[var(--color-border)] bg-white/78'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--color-ink)]">{DOCUMENT_FIELD_LABELS[fact.field_key]}</h4>
            <StatusBadge status={fact.review_status} conflict={hasConflict} />
          </div>
          <p className="mt-2 break-words font-heading text-xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            {formatValue(shownValue)}
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-text-muted)]">
          Erkennung {Math.round(fact.confidence * 100)} %
        </span>
      </div>

      <blockquote className="mt-3 rounded-[0.9rem] border-l-2 border-[var(--color-accent)] bg-[var(--color-surface)] px-3 py-2.5 text-xs leading-5 text-[var(--color-text-muted)]">
        „{fact.evidence_text}“
      </blockquote>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-text-muted)]">
        <span>{fact.file_name} · Seite {fact.page_number}</span>
        {sourceUrl ? (
          <button type="button" onClick={() => window.open(`${sourceUrl}#page=${fact.page_number}`, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent)]">
            Quelle öffnen <ExternalLink size={12} />
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={editValue}
            onChange={(event) => onEditValueChange(event.target.value)}
            className="min-w-0 flex-1 rounded-[0.85rem] border border-[var(--color-border-strong)] bg-white px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            aria-label={`${DOCUMENT_FIELD_LABELS[fact.field_key]} bearbeiten`}
          />
          <button type="button" onClick={() => onAction('edit')} disabled={busy} className="rounded-[0.85rem] bg-[var(--color-btn-bg)] px-3 py-2 text-xs font-semibold text-white">Speichern</button>
          <button type="button" onClick={onCancelEdit} className="admin-ghost-btn rounded-[0.85rem] px-3 py-2 text-xs font-semibold">Abbrechen</button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton icon={<Check size={13} />} label="Übernehmen" onClick={() => onAction('accept')} disabled={busy} />
          <ActionButton icon={<Pencil size={13} />} label="Bearbeiten" onClick={onStartEdit} disabled={busy} />
          <ActionButton icon={<X size={13} />} label="Ablehnen" onClick={() => onAction('reject')} disabled={busy} danger />
        </div>
      )}
    </article>
  );
}

function ConflictCard({
  conflict,
  busy,
  isResolving,
  resolutionValue,
  onResolutionValueChange,
  onStartResolve,
  onCancel,
  onResolve,
}: {
  conflict: DocumentConflictRecord;
  busy: boolean;
  isResolving: boolean;
  resolutionValue: string;
  onResolutionValueChange: (value: string) => void;
  onStartResolve: () => void;
  onCancel: () => void;
  onResolve: (action: 'resolve' | 'acknowledge') => void;
}) {
  return (
    <div className="rounded-[1.2rem] border border-amber-300 bg-amber-50/80 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-700" />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-amber-950">Widerspruch: {DOCUMENT_FIELD_LABELS[conflict.field_key]}</h4>
          <div className="mt-3 space-y-2">
            {conflict.source_values.map((source) => (
              <div key={`${source.kind}:${source.id}`} className="flex items-start justify-between gap-3 rounded-[0.8rem] bg-white/80 px-3 py-2 text-xs">
                <span className="text-amber-900/70">{source.label}</span>
                <strong className="text-right text-amber-950">{formatValue(source.value)}</strong>
              </div>
            ))}
          </div>
          {isResolving ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input value={resolutionValue} onChange={(event) => onResolutionValueChange(event.target.value)} className="min-w-0 flex-1 rounded-[0.85rem] border border-amber-300 bg-white px-3 py-2.5 text-sm outline-none" aria-label="Bestätigten Wert festlegen" />
              <button type="button" onClick={() => onResolve('resolve')} disabled={busy} className="rounded-[0.85rem] bg-amber-900 px-3 py-2 text-xs font-semibold text-white">Wert bestätigen</button>
              <button type="button" onClick={onCancel} className="rounded-[0.85rem] border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900">Abbrechen</button>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onStartResolve} className="rounded-[0.8rem] bg-amber-900 px-3 py-2 text-xs font-semibold text-white">Konflikt lösen</button>
              <button type="button" onClick={() => onResolve('acknowledge')} disabled={busy} className="rounded-[0.8rem] border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900">Als Hinweis behalten</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalculationPreview({calculation, busy, onCalculate}: {calculation: CalculationResponse; busy: boolean; onCalculate: () => void}) {
  const {preview, result} = calculation;
  return (
    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
      {preview.blockedFields.length > 0 ? (
        <div className="rounded-[0.9rem] border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
          Bitte zuerst lösen: {preview.blockedFields.map((field) => DOCUMENT_FIELD_LABELS[field]).join(', ')}
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
        {preview.changes.map((change) => (
          <div key={`${change.fieldKey}:${change.target}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[0.9rem] bg-[var(--color-surface)] px-3 py-2.5 text-xs">
            <div><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Bisher</span><span className="font-semibold text-[var(--color-ink)]">{formatValue(change.originalValue)}</span></div>
            <ArrowRight size={13} className="text-[var(--color-accent)]" />
            <div className="text-right"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Bestätigt</span><span className="font-semibold text-[var(--color-ink)]">{formatValue(change.acceptedValue)}</span></div>
          </div>
        ))}
        {preview.changes.length === 0 ? <p className="text-xs text-[var(--color-text-muted)]">Noch keine bestätigten Werte für den Rechner.</p> : null}
      </div>
      {result ? (
        <div className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Neue Rechenprüfung</div>
          <div className="mt-1 font-heading text-2xl font-semibold text-emerald-950">{result.modifiedRnd === null ? 'Fachliche Prüfung nötig' : `${result.modifiedRnd} Jahre`}</div>
          <p className="mt-1 text-xs text-emerald-800">Als neuer Prüfstand gespeichert. Das ursprüngliche Formular bleibt unverändert.</p>
        </div>
      ) : (
        <button type="button" onClick={onCalculate} disabled={busy || !preview.canCalculate || preview.changes.length === 0} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--color-btn-bg)] px-4 py-3 text-xs font-semibold text-white disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Bestätigte Werte neu berechnen
        </button>
      )}
    </div>
  );
}

function ReviewMetric({label, value, tone}: {label: string; value: number; tone: 'amber' | 'green' | 'red'}) {
  const tones = {amber: 'bg-amber-50 text-amber-800', green: 'bg-emerald-50 text-emerald-800', red: 'bg-red-50 text-red-700'};
  return <div className={`rounded-[0.9rem] px-3 py-2.5 ${tones[tone]}`}><div className="text-lg font-semibold">{value}</div><div className="text-[10px] font-bold uppercase tracking-[0.12em]">{label}</div></div>;
}

function StatusBadge({status, conflict}: {status: FactReviewStatus; conflict: boolean}) {
  if (conflict) return <span className="rounded-full bg-amber-200 px-2 py-1 text-[10px] font-bold text-amber-900">Widerspruch</span>;
  const styles: Record<FactReviewStatus, string> = {
    pending_review: 'bg-slate-100 text-slate-600',
    accepted: 'bg-emerald-100 text-emerald-700',
    edited: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}

function ActionButton({icon, label, onClick, disabled, danger = false}: {icon: React.ReactNode; label: string; onClick: () => void; disabled: boolean; danger?: boolean}) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1.5 rounded-[0.8rem] border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${danger ? 'border-red-200 bg-red-50 text-red-700' : 'border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-accent)]'}`}>{icon}{label}</button>;
}

function FilterSelect({value, onChange, ariaLabel, children}: {value: string; onChange: (value: string) => void; ariaLabel: string; children: React.ReactNode}) {
  return <label className="relative flex-1"><Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" /><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel} className="w-full appearance-none rounded-[0.9rem] border border-[var(--color-border)] bg-white py-2.5 pl-8 pr-8 text-xs font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]">{children}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" /></label>;
}

async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const {data, error} = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Bitte melden Sie sich erneut im Adminbereich an.');
  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
      ...init.headers,
    },
    cache: 'no-store',
  });
}

function parseEditorValue(value: string, example: NormalizedFactValue): NormalizedFactValue {
  const trimmed = value.trim();
  if (typeof example === 'number') {
    const parsed = Number(trimmed.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : trimmed;
  }
  if (typeof example === 'boolean') {
    if (/^(ja|true|1)$/i.test(trimmed)) return true;
    if (/^(nein|false|0)$/i.test(trimmed)) return false;
  }
  return trimmed;
}

function formatValue(value: NormalizedFactValue | undefined) {
  if (value === null || value === undefined || value === '') return '–';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  return String(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Die Aktion konnte nicht ausgeführt werden.';
}
