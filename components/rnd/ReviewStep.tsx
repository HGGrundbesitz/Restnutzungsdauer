'use client';

import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  Mail,
  Pencil,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {
  getModernizationAnswerLabel,
  MODERNIZATION_QUESTIONS,
} from '@/lib/rnd/modernization-question-config';
import type {
  ModernizationAnswersV2,
  RndContact,
  RndPropertyContext,
  RndResult,
} from '@/lib/rnd/types';

export type SubmissionStage = 'idle' | 'checking' | 'uploading' | 'saving' | 'finishing';

const STAGE_LABELS: Record<Exclude<SubmissionStage, 'idle'>, string> = {
  checking: 'Angaben werden geprüft',
  uploading: 'Unterlagen werden sicher übertragen',
  saving: 'Anfrage wird gespeichert',
  finishing: 'Fast geschafft',
};

export default function ReviewStep({
  result,
  modernization,
  property,
  contact,
  fileCount,
  submissionStage,
  onEditBuilding,
  onEditModernization,
  onEditContact,
  onEditDocuments,
}: {
  result: RndResult;
  modernization: ModernizationAnswersV2;
  property: RndPropertyContext;
  contact: RndContact;
  fileCount: number;
  submissionStage: SubmissionStage;
  onEditBuilding: () => void;
  onEditModernization: () => void;
  onEditContact: () => void;
  onEditDocuments: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isSubmitting = submissionStage !== 'idle';
  const cardMotion = (index: number) => ({
    initial: reduceMotion ? {opacity: 1} : {opacity: 0, y: 18},
    animate: {opacity: 1, y: 0},
    transition: {duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.12 + index * 0.1},
  });

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={reduceMotion ? {opacity: 1} : {opacity: 0, scale: 0.96}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: reduceMotion ? 0 : 0.4}}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
      >
        <FileCheck2 size={30} />
      </motion.div>
      <div className="mx-auto mt-6 max-w-3xl text-center">
        <h3 className="text-balance font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
          Ihre Ersteinschätzung ist bereit
        </h3>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
          Prüfen Sie Ihre Angaben kurz, bevor Sie die Anfrage unverbindlich übermitteln.
        </p>
      </div>

      <div className="relative mt-10 grid gap-4 lg:grid-cols-2">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-[var(--color-border)] lg:block" />

        <motion.section {...cardMotion(0)} className="relative rounded-[1.55rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)] sm:p-6">
          <SummaryHeader icon={Building2} title="Gebäude und Objekt" onEdit={onEditBuilding} disabled={isSubmitting} />
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <SummaryValue label="Gebäudeart" value={result.buildingTypeLabel} />
            <SummaryValue label="Baujahr" value={String(result.constructionYear)} />
            <SummaryValue label="Fläche" value={property.area ? `${property.area.toLocaleString('de-DE')} m²` : 'Nicht angegeben'} />
            <SummaryValue label="Nutzungseinheiten" value={property.units ? String(property.units) : 'Nicht angegeben'} />
          </dl>
          {property.address ? <p className="mt-4 rounded-xl bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--color-text-muted)]">{property.address}</p> : null}
        </motion.section>

        <motion.section {...cardMotion(1)} className="relative rounded-[1.55rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)] sm:p-6">
          <SummaryHeader icon={BadgeCheck} title="Zustand und Modernisierungen" onEdit={onEditModernization} disabled={isSubmitting} />
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Alle acht Bereiche wurden für die rechnerische Orientierung erfasst.
          </p>
          <div className="mt-5 grid gap-x-5 gap-y-3 sm:grid-cols-2">
            {MODERNIZATION_QUESTIONS.map((question) => (
              <div key={question.key} className="border-t border-[var(--color-border)] pt-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{question.eyebrow}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                  {getModernizationAnswerLabel(question.key, modernization[question.key])}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...cardMotion(2)} className="relative rounded-[1.55rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)] sm:p-6">
          <SummaryHeader icon={UserRound} title="Kontaktdaten" onEdit={onEditContact} disabled={isSubmitting} />
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <SummaryValue label="Name" value={`${contact.firstName} ${contact.lastName}`} />
            <SummaryValue label="E-Mail" value={contact.email} />
            <SummaryValue label="Telefon" value={contact.phone || 'Nicht angegeben'} />
            <SummaryValue label="Datenschutz" value={contact.consent ? 'Bestätigt' : 'Noch offen'} />
          </dl>
        </motion.section>

        <motion.section {...cardMotion(3)} className="relative rounded-[1.55rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)] sm:p-6">
          <SummaryHeader icon={UploadCloud} title="Unterlagen" onEdit={onEditDocuments} disabled={isSubmitting} editLabel="Dokumente prüfen" />
          <div className="mt-5 flex items-center gap-4 rounded-[1.1rem] bg-[var(--color-surface-muted)] p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--color-accent)]">
              {fileCount > 0 ? <CheckCircle2 size={21} /> : <Mail size={20} />}
            </span>
            <div>
              <p className="font-heading text-lg font-semibold text-[var(--color-ink)]">
                {fileCount} {fileCount === 1 ? 'Dokument' : 'Dokumente'}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {fileCount > 0 ? 'Wird zusammen mit der Anfrage übertragen.' : 'Unterlagen können später nachgereicht werden.'}
              </p>
            </div>
          </div>
        </motion.section>
      </div>

      {isSubmitting ? (
        <div role="status" aria-live="polite" className="mx-auto mt-7 flex max-w-md items-center justify-center gap-3 rounded-full bg-[var(--color-accent-soft)] px-5 py-3 text-sm font-semibold text-[var(--color-accent)]">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
          {STAGE_LABELS[submissionStage]}
        </div>
      ) : null}
    </div>
  );
}

function SummaryHeader({
  icon: Icon,
  title,
  onEdit,
  disabled,
  editLabel = 'Angaben bearbeiten',
}: {
  icon: typeof Building2;
  title: string;
  onEdit: () => void;
  disabled: boolean;
  editLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Icon size={20} />
        </span>
        <h4 className="font-heading text-lg font-semibold text-[var(--color-ink)]">{title}</h4>
      </div>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className="premium-focus inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Pencil size={14} />
        <span className="hidden sm:inline">{editLabel}</span>
        <span className="sm:hidden">Bearbeiten</span>
      </button>
    </div>
  );
}

function SummaryValue({label, value}: {label: string; value: string}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-semibold leading-6 text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}
