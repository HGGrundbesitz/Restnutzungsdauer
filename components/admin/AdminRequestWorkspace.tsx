'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileSearch,
  FileText,
  History,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import DocumentReviewPanel from '@/components/admin/DocumentReviewPanel';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import {ToastContainer, type ToastProps, type ToastType} from '@/components/admin/Toast';
import {useRequestWorkspace} from '@/components/admin/RequestWorkspaceController';
import {adminFetch} from '@/lib/admin/admin-fetch';
import {
  getRequestEstimate,
  getRequestSourceLabel,
  getRequestStatusLabel,
  type AdminRequestStatus,
} from '@/lib/admin/request-types';
import {
  buildRequestTimeline,
  getRequestNextAction,
  type RequestWorkspaceTab,
} from '@/lib/admin/request-workspace';
import {supabase} from '@/lib/supabase';

const HIDDEN_CALCULATION_LABELS = new Set([
  'gnd',
  'stichtag',
  'gebäudealter',
  'vorläufige rnd',
  'modernisierungspunkte',
  'modifizierte rnd',
  'ergebnisstatus',
  'modellversion',
]);

const TABS: Array<{id: RequestWorkspaceTab; label: string; icon: typeof User}> = [
  {id: 'overview', label: 'Übersicht', icon: User},
  {id: 'documents', label: 'Dokumente', icon: FileText},
  {id: 'review', label: 'Dokumentenprüfung', icon: FileSearch},
  {id: 'history', label: 'Verlauf', icon: History},
];

export default function AdminRequestWorkspace() {
  const router = useRouter();
  const {
    request,
    bundle,
    loading,
    bundleLoading,
    updatingStatus,
    notFound,
    error,
    refresh,
    refreshBundle,
    updateStatus,
  } = useRequestWorkspace();
  const [activeTab, setActiveTab] = useState<RequestWorkspaceTab>('overview');
  const [backHref, setBackHref] = useState('/admin');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  const toastCounterRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextTab = params.get('tab');
    const requestedBackHref = params.get('zurueck');
    if (nextTab && TABS.some((tab) => tab.id === nextTab)) {
      setActiveTab(nextTab as RequestWorkspaceTab);
    }
    if (
      requestedBackHref &&
      requestedBackHref.startsWith('/admin') &&
      !requestedBackHref.startsWith('/admin/anfragen/')
    ) {
      setBackHref(requestedBackHref);
    }
  }, []);

  const addToast = (message: string, type: ToastType = 'info') => {
    toastCounterRef.current += 1;
    setToasts((current) => [...current, {id: `request-toast-${toastCounterRef.current}`, message, type}]);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const selectTab = (tab: RequestWorkspaceTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'overview') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
  };

  const handleStatusChange = async (status: AdminRequestStatus) => {
    try {
      await updateStatus(status);
      addToast(`Status auf „${getRequestStatusLabel(status)}“ gesetzt.`, 'success');
    } catch (statusError) {
      addToast(statusError instanceof Error ? statusError.message : 'Der Status konnte nicht aktualisiert werden.', 'error');
    }
  };

  const handleDownload = async (path: string) => {
    setDownloading(path);
    try {
      const {data, error: downloadError} = await supabase.storage.from('documents').createSignedUrl(path, 60);
      if (downloadError) throw downloadError;
      if (!data?.signedUrl) throw new Error('Für dieses Dokument konnte kein sicherer Link erstellt werden.');
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      addToast('Dokument wird in einem neuen Tab geöffnet.', 'success');
    } catch (downloadError) {
      addToast(downloadError instanceof Error ? downloadError.message : 'Das Dokument konnte nicht geöffnet werden.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    setIsDeleting(true);
    try {
      const response = await adminFetch(`/api/admin/requests/${encodeURIComponent(request.id)}`, {method: 'DELETE'});
      const payload = (await response.json()) as {success?: boolean; warning?: string; error?: string};
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Die Anfrage konnte nicht gelöscht werden.');
      }
      router.push('/admin');
      router.refresh();
    } catch (deleteError) {
      addToast(deleteError instanceof Error ? deleteError.message : 'Die Anfrage konnte nicht gelöscht werden.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <RequestWorkspaceSkeleton />;

  if (notFound) {
    return (
      <WorkspaceMessage
        title="Anfrage nicht gefunden"
        description="Die Anfrage existiert nicht mehr oder ist für dieses Admin-Konto nicht verfügbar."
      />
    );
  }

  if (error || !request || !bundle) {
    return (
      <WorkspaceMessage
        title="Arbeitsbereich konnte nicht geladen werden"
        description={error || 'Bitte laden Sie die Seite erneut.'}
        onRetry={() => void refresh()}
      />
    );
  }

  const estimate = getRequestEstimate(request);
  const documents = request.documents ?? [];
  const visibleFormAnswers =
    request.quick_check_answers?.filter(
      (answer) => !HIDDEN_CALCULATION_LABELS.has(answer.label.trim().toLocaleLowerCase('de-DE')),
    ) ?? [];
  const timeline = buildRequestTimeline(request, bundle);
  const nextAction = getRequestNextAction(request, bundle);
  const pendingFacts = bundle.facts.filter((fact) => fact.review_status === 'pending_review').length;
  const approvedFacts = bundle.facts.filter(
    (fact) => fact.review_status === 'accepted' || fact.review_status === 'edited',
  ).length;
  const rejectedFacts = bundle.facts.filter((fact) => fact.review_status === 'rejected').length;
  const openConflicts = bundle.conflicts.filter((conflict) => conflict.resolution_status === 'open').length;
  const missingInformation = [
    !request.phone ? 'Telefonnummer' : null,
    documents.length === 0 ? 'Dokumente' : null,
    bundle.runs.length > 0 && pendingFacts > 0 ? `${pendingFacts} ungeprüfte Dokumentangaben` : null,
    openConflicts > 0 ? `${openConflicts} offene Widersprüche` : null,
  ].filter((item): item is string => Boolean(item));

  const runNextAction = async () => {
    if (nextAction.statusChange) {
      await handleStatusChange(nextAction.statusChange);
      return;
    }
    selectTab(nextAction.tab);
  };

  return (
    <>
      <div className="mx-auto max-w-[1500px]">
        <header className="admin-card sticky top-3 z-20 rounded-[1.6rem] px-4 py-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.35)] sm:px-5 lg:top-4 lg:rounded-[2rem] lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <Link
                href={backHref}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-xs font-bold text-[var(--color-text-muted)] transition hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <ArrowLeft size={15} />
                Zurück zu Anfragen
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-semibold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
                  {request.name}
                </h1>
                <StatusPill status={request.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--color-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {request.address || 'Keine Objektadresse'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(request.created_at).toLocaleString('de-DE')}
                </span>
                <span>{getRequestSourceLabel(request.source)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="request-status">
                Anfragestatus
              </label>
              <select
                id="request-status"
                value={request.status}
                onChange={(event) => void handleStatusChange(event.target.value as AdminRequestStatus)}
                disabled={updatingStatus}
                className="admin-input min-h-11 rounded-[0.95rem] px-3 text-sm font-semibold"
              >
                <option value="pending">Neu</option>
                <option value="reviewing">In Bearbeitung</option>
                <option value="completed">Abgeschlossen</option>
              </select>
              <button
                type="button"
                onClick={() => void runNextAction()}
                disabled={updatingStatus}
                className="admin-solid-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.95rem] px-4 text-sm font-semibold disabled:opacity-60"
              >
                {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
                {nextAction.label}
              </button>
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-8">
            <nav
              role="tablist"
              aria-label="Anfragebereiche"
              className="admin-card grid grid-cols-2 gap-1 rounded-[1.35rem] p-1.5 sm:flex"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const count =
                  tab.id === 'documents'
                    ? documents.length
                    : tab.id === 'review'
                      ? pendingFacts + openConflicts
                      : undefined;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`request-panel-${tab.id}`}
                    id={`request-tab-${tab.id}`}
                    onClick={() => selectTab(tab.id)}
                    className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-[0.95rem] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:shrink-0 sm:px-3.5 sm:text-xs ${
                      activeTab === tab.id
                        ? 'bg-[var(--color-btn-bg)] text-[var(--color-btn-text)]'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                    {count ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                        }`}
                      >
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <section
              role="tabpanel"
              id={`request-panel-${activeTab}`}
              aria-labelledby={`request-tab-${activeTab}`}
              className="admin-card mt-4 rounded-[1.6rem] p-4 sm:p-6 lg:rounded-[2rem]"
            >
              {activeTab === 'overview' ? (
                <OverviewTab
                  request={request}
                  visibleFormAnswers={visibleFormAnswers}
                  onDelete={() => setIsDeleteModalOpen(true)}
                />
              ) : null}
              {activeTab === 'documents' ? (
                <DocumentsTab
                  documents={documents}
                  runs={bundle.runs}
                  downloading={downloading}
                  onDownload={handleDownload}
                  onReview={() => selectTab('review')}
                />
              ) : null}
              {activeTab === 'review' ? (
                <DocumentReviewPanel
                  requestId={request.id}
                  documentCount={documents.length}
                  reviewBundle={bundle}
                  reviewBundleLoading={bundleLoading}
                  onReviewBundleReload={refreshBundle}
                  onToast={addToast}
                />
              ) : null}
              {activeTab === 'history' ? <HistoryTab timeline={timeline} hasStatusAudit={bundle.statusEvents.length > 0} /> : null}
            </section>
          </div>

          <aside className="min-w-0 xl:col-span-4">
            <div className="space-y-4 xl:sticky xl:top-[10.5rem]">
              <section className="admin-card rounded-[1.6rem] p-5 lg:rounded-[2rem]">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    <Calculator size={15} />
                    Orientierungswert
                  </div>
                  <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Vorprüfung
                  </span>
                </div>
                <p className="mt-4 font-heading text-4xl font-semibold tracking-[-0.06em] text-[var(--color-ink)]">
                  {estimate?.modified_rnd === null || estimate?.modified_rnd === undefined
                    ? 'Prüfung nötig'
                    : `${estimate.modified_rnd} Jahre`}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {estimate?.building_type_label || 'Noch keine rechnerische Ersteinschätzung'}
                </p>
                <div className="mt-4 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-xs leading-5 text-[var(--color-text-muted)]">
                  Rechnerische Orientierung aus den eingereichten Angaben. Kein finales oder fachlich freigegebenes Gutachtenergebnis.
                </div>

                {estimate ? (
                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    <SummaryValue label="Modell" value={getModelVersionLabel(estimate.model_version)} />
                    <SummaryValue label="Methode" value={getCalculationMethodLabel(estimate.calculation_method)} />
                    <SummaryValue label="Gebäudealter" value={`${estimate.actual_age} Jahre`} />
                    <SummaryValue
                      label="Punkte"
                      value={`${estimate.modernization_points_rounded} von 20`}
                    />
                  </dl>
                ) : null}
              </section>

              <section className="admin-card rounded-[1.6rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-[var(--color-ink)]">Prüfstand</h2>
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="admin-ghost-btn rounded-full p-2"
                    aria-label="Arbeitsbereich neu laden"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ReviewNumber label="Offen" value={pendingFacts} tone="amber" />
                  <ReviewNumber label="Bestätigt" value={approvedFacts} tone="green" />
                  <ReviewNumber label="Abgelehnt" value={rejectedFacts} tone="red" />
                  <ReviewNumber label="Widersprüche" value={openConflicts} tone="red" />
                </div>
                <dl className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] text-sm">
                  <SidebarRow label="Dokumente" value={String(documents.length)} />
                  <SidebarRow label="Analyseläufe" value={String(bundle.runs.length)} />
                  <SidebarRow label="Rechenstände" value={String(bundle.calculationSnapshots.length)} />
                </dl>
              </section>

              <section className="admin-card rounded-[1.6rem] p-5">
                <h2 className="text-sm font-semibold text-[var(--color-ink)]">Nächster Schritt</h2>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{nextAction.reason}</p>
                <button
                  type="button"
                  onClick={() => void runNextAction()}
                  disabled={updatingStatus}
                  className="admin-solid-btn mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 text-sm font-semibold disabled:opacity-60"
                >
                  {updatingStatus ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {nextAction.label}
                </button>

                <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    Fehlende Angaben
                  </h3>
                  {missingInformation.length ? (
                    <ul className="mt-3 space-y-2 text-xs text-[var(--color-text-muted)]">
                      {missingInformation.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle2 size={14} />
                      Keine offenen Hinweise erkannt
                    </p>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

function OverviewTab({
  request,
  visibleFormAnswers,
  onDelete,
}: {
  request: NonNullable<ReturnType<typeof useRequestWorkspace>['request']>;
  visibleFormAnswers: Array<{label: string; value: string}>;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Anfrageübersicht"
        description="Übermittelte Kontakt-, Objekt- und Formulardaten in einer fachlich lesbaren Struktur."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoSection title="Kontakt">
          <InfoLine icon={<User size={15} />} label="Name" value={request.name} />
          <InfoLine icon={<Mail size={15} />} label="E-Mail" value={request.email} />
          <InfoLine icon={<Phone size={15} />} label="Telefon" value={request.phone || 'Nicht angegeben'} />
        </InfoSection>
        <InfoSection title="Immobilie">
          <InfoLine icon={<MapPin size={15} />} label="Adresse" value={request.address || 'Nicht angegeben'} />
          <InfoLine icon={<Calendar size={15} />} label="Baujahr" value={request.year ?? 'Nicht angegeben'} />
          <InfoLine icon={<Sparkles size={15} />} label="Quelle" value={getRequestSourceLabel(request.source)} />
        </InfoSection>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Formularangaben</h3>
        {visibleFormAnswers.length ? (
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {visibleFormAnswers.map((answer) => (
              <div key={answer.label} className="admin-card-muted rounded-[1.1rem] px-4 py-3.5">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  {answer.label}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-[var(--color-ink)]">{answer.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EmptyState text="Für diese Anfrage sind keine zusätzlichen Formularangaben gespeichert." />
        )}
      </div>

      <div className="border-t border-[var(--color-border)] pt-6">
        <h3 className="text-sm font-semibold text-red-700">Gefahrenzone</h3>
        <div className="mt-3 flex flex-col gap-4 rounded-[1.25rem] border border-red-200 bg-red-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-6 text-red-700">
            Das Löschen ist endgültig und entfernt die Anfrage sowie zugehörige Daten. Die Aktion muss ausdrücklich bestätigt werden.
          </p>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[0.95rem] border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <Trash2 size={15} />
            Anfrage löschen
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({
  documents,
  runs,
  downloading,
  onDownload,
  onReview,
}: {
  documents: string[];
  runs: Array<{document_path: string; status: string; is_current: boolean; updated_at: string}>;
  downloading: string | null;
  onDownload: (path: string) => Promise<void>;
  onReview: () => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Dokumente"
        description="Private Originaldateien und der aktuelle technische Verarbeitungsstand."
      />
      {documents.length ? (
        <div className="mt-6 space-y-3">
          {documents.map((path, index) => {
            const fileName = path.split('/').pop() || `Dokument ${index + 1}`;
            const currentRun = runs.find((run) => run.document_path === path && run.is_current);
            return (
              <article
                key={path}
                className="flex flex-col gap-4 rounded-[1.2rem] border border-[var(--color-border)] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="theme-panel-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] text-[var(--color-accent)]">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[var(--color-ink)]" title={fileName}>
                      {fileName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span>PDF-Dokument</span>
                      <ProcessingBadge status={currentRun?.status} />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void onDownload(path)}
                  disabled={downloading === path}
                  className="admin-ghost-btn inline-flex min-h-10 items-center justify-center gap-2 rounded-[0.9rem] px-3 text-xs font-semibold disabled:opacity-60"
                >
                  {downloading === path ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Öffnen
                </button>
              </article>
            );
          })}
          <button
            type="button"
            onClick={onReview}
            className="admin-solid-btn mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.95rem] px-4 text-sm font-semibold"
          >
            <FileSearch size={16} />
            Zur Dokumentenprüfung
          </button>
        </div>
      ) : (
        <EmptyState text="Zu dieser Anfrage wurden keine Dokumente hochgeladen." />
      )}
    </div>
  );
}

function HistoryTab({
  timeline,
  hasStatusAudit,
}: {
  timeline: ReturnType<typeof buildRequestTimeline>;
  hasStatusAudit: boolean;
}) {
  return (
    <div>
      <SectionHeading
        title="Verlauf"
        description="Chronologische, unveränderliche Prüf-, Analyse- und Rechenereignisse."
      />
      {!hasStatusAudit ? (
        <div className="mt-5 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Für Bestandsanfragen beginnt die vollständige Statushistorie erst nach Installation der neuen Migration. Erstellung, Analyse- und Prüfereignisse bleiben sichtbar.
        </div>
      ) : null}
      <ol className="mt-6 space-y-0">
        {timeline.map((event, index) => (
          <li key={event.id} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-3 pb-6">
            {index < timeline.length - 1 ? (
              <span className="absolute bottom-0 left-[11px] top-5 w-px bg-[var(--color-border-strong)]" aria-hidden="true" />
            ) : null}
            <span className={`mt-1.5 h-3 w-3 justify-self-center rounded-full ${getTimelineTone(event.tone)}`} aria-hidden="true" />
            <article className="rounded-[1.05rem] border border-[var(--color-border)] bg-white/68 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">{event.title}</h3>
                <time className="text-[11px] text-[var(--color-text-muted)]">
                  {new Date(event.timestamp).toLocaleString('de-DE')}
                </time>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{event.description}</p>
              {event.actor ? (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  {event.actor}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RequestWorkspaceSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px]" aria-label="Anfrage wird geladen" aria-busy="true">
      <div className="admin-card h-36 animate-pulse rounded-[2rem] bg-[var(--color-surface)]" />
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="admin-card h-14 animate-pulse rounded-[1.35rem] bg-[var(--color-surface)]" />
          <div className="admin-card h-[34rem] animate-pulse rounded-[2rem] bg-[var(--color-surface)]" />
        </div>
        <div className="space-y-4 xl:col-span-4">
          <div className="admin-card h-72 animate-pulse rounded-[2rem] bg-[var(--color-surface)]" />
          <div className="admin-card h-52 animate-pulse rounded-[1.6rem] bg-[var(--color-surface)]" />
        </div>
      </div>
      <span className="sr-only">Anfrage wird geladen</span>
    </div>
  );
}

function WorkspaceMessage({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="admin-card mx-auto flex min-h-[28rem] max-w-3xl flex-col items-center justify-center rounded-[2rem] p-8 text-center">
      <div className="theme-panel-muted flex h-14 w-14 items-center justify-center rounded-[1.1rem] text-[var(--color-accent)]">
        <FileSearch size={22} />
      </div>
      <h1 className="mt-5 font-heading text-3xl font-semibold tracking-[-0.045em] text-[var(--color-ink)]">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/admin" className="admin-solid-btn inline-flex min-h-11 items-center gap-2 rounded-[0.95rem] px-4 text-sm font-semibold">
          <ArrowLeft size={15} />
          Zurück zu Anfragen
        </Link>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="admin-ghost-btn min-h-11 rounded-[0.95rem] px-4 text-sm font-semibold">
            Erneut laden
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeading({title, description}: {title: string; description: string}) {
  return (
    <div className="border-b border-[var(--color-border)] pb-5">
      <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}

function InfoSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/68 p-4">
      <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function InfoLine({icon, label, value}: {icon: React.ReactNode; label: string; value: React.ReactNode}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[var(--color-accent)]">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{label}</div>
        <div className="mt-1 break-words text-sm text-[var(--color-ink)]">{value}</div>
      </div>
    </div>
  );
}

function StatusPill({status}: {status: AdminRequestStatus}) {
  const style =
    status === 'completed'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'reviewing'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-amber-100 text-amber-800';
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${style}`}>{getRequestStatusLabel(status)}</span>;
}

function ProcessingBadge({status}: {status?: string}) {
  const label =
    status === 'completed'
      ? 'Analysiert'
      : status === 'failed'
        ? 'Analyse fehlgeschlagen'
        : status === 'processing'
          ? 'In Verarbeitung'
          : 'Nicht analysiert';
  const style =
    status === 'completed'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'failed'
        ? 'bg-red-100 text-red-700'
        : 'bg-slate-100 text-slate-600';
  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${style}`}>{label}</span>;
}

function SummaryValue({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-[0.9rem] border border-[var(--color-border)] bg-white/70 px-3 py-2.5">
      <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-1 text-xs font-semibold text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}

function ReviewNumber({label, value, tone}: {label: string; value: number; tone: 'amber' | 'green' | 'red'}) {
  const style = {
    amber: 'bg-amber-50 text-amber-800',
    green: 'bg-emerald-50 text-emerald-800',
    red: 'bg-red-50 text-red-700',
  }[tone];
  return (
    <div className={`rounded-[0.9rem] px-3 py-2.5 ${style}`}>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-[9px] font-bold uppercase tracking-[0.12em]">{label}</div>
    </div>
  );
}

function SidebarRow({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-xs font-semibold text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}

function EmptyState({text}: {text: string}) {
  return (
    <div className="admin-card-muted mt-5 flex min-h-32 items-center justify-center rounded-[1.2rem] px-5 text-center text-sm text-[var(--color-text-muted)]">
      {text}
    </div>
  );
}

function getTimelineTone(tone: 'neutral' | 'blue' | 'green' | 'amber' | 'red') {
  return {
    neutral: 'bg-slate-400',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }[tone];
}

function getModelVersionLabel(version: string) {
  if (version === 'immowertv-clickflow-v2') return 'Klick-Flow V2';
  if (version === 'immowertv-2022-immowerta-v1') return 'Bestandsmodell V1';
  return version;
}

function getCalculationMethodLabel(method: string) {
  if (method === 'preliminary') return 'GND minus Alter';
  if (method === 'immowertv_formula') return 'Koeffizientenformel';
  if (method === 'manual_review') return 'Fachliche Prüfung';
  return method;
}
