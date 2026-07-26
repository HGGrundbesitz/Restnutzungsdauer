'use client';

import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Loader2,
  MessageCircleQuestion,
} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useRef, useState, useTransition} from 'react';
import {calculateRndV2} from '@/lib/rnd/calculate-rnd';
import {getCurrentReferenceDate} from '@/lib/rnd/input-version';
import {
  MODERNIZATION_QUESTION_BY_KEY,
  MODERNIZATION_QUESTIONS,
  type ModernizationQuestionKey,
} from '@/lib/rnd/modernization-question-config';
import {isValidGermanPhone, normalizeGermanPhone} from '@/lib/rnd/phone';
import {
  RND_INPUT_V2_SCHEMA_VERSION,
  type ModernizationAnswersV2,
  type OfficialBuildingTypeCode,
  type RndAnswerIndex,
  type RndContact,
  type RndDocumentUpload,
  type RndInputV2,
  type RndPropertyContext,
  type RndResult,
} from '@/lib/rnd/types';
import {validateRndInputV2} from '@/lib/rnd/validate-input';
import {
  parseRndWizardDraft,
  RND_WIZARD_DRAFT_SCHEMA_VERSION,
  RND_WIZARD_DRAFT_STORAGE_KEY,
} from '@/lib/rnd/wizard-draft';
import {isSupabaseConfigured, supabase} from '@/lib/supabase';
import BuildingTypeStep from './BuildingTypeStep';
import ConstructionYearStep from './ConstructionYearStep';
import ContactStep from './ContactStep';
import DocumentUploadStep, {MAX_DOCUMENTS, MAX_DOCUMENT_SIZE} from './DocumentUploadStep';
import ModernizationQuestionStep from './ModernizationQuestionStep';
import ReviewStep, {type SubmissionStage} from './ReviewStep';
import ResultStep from './ResultStep';
import WizardProgress from './WizardProgress';

type CalculatorStep = 'buildingType' | 'constructionYear' | ModernizationQuestionKey | 'result';
type InquiryStep = 'contact' | 'documents' | 'review' | 'success';
type WizardStep = CalculatorStep | InquiryStep;

const CALCULATOR_STEPS: readonly CalculatorStep[] = [
  'buildingType',
  'constructionYear',
  ...MODERNIZATION_QUESTIONS.map((question) => question.key),
  'result',
];
const INITIAL_CONTACT: RndContact = {firstName: '', lastName: '', email: '', phone: '', consent: false};

export default function RndWizard() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<WizardStep>('buildingType');
  const [referenceDate, setReferenceDate] = useState(() => getCurrentReferenceDate());
  const [buildingTypeCode, setBuildingTypeCode] = useState<OfficialBuildingTypeCode | ''>('');
  const [constructionYear, setConstructionYear] = useState<number | ''>('');
  const [modernization, setModernization] = useState<Partial<ModernizationAnswersV2>>({});
  const [property, setProperty] = useState<RndPropertyContext>({});
  const [contact, setContact] = useState<RndContact>(INITIAL_CONTACT);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [submissionWarning, setSubmissionWarning] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<RndResult | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>('idle');
  const [draftReady, setDraftReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const stepContentRef = useRef<HTMLDivElement>(null);
  const selectionTimerRef = useRef<number | null>(null);
  const submissionLockRef = useRef(false);

  const calculatorIndex = CALCULATOR_STEPS.indexOf(step as CalculatorStep);
  const isCalculatorStep = calculatorIndex >= 0;
  const currentInput = buildV2Input({
    referenceDate,
    buildingTypeCode,
    constructionYear,
    modernization,
  });
  const result = calculateSafe(currentInput);
  const currentQuestion = MODERNIZATION_QUESTION_BY_KEY.get(step as ModernizationQuestionKey);
  const referenceYear = Number(referenceDate.slice(0, 4));

  useEffect(() => {
    stepContentRef.current?.focus({preventScroll: true});
  }, [step]);

  useEffect(() => {
    const draft = parseRndWizardDraft(window.sessionStorage.getItem(RND_WIZARD_DRAFT_STORAGE_KEY));
    if (draft) {
      setStep(draft.step);
      setReferenceDate(draft.referenceDate);
      setBuildingTypeCode(draft.buildingTypeCode);
      setConstructionYear(draft.constructionYear);
      setModernization(draft.modernization);
      setProperty(draft.property);
      setContact(draft.contact);
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady || step === 'success') return;
    window.sessionStorage.setItem(RND_WIZARD_DRAFT_STORAGE_KEY, JSON.stringify({
      schemaVersion: RND_WIZARD_DRAFT_SCHEMA_VERSION,
      savedAt: Date.now(),
      step,
      referenceDate,
      buildingTypeCode,
      constructionYear,
      modernization,
      property,
      contact,
    }));
  }, [
    buildingTypeCode,
    constructionYear,
    contact,
    draftReady,
    modernization,
    property,
    referenceDate,
    step,
  ]);

  useEffect(() => () => {
    if (selectionTimerRef.current !== null) {
      window.clearTimeout(selectionTimerRef.current);
    }
  }, []);

  const goTo = (nextStep: WizardStep) => {
    setError('');
    startTransition(() => setStep(nextStep));
  };

  const goToAfterSelection = (nextStep: WizardStep) => {
    if (selectionTimerRef.current !== null) {
      window.clearTimeout(selectionTimerRef.current);
    }

    const delay = reduceMotion ? 0 : 140;
    if (delay === 0) {
      goTo(nextStep);
      return;
    }

    selectionTimerRef.current = window.setTimeout(() => {
      selectionTimerRef.current = null;
      goTo(nextStep);
    }, delay);
  };

  const goBack = () => {
    if (selectionTimerRef.current !== null) {
      window.clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = null;
    }
    if (step === 'contact') return goTo('result');
    if (step === 'documents') return goTo('contact');
    if (step === 'review') return goTo('documents');
    const index = CALCULATOR_STEPS.indexOf(step as CalculatorStep);
    if (index > 0) goTo(CALCULATOR_STEPS[index - 1]);
  };

  const selectBuildingType = (value: OfficialBuildingTypeCode) => {
    setBuildingTypeCode(value);
    goToAfterSelection('constructionYear');
  };

  const continueFromConstructionYear = (submittedYear: number | '') => {
    if (
      submittedYear === ''
      || !Number.isInteger(submittedYear)
      || submittedYear < 1800
      || submittedYear > referenceYear
    ) {
      setError(`Bitte geben Sie ein ganzzahliges Baujahr zwischen 1800 und ${referenceYear} ein.`);
      return;
    }
    setConstructionYear(submittedYear);
    goTo('roof');
  };

  const selectModernizationAnswer = (
    key: ModernizationQuestionKey,
    value: RndAnswerIndex,
  ) => {
    setModernization((current) => ({...current, [key]: value}));
    const index = CALCULATOR_STEPS.indexOf(key);
    goToAfterSelection(CALCULATOR_STEPS[index + 1]);
  };

  const continueFromContact = () => {
    if (!contact.firstName.trim() || !contact.lastName.trim() || !contact.email.trim()) {
      setError('Bitte füllen Sie Vorname, Nachname und E-Mail-Adresse aus.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }
    if (!isValidGermanPhone(contact.phone)) {
      setError('Bitte geben Sie eine gültige deutsche Telefonnummer ein.');
      return;
    }
    if (!contact.consent) {
      setError('Bitte bestätigen Sie die Datenschutzhinweise.');
      return;
    }
    goTo('documents');
  };

  const handleFiles = (incoming: File[]) => {
    setError('');
    const valid = incoming.filter((file) => {
      if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        setError(`${file.name}: Bitte nur PDF-Dateien auswählen.`);
        return false;
      }
      if (file.size > MAX_DOCUMENT_SIZE) {
        setError(`${file.name}: Die Datei ist größer als 15 MB.`);
        return false;
      }
      return true;
    });
    setFiles((current) => [...current, ...valid].slice(0, MAX_DOCUMENTS));
  };

  const cleanupUploads = async (uploads: RndDocumentUpload[]) => {
    if (uploads.length === 0) return;
    await fetch('/api/rnd-estimate/upload-url', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({uploads}),
      keepalive: true,
    }).catch(() => undefined);
  };

  const uploadFiles = async (): Promise<RndDocumentUpload[]> => {
    if (files.length === 0) return [];
    if (!isSupabaseConfigured) throw new Error('Der Dokumenten-Upload ist noch nicht konfiguriert.');

    const uploads: RndDocumentUpload[] = [];
    try {
      for (const file of files) {
        const response = await fetch('/api/rnd-estimate/upload-url', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type || 'application/pdf',
          }),
        });
        const upload = (await response.json()) as {
          path?: string;
          token?: string;
          cleanupToken?: string;
          error?: string;
        };
        if (!response.ok || !upload.path || !upload.token || !upload.cleanupToken) {
          throw new Error(upload.error || `Upload für ${file.name} konnte nicht vorbereitet werden.`);
        }
        const {error: uploadError} = await supabase.storage
          .from('documents')
          .uploadToSignedUrl(upload.path, upload.token, file, {contentType: 'application/pdf'});
        if (uploadError) throw new Error(`${file.name} konnte nicht hochgeladen werden.`);
        uploads.push({path: upload.path, cleanupToken: upload.cleanupToken});
      }
    } catch (uploadError) {
      await cleanupUploads(uploads);
      throw uploadError;
    }
    return uploads;
  };

  const submit = async () => {
    if (submissionLockRef.current) return;
    if (!currentInput || !result) {
      setError('Die Berechnung ist unvollständig. Bitte prüfen Sie Ihre Angaben.');
      return;
    }
    submissionLockRef.current = true;
    setError('');
    setSubmissionWarning(null);
    setIsSubmitting(true);
    setSubmissionStage('checking');
    let documentUploads: RndDocumentUpload[] = [];
    try {
      await Promise.resolve();
      if (files.length > 0) setSubmissionStage('uploading');
      documentUploads = await uploadFiles();
      setSubmissionStage('saving');
      const normalizedContact = {...contact, phone: normalizeGermanPhone(contact.phone)};
      const response = await fetch('/api/rnd-estimate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: currentInput,
          property,
          contact: normalizedContact,
          documentUploads,
          honeypot,
        }),
      });
      const payload = (await response.json()) as {
        result?: RndResult;
        requestId?: string;
        warning?: string | null;
        error?: string;
      };
      if (!response.ok || !payload.result) {
        throw new Error(payload.error || 'Die Ersteinschätzung konnte nicht übermittelt werden.');
      }
      setSubmissionStage('finishing');
      setSubmittedResult(payload.result);
      setSubmittedRequestId(payload.requestId ?? null);
      setSubmissionWarning(payload.warning ?? null);
      window.sessionStorage.removeItem(RND_WIZARD_DRAFT_STORAGE_KEY);
      setStep('success');
    } catch (submissionError) {
      await cleanupUploads(documentUploads);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Die Ersteinschätzung konnte nicht übermittelt werden.',
      );
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
      setSubmissionStage('idle');
    }
  };

  const reset = () => {
    window.sessionStorage.removeItem(RND_WIZARD_DRAFT_STORAGE_KEY);
    setStep('buildingType');
    setReferenceDate(getCurrentReferenceDate());
    setBuildingTypeCode('');
    setConstructionYear('');
    setModernization({});
    setProperty({});
    setContact(INITIAL_CONTACT);
    setFiles([]);
    setError('');
    setSubmissionWarning(null);
    setSubmittedResult(null);
    setSubmittedRequestId(null);
    setSubmissionStage('idle');
    setHoneypot('');
  };

  if (step === 'success') {
    return (
      <SuccessState
        result={submittedResult}
        requestId={submittedRequestId}
        email={contact.email}
        warning={submissionWarning}
        onReset={reset}
      />
    );
  }

  return (
    <section id="ersteinschaetzung" className="section-shell relative scroll-mt-32 pb-20 pt-4 md:pb-28 md:pt-8">
      <div aria-hidden="true" className="absolute inset-x-[10%] top-20 -z-10 h-72 rounded-full bg-[rgba(111,157,255,0.13)] blur-[100px]" />
      <div className="mb-7 text-center">
        <div className="section-eyebrow mb-4">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Kostenlose Ersteinschätzung
        </div>
        <h2 className="section-title rnd-section-title mx-auto max-w-5xl">Ersteinschätzung der Restnutzungsdauer</h2>
      </div>

      <div className="architectural-card blueprint-lines overflow-hidden rounded-[2.2rem] p-4 sm:p-6 lg:p-9">
        {isCalculatorStep ? (
          <WizardProgress
            currentStep={calculatorIndex + 1}
            totalSteps={CALCULATOR_STEPS.length}
            canGoBack={calculatorIndex > 0}
            onBack={goBack}
          />
        ) : (
          <div className="mb-7 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-5">
            <button type="button" onClick={goBack} className="rnd-back-button">
              <ArrowLeft size={18} />
              Zurück
            </button>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Gutachten anfragen
            </span>
          </div>
        )}

        <div
          ref={stepContentRef}
          tabIndex={-1}
          className="min-h-[34rem] py-2 outline-none sm:py-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? {opacity: 1} : {opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              exit={reduceMotion ? {opacity: 1} : {opacity: 0, x: -20}}
              transition={{duration: reduceMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1]}}
            >
              {step === 'buildingType' ? (
                <BuildingTypeStep value={buildingTypeCode} onChange={selectBuildingType} />
              ) : null}
              {step === 'constructionYear' ? (
                <ConstructionYearStep
                  value={constructionYear}
                  referenceYear={referenceYear}
                  onChange={(value) => {
                    setError('');
                    setConstructionYear(value);
                  }}
                  onContinue={continueFromConstructionYear}
                />
              ) : null}
              {currentQuestion ? (
                <ModernizationQuestionStep
                  config={currentQuestion}
                  selectedValue={modernization[currentQuestion.key]}
                  onSelect={(value) => selectModernizationAnswer(currentQuestion.key, value)}
                />
              ) : null}
              {step === 'result' && result ? (
                <ResultStep result={result} onContinue={() => goTo('contact')} />
              ) : null}
              {step === 'contact' ? (
                <ContactStep
                  value={contact}
                  property={property}
                  honeypot={honeypot}
                  onChange={(patch) => {
                    setError('');
                    setContact((current) => ({...current, ...patch}));
                  }}
                  onPropertyChange={(patch) => {
                    setError('');
                    setProperty((current) => ({...current, ...patch}));
                  }}
                  onHoneypotChange={setHoneypot}
                />
              ) : null}
              {step === 'documents' ? (
                <DocumentUploadStep
                  files={files}
                  dragActive={dragActive}
                  onFiles={handleFiles}
                  onRemove={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  onDragActiveChange={setDragActive}
                />
              ) : null}
              {step === 'review' && result ? (
                <ReviewStep
                  result={result}
                  modernization={modernization as ModernizationAnswersV2}
                  property={property}
                  contact={contact}
                  fileCount={files.length}
                  submissionStage={submissionStage}
                  onEditBuilding={() => goTo('buildingType')}
                  onEditModernization={() => goTo('roof')}
                  onEditContact={() => goTo('contact')}
                  onEditDocuments={() => goTo('documents')}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {error ? (
          <div role="alert" className="mx-auto mt-4 max-w-4xl rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {step === 'contact' ? (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={continueFromContact}
              disabled={isPending}
              className="cta-btn min-w-56 gap-3 px-7 py-4 text-sm"
            >
              Weiter zu Unterlagen
              <ArrowRight size={18} />
            </button>
          </div>
        ) : null}

        {step === 'documents' ? (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => goTo('review')}
              className="cta-btn min-w-64 gap-3 px-7 py-4 text-sm disabled:cursor-wait disabled:opacity-60"
            >
              <ClipboardCheck size={18} />
              Angaben prüfen
              <ArrowRight size={18} />
            </button>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="cta-btn min-w-[19rem] gap-3 px-7 py-4 text-sm disabled:cursor-wait disabled:opacity-65 sm:min-w-[22rem]"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}
              <span>{isSubmitting ? 'Anfrage wird übermittelt' : 'Anfrage unverbindlich übermitteln'}</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function buildV2Input({
  referenceDate,
  buildingTypeCode,
  constructionYear,
  modernization,
}: {
  referenceDate: string;
  buildingTypeCode: OfficialBuildingTypeCode | '';
  constructionYear: number | '';
  modernization: Partial<ModernizationAnswersV2>;
}): RndInputV2 | null {
  if (!buildingTypeCode || constructionYear === '') return null;
  if (MODERNIZATION_QUESTIONS.some((question) => modernization[question.key] === undefined)) return null;

  const input: RndInputV2 = {
    schemaVersion: RND_INPUT_V2_SCHEMA_VERSION,
    buildingTypeCode,
    referenceDate,
    constructionYear,
    modernization: modernization as ModernizationAnswersV2,
  };
  return validateRndInputV2(input).valid ? input : null;
}

function calculateSafe(input: RndInputV2 | null) {
  if (!input) return null;
  try {
    return calculateRndV2(input);
  } catch {
    return null;
  }
}

function SuccessState({
  result,
  requestId,
  email,
  warning,
  onReset,
}: {
  result: RndResult | null;
  requestId: string | null;
  email: string;
  warning: string | null;
  onReset: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const nextSteps = [
    {
      icon: ClipboardCheck,
      title: 'Wir prüfen Ihre Angaben',
      copy: 'Ihre übermittelten Daten und Unterlagen werden fachlich gesichtet.',
    },
    {
      icon: MessageCircleQuestion,
      title: 'Wir melden uns bei Rückfragen',
      copy: 'Falls Informationen fehlen, kontaktieren wir Sie über die angegebenen Kontaktdaten.',
    },
    {
      icon: CheckCircle2,
      title: 'Sie entscheiden unverbindlich',
      copy: 'Ein kostenpflichtiger Auftrag entsteht erst nach Ihrer ausdrücklichen Entscheidung.',
    },
  ] as const;

  return (
    <section id="ersteinschaetzung" className="section-shell py-20 md:py-28">
      <div className="glass-panel overflow-hidden rounded-[2rem] p-7 text-center sm:p-12">
        <motion.div
          initial={reduceMotion ? {opacity: 1} : {opacity: 0, scale: 0.72}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1]}}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        >
          <BadgeCheck size={36} />
        </motion.div>
        <h2 className="mt-6 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl">
          Vielen Dank – Ihre Anfrage wurde übermittelt.
        </h2>
        {result?.modifiedRnd !== null && result?.modifiedRnd !== undefined ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">
            Die übermittelte rechnerische Ersteinschätzung beträgt {result.modifiedRnd} Jahre.
          </p>
        ) : null}
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
          Durch die Übermittlung ist noch kein kostenpflichtiger Auftrag entstanden.
        </p>
        {requestId ? (
          <div className="mx-auto mt-5 max-w-2xl rounded-[1rem] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
            Anfrage-ID: <span className="break-all font-mono font-semibold text-[var(--color-ink)]">{requestId}</span>
          </div>
        ) : null}
        {warning ? (
          <div role="status" className="mx-auto mt-5 max-w-2xl rounded-[1rem] border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm leading-7 text-amber-950">
            <strong className="block">Ihre Anfrage wurde erfolgreich gespeichert.</strong>
            Lediglich die Bestätigungs-E-Mail an {email || 'Ihre E-Mail-Adresse'} konnte gerade nicht versendet werden.
            Bitte senden Sie die Anfrage nicht erneut. Ihre Daten liegen uns bereits vor.
          </div>
        ) : null}
        <div className="mt-10 grid gap-3 text-left md:grid-cols-3">
          {nextSteps.map((item, index) => (
            <motion.article
              key={item.title}
              initial={reduceMotion ? {opacity: 1} : {opacity: 0, y: 16}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.2 + index * 0.1}}
              className="rounded-[1.35rem] border border-[var(--color-border)] bg-white p-5"
            >
              <item.icon size={21} className="text-[var(--color-accent)]" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{item.copy}</p>
            </motion.article>
          ))}
        </div>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="cta-btn min-w-48 gap-2 px-6 py-4 text-sm">
            <Home size={17} />
            Zur Startseite
          </Link>
          <button type="button" onClick={onReset} className="rnd-secondary-btn min-w-48 px-6 py-4">
            Neue Einschätzung starten
          </button>
        </div>
      </div>
    </section>
  );
}
