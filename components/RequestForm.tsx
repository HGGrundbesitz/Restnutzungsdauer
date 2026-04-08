'use client';

import {useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowRight, CheckCircle, FileText, Loader2, Upload, X} from 'lucide-react';
import {supabase} from '@/lib/supabase';

export default function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const payload = {
      name: formData.get('name') as string,
      email,
      address: formData.get('street') as string,
      year: formData.get('year') ? parseInt(formData.get('year') as string, 10) : null,
      documents: [] as string[],
    };

    try {
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
          const filePath = `requests/${email.replace(/[^a-zA-Z0-9]/g, '_')}/${fileName}`;

          const {data, error: uploadError} = await supabase.storage.from('documents').upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          return data.path;
        });

        payload.documents = await Promise.all(uploadPromises);
      }

      const {error: supabaseError} = await supabase.from('property_requests').insert([payload]);

      if (supabaseError) {
        throw supabaseError;
      }

      try {
        await fetch('/api/send-request-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            address: payload.address,
            year: payload.year,
            documentsCount: payload.documents.length,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send emails, but request was saved:', emailError);
      }

      setIsSubmitted(true);
      setFiles([]);
    } catch (submitError) {
      console.error('Error submitting to Supabase:', submitError);
      setError('Es gab ein Problem beim Senden Ihrer Anfrage. Bitte versuchen Sie es spaeter erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="anfrage" className="relative z-10 mx-auto max-w-[1200px] px-6 py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
        <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[var(--color-accent-soft)] blur-[100px] opacity-70" />
        <div className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-[var(--color-surface)] blur-[90px] opacity-60" />
      </div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.8}}
        className="mb-16 text-center"
      >
        <h2 className="mb-4 font-heading text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
          Unverbindlich anfragen
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-light text-[var(--color-text-muted)]">
          Geben Sie Ihre Objektdaten ein und laden Sie die Dokumente hoch. Wir pruefen Ihr Potenzial professionell und diskret.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8}}
          className="glass-panel relative overflow-hidden rounded-[2rem] p-8 md:p-10 lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key="form" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0, y: -20}}>
                <h3 className="mb-6 font-heading text-xl font-medium tracking-tight text-[var(--color-ink)]">
                  Immobiliendaten & Upload
                </h3>

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="name">Name</label>
                      <input id="name" name="name" type="text" placeholder="Max Mustermann" required />
                    </div>
                    <div>
                      <label htmlFor="email">E-Mail Adresse</label>
                      <input id="email" name="email" type="email" placeholder="max@beispiel.de" required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="street">Adresse der Immobilie</label>
                    <input id="street" name="street" type="text" placeholder="Musterstrasse 1, 12345 Stadt" required />
                  </div>

                  <div>
                    <label htmlFor="year">Baujahr (optional)</label>
                    <input id="year" name="year" type="number" placeholder="z.B. 1975" />
                  </div>

                  <div className="mt-2">
                    <label>Dokumente hochladen</label>
                    <p className="mb-3 text-xs font-light text-[var(--color-text-muted)]">
                      Bitte laden Sie vorhandene Unterlagen wie Grundbuchauszug oder Objektfotos hoch.
                    </p>

                    <div
                      className={`upload-zone flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-all ${
                        isDragging
                          ? 'border-[var(--color-accent)] bg-[var(--color-surface-strong)] shadow-[0_0_0_4px_var(--color-accent-soft)]'
                          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <div className="theme-panel-muted mb-2 flex h-12 w-12 items-center justify-center rounded-full text-[var(--color-text-muted)]">
                        <Upload size={24} />
                      </div>
                      <span className="text-sm font-normal text-[var(--color-ink)]">Dateien hierhin ziehen oder klicken</span>
                      <span className="text-xs font-light text-[var(--color-text-muted)]">PDF, JPG, PNG (max. 50 MB)</span>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="theme-panel-muted flex items-center justify-between rounded-lg p-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText size={16} className="shrink-0 text-[var(--color-text-muted)]" />
                              <span className="truncate text-sm text-[var(--color-ink)]">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 text-[var(--color-text-muted)] transition-colors hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-btn-bg)] py-4 font-normal text-[var(--color-btn-text)] shadow-[0_4px_12px_rgba(9,9,11,0.15)] transition-all hover:-translate-y-px hover:bg-[var(--color-btn-bg-hover)] hover:shadow-[0_6px_16px_rgba(9,9,11,0.2)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          Kostenlos pruefen lassen
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-center text-xs font-light text-[var(--color-text-muted)]">
                    Vertrauliche Behandlung und verschluesselte Uebertragung garantiert.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle size={40} />
                </div>
                <h3 className="mb-3 font-heading text-2xl font-medium tracking-tight text-[var(--color-ink)]">
                  Anfrage erfolgreich gesendet!
                </h3>
                <p className="mb-8 max-w-sm font-light text-[var(--color-text-muted)]">
                  Vielen Dank fuer Ihre Anfrage. Wir werden uns in Kuerze bei Ihnen melden, um die naechsten Schritte zu besprechen.
                </p>
                <button onClick={() => setIsSubmitted(false)} className="text-sm font-medium text-[var(--color-ink)] hover:underline">
                  Weitere Anfrage stellen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8, delay: 0.1}}
          className="glass-panel relative flex h-fit flex-col overflow-hidden rounded-[2rem] p-8 md:p-10 lg:col-span-2"
        >
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[var(--color-accent-soft)] blur-[40px]" />
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
            Unser Versprechen
          </div>
          <h3 className="mb-2 font-heading text-xl font-medium tracking-tight text-[var(--color-ink)]">
            Transparenz & Qualitaet
          </h3>
          <p className="mb-8 text-sm font-light text-[var(--color-text-muted)]">
            Wir stehen fuer einen reibungslosen Prozess und hoechste Gutachtenqualitaet.
          </p>

          <ul className="mb-10 flex-1 space-y-4">
            <li className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]">
              <CheckCircle className="mt-0.5 text-[var(--color-accent)]" size={18} />
              <span className="font-light">
                <strong className="font-normal text-[var(--color-ink)]">100% Digital</strong> von der Anfrage bis zur Lieferung
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light text-[var(--color-text-muted)]">
              <CheckCircle className="mt-0.5 text-[var(--color-accent)]" size={18} />
              <span>Professionelle Erstellung durch Experten</span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light text-[var(--color-text-muted)]">
              <CheckCircle className="mt-0.5 text-[var(--color-accent)]" size={18} />
              <span>Diskretion und hoechste Datensicherheit</span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light text-[var(--color-text-muted)]">
              <CheckCircle className="mt-0.5 text-[var(--color-accent)]" size={18} />
              <span>Gueltig fuer das deutsche Finanzamt</span>
            </li>
          </ul>

          <div className="flex flex-col border-t border-[var(--color-border)] pt-6">
            <span className="text-sm font-normal text-[var(--color-text-muted)]">
              Ihre Anfrage ist im ersten Schritt absolut unverbindlich.
            </span>
            <span className="theme-panel mt-3 w-fit rounded px-2 py-1 text-xs font-normal text-[var(--color-ink)]">
              Kosten werden transparent kommuniziert
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
