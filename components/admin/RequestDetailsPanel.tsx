'use client';

import {useState} from 'react';
import {motion} from 'motion/react';
import {AlertTriangle, Calculator, Calendar, ChevronDown, Download, FileText, Loader2, Mail, MapPin, Phone, Sparkles, Trash2, User, X} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import DocumentReviewPanel from '@/components/admin/DocumentReviewPanel';

type QuickCheckAnswer = {
  label: string;
  value: string;
};

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

type RndEstimate = {
  id: string;
  model_version: string;
  stichtag: string;
  building_type_label: string;
  gnd_years: number | null;
  actual_age: number;
  preliminary_rnd: number | null;
  modernization_points_rounded: number;
  modified_rnd: number | null;
  calculation_method: string;
  result_status: 'calculated' | 'manual_review';
  warnings: {code: string; message: string}[];
};

type RequestRecord = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  address: string;
  year: number | null;
  status: 'pending' | 'reviewing' | 'completed';
  documents?: string[];
  source?: string | null;
  quick_check_answers?: QuickCheckAnswer[] | null;
  rnd_estimates?: RndEstimate | RndEstimate[] | null;
};

type RequestDetailsPanelProps = {
  request: RequestRecord;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export default function RequestDetailsPanel({
  request,
  onClose,
  onUpdateStatus,
  onDelete,
  onToast,
}: RequestDetailsPanelProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const estimate = Array.isArray(request.rnd_estimates) ? request.rnd_estimates[0] : request.rnd_estimates;
  const visibleFormAnswers = request.quick_check_answers?.filter(
    (answer) => !HIDDEN_CALCULATION_LABELS.has(answer.label.trim().toLocaleLowerCase('de-DE')),
  ) ?? [];
  const reviewWarnings = estimate?.warnings
    ?.filter((warning) => warning.code !== 'ROUNDING_POLICY_REQUIRES_APPROVAL')
    .map(getReviewWarning) ?? [];

  const handleDownload = async (path: string) => {
    setDownloading(path);

    try {
      const {data, error} = await supabase.storage.from('documents').createSignedUrl(path, 60);

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        onToast?.('Dokument wird in einem neuen Tab geöffnet', 'success');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      onToast?.('Download fehlgeschlagen', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[var(--color-ink)]/18 backdrop-blur-sm"
      />

      <motion.div
        initial={{x: '100%'}}
        animate={{x: 0}}
        exit={{x: '100%'}}
        transition={{type: 'spring', damping: 25, stiffness: 210}}
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-xl flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[0_0_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Anfrage</div>
            <h2 className="mt-1 font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
              Details
            </h2>
          </div>
          <button onClick={onClose} className="admin-ghost-btn rounded-full p-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="admin-card-muted mb-8 rounded-[1.4rem] p-4">
            <label className="mb-3 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Aktueller Status
            </label>
            <div className="flex gap-2">
              {['pending', 'reviewing', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => onUpdateStatus(request.id, status)}
                  className={`flex-1 rounded-[0.95rem] px-3 py-2.5 text-sm font-semibold transition-all ${
                    request.status === status ? 'bg-[var(--color-btn-bg)] text-[var(--color-btn-text)]' : 'admin-ghost-btn'
                  }`}
                >
                  {status === 'pending' ? 'Neu' : status === 'reviewing' ? 'Prüfung' : 'Fertig'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 space-y-5">
            <SectionTitle title="Kundendaten" />
            <div className="grid gap-4">
              <InfoRow icon={<User size={16} />} label="Name" value={request.name} />
              <InfoRow icon={<Mail size={16} />} label="E-Mail" value={request.email} />
              {request.phone ? <InfoRow icon={<Phone size={16} />} label="Telefon" value={request.phone} /> : null}
              <InfoRow icon={<Calendar size={16} />} label="Eingang" value={new Date(request.created_at).toLocaleString('de-DE')} />
              <InfoRow icon={<Sparkles size={16} />} label="Quelle" value={getSourceLabel(request.source)} />
            </div>
          </div>

          <div className="mb-8 space-y-5">
            <SectionTitle title="Immobilie" />
            <div className="grid gap-4">
              <InfoRow icon={<MapPin size={16} />} label="Adresse" value={request.address} />
              <InfoRow icon={<Calendar size={16} />} label="Baujahr" value={request.year || 'Nicht angegeben'} />
            </div>
          </div>

          {visibleFormAnswers.length > 0 ? (
            <div className="mb-8 space-y-5">
              <SectionTitle title="Formularangaben" />
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleFormAnswers.map((answer) => (
                  <div key={answer.label} className="admin-card-muted rounded-[1.15rem] px-4 py-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      {answer.label}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-ink)]">{answer.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {estimate ? (
            <div className="mb-8 space-y-5">
              <SectionTitle title="Ersteinschätzung" />
              <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(37,99,235,0.2)] bg-gradient-to-br from-[var(--color-accent-soft)] to-white shadow-[0_18px_45px_-36px_rgba(37,99,235,0.65)]">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        <Calculator size={15} />
                        Orientierungswert
                      </div>
                      <p className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-[var(--color-ink)]">
                        {estimate.modified_rnd === null ? 'Prüfung nötig' : `${estimate.modified_rnd} Jahre`}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{estimate.building_type_label}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)] shadow-sm">
                      {estimate.result_status === 'calculated' ? 'Vorprüfung' : 'Prüfung nötig'}
                    </span>
                  </div>

                  <p className="mt-5 rounded-[1rem] border border-white/80 bg-white/70 px-4 py-3 text-sm leading-6 text-[var(--color-text-muted)]">
                    Aus den Formularangaben berechnet. Vor der weiteren Verwendung bitte fachlich prüfen.
                  </p>
                </div>

                <details className="group border-t border-[rgba(37,99,235,0.12)] bg-white/55">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-[var(--color-ink)] sm:px-6">
                    Berechnungsdetails
                    <ChevronDown size={17} className="text-[var(--color-text-muted)] transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <EstimateValue label="Übliche Nutzungsdauer" value={estimate.gnd_years === null ? '–' : `${estimate.gnd_years} Jahre`} />
                      <EstimateValue label="Gebäudealter" value={`${estimate.actual_age} Jahre`} />
                      <EstimateValue label="Vor Anpassung" value={estimate.preliminary_rnd === null ? '–' : `${estimate.preliminary_rnd} Jahre`} />
                      <EstimateValue label="Modernisierung" value={`${estimate.modernization_points_rounded} von 20`} />
                    </div>
                    <p className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]">
                      Berechnungsdatum: {new Date(`${estimate.stichtag}T00:00:00`).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </details>
              </div>
              {reviewWarnings.length > 0 ? (
                <div className="space-y-2">
                  {reviewWarnings.map((warning) => (
                    <div key={warning} className="flex items-start gap-2 rounded-[1rem] border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                      {warning}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
              <SectionTitle title="Dokumente" borderless />
              <span className="theme-panel-muted rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
                {request.documents?.length || 0}
              </span>
            </div>

            {!request.documents || request.documents.length === 0 ? (
              <div className="admin-card-muted rounded-[1.25rem] p-4 text-center text-sm text-[var(--color-text-muted)]">
                Zu dieser Anfrage wurden keine Dokumente hochgeladen.
              </div>
            ) : (
              <div className="space-y-3">
                {request.documents.map((path: string, index: number) => {
                  const fileName = path.split('/').pop() || `Dokument ${index + 1}`;
                  const isDownloading = downloading === path;

                  return (
                    <div key={path} className="admin-card-muted rounded-[1.25rem] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="theme-panel-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] text-[var(--color-accent)]">
                            <FileText size={16} />
                          </div>
                          <span className="truncate text-sm font-semibold text-[var(--color-ink)]" title={fileName}>
                            {fileName}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => handleDownload(path)}
                            disabled={isDownloading}
                            aria-label={`${fileName} öffnen`}
                            className="admin-ghost-btn rounded-[0.9rem] p-2"
                          >
                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 border-t border-[var(--color-border)] pt-5">
              <DocumentReviewPanel
                requestId={request.id}
                documentCount={request.documents?.length ?? 0}
                onToast={onToast}
              />
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-sm font-semibold text-red-600">Gefahrenzone</h3>
            <div className="mt-3 rounded-[1.3rem] border border-red-200/60 bg-red-50/70 p-4">
              <p className="mb-3 text-xs leading-6 text-red-600">
                Das Löschen entfernt die Anfrage und alle zugehörigen Daten dauerhaft.
              </p>
              <button
                onClick={() => onDelete(request.id)}
                className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={16} />
                Anfrage löschen
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function getSourceLabel(source?: string | null) {
  if (source === 'rnd_estimate') return 'RND-Ersteinschätzung';
  return source === 'quick_check' ? 'Schnellcheck' : 'Anfrageformular';
}

function getReviewWarning(warning: RndEstimate['warnings'][number]) {
  const messages: Record<string, string> = {
    BUILDING_TYPE_UNKNOWN: 'Gebäudeart bitte manuell zuordnen.',
    NON_RESIDENTIAL_MANUAL_REVIEW: 'Diese Gebäudeart bitte fachlich prüfen.',
    CORE_RENOVATION_MANUAL_REVIEW: 'Kernsanierung bei der Prüfung berücksichtigen.',
    MODERNIZATION_INFORMATION_INCOMPLETE: 'Mindestens eine Angabe zur Modernisierung fehlt.',
    BUILDING_OLDER_THAN_GND: 'Das Gebäudealter liegt über dem üblichen Modellwert. Bitte manuell prüfen.',
  };

  return messages[warning.code] ?? 'Für dieses Ergebnis ist eine kurze fachliche Prüfung sinnvoll.';
}

function EstimateValue({label, value}: {label: string; value: string}) {
  return <div className="rounded-xl border border-white/80 bg-white/78 px-3 py-3"><p className="text-[0.62rem] font-bold uppercase leading-4 tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p><p className="mt-1 font-semibold text-[var(--color-ink)]">{value}</p></div>;
}
function SectionTitle({title, borderless = false}: {title: string; borderless?: boolean}) {
  return (
    <h3 className={`${borderless ? '' : 'border-b border-[var(--color-border)] pb-2'} text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]`}>
      {title}
    </h3>
  );
}

function InfoRow({icon, label, value}: {icon: React.ReactNode; label: string; value: React.ReactNode}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[var(--color-accent)]">{icon}</div>
      <div>
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{label}</div>
        <div className="text-sm text-[var(--color-ink)]">{value}</div>
      </div>
    </div>
  );
}


