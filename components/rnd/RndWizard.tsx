'use client';

import {AnimatePresence, motion} from 'motion/react';
import {ArrowLeft, ArrowRight, BadgeCheck, Loader2} from 'lucide-react';
import {useState, useTransition} from 'react';
import {calculateRnd} from '@/lib/rnd/calculate-rnd';
import {validateRndInput} from '@/lib/rnd/validate-input';
import {isValidGermanPhone, normalizeGermanPhone} from '@/lib/rnd/phone';
import type {BuildingTypeCode, RndContact, RndDocumentUpload, RndInput, RndPropertyContext, RndResult} from '@/lib/rnd/types';
import {isSupabaseConfigured, supabase} from '@/lib/supabase';
import BuildingDataStep from './BuildingDataStep';
import BuildingTypeStep from './BuildingTypeStep';
import ContactStep from './ContactStep';
import DocumentUploadStep, {MAX_DOCUMENTS, MAX_DOCUMENT_SIZE} from './DocumentUploadStep';
import IntroStep from './IntroStep';
import ModernizationStep from './ModernizationStep';
import PreliminaryResultStep from './PreliminaryResultStep';
import ResultStep from './ResultStep';
import SummaryStep from './SummaryStep';

type WizardStep = 'intro' | 'buildingType' | 'buildingData' | 'preliminary' | 'modernization' | 'summary' | 'result' | 'contact' | 'documents' | 'success';
const STEP_ORDER: WizardStep[] = ['intro', 'buildingType', 'buildingData', 'preliminary', 'modernization', 'summary', 'result', 'contact', 'documents'];

const today = new Date();
const INITIAL_INPUT: RndInput = {
  buildingTypeCode: 'unknown',
  referenceDate: `${today.getFullYear()}-01-01`,
  constructionYear: 0,
  modernization: {
    roof: 'unknown',
    windows: 'unknown',
    pipes: 'unknown',
    heating: 'unknown',
    exteriorWalls: 'unknown',
    bathrooms: 'unknown',
    interior: 'unknown',
    floorplan: 'unknown',
  },
  coreRenovation: false,
};

const INITIAL_CONTACT: RndContact = {firstName: '', lastName: '', email: '', phone: '', consent: false};

export default function RndWizard() {
  const [step, setStep] = useState<WizardStep>('intro');
  const [input, setInput] = useState<RndInput>(INITIAL_INPUT);
  const [buildingTypeSelected, setBuildingTypeSelected] = useState(false);
  const [property, setProperty] = useState<RndPropertyContext>({units: 1});
  const [contact, setContact] = useState<RndContact>(INITIAL_CONTACT);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentIndex = Math.max(0, STEP_ORDER.indexOf(step));
  const progress = step === 'success' ? 100 : (currentIndex / (STEP_ORDER.length - 1)) * 100;
  const result = calculateSafe(input);

  const goTo = (nextStep: WizardStep) => {
    setError('');
    startTransition(() => setStep(nextStep));
  };

  const goBack = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) {
      goTo(STEP_ORDER[index - 1]);
    }
  };

  const goNext = () => {
    if (step === 'buildingType' && !buildingTypeSelected) {
      setError('Bitte wählen Sie eine Gebäudeart oder „nicht eindeutig“ im Auswahlfeld.');
      return;
    }

    if (step === 'buildingData') {
      const validation = validateRndInput(input);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }
    }

    if (step === 'contact') {
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
    }

    const index = STEP_ORDER.indexOf(step);
    if (index >= 0 && index < STEP_ORDER.length - 1) {
      goTo(STEP_ORDER[index + 1]);
    }
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
        body: JSON.stringify({fileName: file.name, fileSize: file.size, contentType: file.type || 'application/pdf'}),
      });
      const upload = (await response.json()) as {path?: string; token?: string; cleanupToken?: string; error?: string};
      if (!response.ok || !upload.path || !upload.token || !upload.cleanupToken) {
        throw new Error(upload.error || `Upload für ${file.name} konnte nicht vorbereitet werden.`);
      }
      const {error: uploadError} = await supabase.storage.from('documents').uploadToSignedUrl(upload.path, upload.token, file, {contentType: 'application/pdf'});
      if (uploadError) throw new Error(`${file.name} konnte nicht hochgeladen werden.`);
      uploads.push({path: upload.path, cleanupToken: upload.cleanupToken});
      }
    } catch (uploadError) {
      await cleanupUploads(uploads);
      throw uploadError;
    }
    return uploads;
  };

  const submit = async (includeFiles = true) => {
    if (!result) {
      setError('Die Berechnung ist unvollständig. Bitte prüfen Sie Ihre Angaben.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    let documentUploads: RndDocumentUpload[] = [];
    try {
        documentUploads = includeFiles ? await uploadFiles() : [];
        const normalizedContact = {...contact, phone: normalizeGermanPhone(contact.phone)};
        const response = await fetch('/api/rnd-estimate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({input, property, contact: normalizedContact, documentUploads, honeypot}),
        });
        const payload = (await response.json()) as {result?: RndResult; error?: string};
        if (!response.ok || !payload.result) throw new Error(payload.error || 'Die Ersteinschätzung konnte nicht übermittelt werden.');
        setStep('success');
    } catch (submissionError) {
      await cleanupUploads(documentUploads);
      setError(submissionError instanceof Error ? submissionError.message : 'Die Ersteinschätzung konnte nicht übermittelt werden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return <SuccessState onReset={() => {setStep('intro'); setInput(INITIAL_INPUT); setBuildingTypeSelected(false); setProperty({units: 1}); setContact(INITIAL_CONTACT); setFiles([]); setError('');}} />;
  }

  return (
    <section id="ersteinschaetzung" className={`section-shell relative scroll-mt-28 ${step === 'intro' ? 'pb-4 pt-0 md:pb-6' : 'pb-20 pt-4 md:pb-28 md:pt-8'}`}>
      <div aria-hidden="true" className="absolute inset-x-[10%] top-20 -z-10 h-72 rounded-full bg-[rgba(111,157,255,0.13)] blur-[100px]" />
      {step !== 'intro' ? (
        <div className="mb-9 text-center">
          <div className="section-eyebrow mb-6">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            Kostenlose Ersteinschätzung
          </div>
          <h2 className="section-title mx-auto max-w-5xl">Jetzt prüfen, ob sich ein Gutachten für Sie lohnt.</h2>
        </div>
      ) : null}

      <div className={`architectural-card blueprint-lines overflow-hidden ${step === 'intro' ? 'rounded-[1.8rem] p-5 sm:p-6 lg:p-6' : 'rounded-[2.2rem] p-4 sm:p-6 lg:p-9'}`}>
        {step !== 'intro' ? (
          <div className="mb-7 flex items-center justify-between gap-3">
            <button type="button" onClick={goBack} className="rnd-secondary-btn px-4 py-3"><ArrowLeft size={17} />Zurück</button>
            <span className="rounded-full border border-[var(--color-border)] bg-white/75 px-4 py-2 text-xs font-bold text-[var(--color-text-muted)]">Schritt {currentIndex} / {STEP_ORDER.length - 1}</span>
          </div>
        ) : null}
        {step !== 'intro' ? <div className="mb-9 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]"><motion.div animate={{width: `${progress}%`}} className="h-full rounded-full bg-[var(--color-accent)]" /></div> : null}

        <div className={`${step === 'intro' ? 'min-h-0 py-0' : 'min-h-[34rem] py-3 sm:py-5'}`}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} transition={{duration: 0.28, ease: [0.16, 1, 0.3, 1]}}>
              {step === 'intro' ? <IntroStep onStart={() => goTo('buildingType')} /> : null}
              {step === 'buildingType' ? <BuildingTypeStep value={buildingTypeSelected ? input.buildingTypeCode : ''} onChange={(buildingTypeCode: BuildingTypeCode) => {setError(''); setBuildingTypeSelected(true); setInput((current) => ({...current, buildingTypeCode}));}} /> : null}
              {step === 'buildingData' ? <BuildingDataStep input={input} property={property} onInputChange={(patch) => {setError(''); setInput((current) => ({...current, ...patch}));}} onPropertyChange={(patch) => {setError(''); setProperty((current) => ({...current, ...patch}));}} /> : null}
              {step === 'preliminary' && result ? <PreliminaryResultStep result={result} /> : null}
              {step === 'modernization' ? <ModernizationStep value={input.modernization} coreRenovation={input.coreRenovation} onChange={(modernization) => {setError(''); setInput((current) => ({...current, modernization}));}} onCoreRenovationChange={(coreRenovation) => {setError(''); setInput((current) => ({...current, coreRenovation}));}} /> : null}
              {step === 'summary' && result ? <SummaryStep input={input} property={property} result={result} /> : null}
              {step === 'result' && result ? <ResultStep result={result} input={input} property={property} onContinue={() => goTo('contact')} onEdit={() => goTo('buildingData')} onError={setError} /> : null}
              {step === 'contact' ? <ContactStep value={contact} honeypot={honeypot} onChange={(patch) => {setError(''); setContact((current) => ({...current, ...patch}));}} onHoneypotChange={setHoneypot} /> : null}
              {step === 'documents' ? <DocumentUploadStep files={files} dragActive={dragActive} onFiles={handleFiles} onRemove={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} onDragActiveChange={setDragActive} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {error ? <div role="alert" className="mx-auto mt-4 max-w-4xl rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {!['intro', 'result'].includes(step) ? (
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {step === 'documents' ? (
              <button type="button" onClick={() => submit(true)} disabled={isSubmitting} className="cta-btn min-w-64 gap-3 px-7 py-4 text-sm disabled:cursor-wait disabled:opacity-60">{isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={18} />}{files.length > 0 ? 'Anfrage mit Unterlagen abschließen' : 'Ohne Unterlagen abschließen'}</button>
            ) : (
              <button type="button" onClick={goNext} disabled={isPending} className="cta-btn min-w-56 gap-3 px-7 py-4 text-sm">{step === 'summary' ? 'Ersteinschätzung berechnen' : 'Weiter'}<ArrowRight size={18} /></button>
            )}
            {step === 'documents' && files.length > 0 ? <button type="button" onClick={() => submit(false)} disabled={isSubmitting} className="rnd-secondary-btn">Ohne Unterlagen abschließen</button> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function calculateSafe(input: RndInput) {
  try { return calculateRnd(input); } catch { return null; }
}

function SuccessState({onReset}: {onReset: () => void}) {
  return <section id="ersteinschaetzung" className="section-shell py-20 md:py-28"><div className="glass-panel rounded-[2rem] p-8 text-center sm:p-12"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><BadgeCheck size={36} /></div><h2 className="mt-6 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl">Vielen Dank – Ihre Ersteinschätzung wurde übermittelt.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">Sie erhalten in Kürze eine Zusammenfassung per E-Mail. Durch die Übermittlung ist noch kein kostenpflichtiger Auftrag entstanden.</p><button type="button" onClick={onReset} className="rnd-secondary-btn mx-auto mt-8">Neue Berechnung starten</button></div></section>;
}
