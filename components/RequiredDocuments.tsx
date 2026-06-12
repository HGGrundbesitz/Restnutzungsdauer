'use client';

import {Camera, CheckCircle2, FileText, FolderCheck, ShieldCheck, UploadCloud, type LucideIcon} from 'lucide-react';
import {motion} from 'motion/react';

const coreDocuments = [
  'Baujahr des Gebäudes',
  'Grundrisse oder Bauzeichnungen',
  'Wohn- und Nutzflächenberechnung',
  'Kaufvertrag oder Kaufpreisaufteilung, falls vorhanden',
  'Baubeschreibung, Exposé oder Angaben zur Ausstattung',
  'Modernisierungen, Sanierungen, Anbauten oder Erweiterungen der letzten ca. 20 Jahre',
  'Angaben zu Schäden oder Sanierungsstau',
];

const helpfulDocuments = [
  'Energieausweis',
  'Grundbuchauszug oder Baulasteninformationen',
  'Teilungserklärung bei Eigentumswohnungen',
  'bisheriger Steuerbescheid, AfA-Satz oder Restbuchwert',
  'Denkmalschutz- oder Nutzungsbeschränkungen, falls vorhanden',
];

const photoDocumentation = [
  'Außenansichten des Gebäudes',
  'Dach, Dachboden oder Dämmung',
  'Keller, Heizungsanlage und Leitungen',
  'Fenster, Türen und Innenräume',
  'sichtbare Schäden wie Risse, Feuchtigkeit oder veraltete Technik',
];

export default function RequiredDocuments() {
  return (
    <section id="unterlagen" className="section-shell scroll-mt-32 py-16 md:py-24">
      <motion.div initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8}} className="mb-12 text-center">
        <div className="section-eyebrow mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Unterlagen
        </div>
        <h2 className="section-title mx-auto max-w-5xl">Welche Unterlagen werden benötigt?</h2>
        <p className="section-copy mx-auto mt-5 max-w-3xl">
          Für die erste Einschätzung reicht ein schneller Überblick. Fehlende Unterlagen sind kein Hindernis und können später nachgereicht werden.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.article initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.75}} className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FolderCheck size={26} />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-[var(--color-ink)]">Kernunterlagen</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Möglichst immer hilfreich</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {coreDocuments.map((item) => (
              <div key={item} className="theme-panel-muted flex items-start gap-3 rounded-[1.1rem] p-4">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <span className="text-sm font-semibold leading-6 text-[var(--color-ink)]">{item}</span>
              </div>
            ))}
          </div>
        </motion.article>

        <div className="grid gap-6">
          <InfoCard icon={FileText} title="Zusätzlich hilfreich" items={helpfulDocuments} delay={0.08} />
          <InfoCard icon={Camera} title="Foto-Dokumentation" items={photoDocumentation} delay={0.14} />
        </div>
      </div>

      <motion.div initial={{opacity: 0, y: 18}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-80px'}} transition={{duration: 0.7, delay: 0.12}} className="mt-6 grid gap-4 rounded-[1.6rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl md:grid-cols-2">
        <div className="flex items-start gap-3">
          <UploadCloud size={20} className="mt-1 shrink-0 text-[var(--color-accent)]" />
          <p className="text-sm leading-7 text-[var(--color-text-muted)]">Im QuickCheck können PDF-Dokumente optional hochgeladen werden. Sie können auch ohne Dokumente starten und Unterlagen später ergänzen.</p>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-1 shrink-0 text-[var(--color-accent)]" />
          <p className="text-sm leading-7 text-[var(--color-text-muted)]">Die hochgeladenen Dateien werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet. Details werden in den Datenschutzhinweisen transparent beschrieben.</p>
        </div>
      </motion.div>
    </section>
  );
}

function InfoCard({icon: Icon, title, items, delay}: {icon: LucideIcon; title: string; items: string[]; delay: number}) {
  return (
    <motion.article initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.75, delay}} className="theme-panel-strong rounded-[2rem] p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <Icon size={22} className="text-[var(--color-accent)]" />
        <h3 className="font-heading text-xl font-semibold tracking-tight text-[var(--color-ink)]">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text-muted)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
            {item}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}