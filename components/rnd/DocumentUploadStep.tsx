import {ClipboardPaste, FileText, ShieldCheck, UploadCloud, X} from 'lucide-react';
import type {ChangeEvent, ClipboardEvent, DragEvent} from 'react';

export const MAX_DOCUMENTS = 6;
export const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024;

export default function DocumentUploadStep({
  files,
  dragActive,
  onFiles,
  onRemove,
  onDragActiveChange,
}: {
  files: File[];
  dragActive: boolean;
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  onDragActiveChange: (value: boolean) => void;
}) {
  const acceptFiles = (incoming: File[]) => onFiles(incoming);
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragActiveChange(false);
    acceptFiles(Array.from(event.dataTransfer.files));
  };
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const pasted = Array.from(event.clipboardData.files);
    if (pasted.length > 0) {
      event.preventDefault();
      acceptFiles(pasted);
    }
  };

  return (
    <div>
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h3 className="text-balance font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">Unterlagen optional ergänzen</h3>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">PDFs können jetzt oder später nachgereicht werden.</p>
      </div>
      <div className="mx-auto max-w-3xl">
        <div
          onDragOver={(event) => {event.preventDefault(); onDragActiveChange(true);}}
          onDragLeave={() => onDragActiveChange(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          className={`rounded-[1.6rem] border-2 border-dashed p-6 text-center outline-none transition sm:p-9 ${dragActive ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border-strong)] bg-white/72 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]'}`}
        >
          <UploadCloud size={34} className="mx-auto text-[var(--color-accent)]" />
          <p className="mt-4 font-heading text-xl font-semibold text-[var(--color-ink)]">PDF hier ablegen oder einfügen</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Bis zu {MAX_DOCUMENTS} Dateien, maximal 15 MB je PDF</p>
          <label className="rnd-secondary-btn mx-auto mt-5 w-fit cursor-pointer"><FileText size={17} />Dateien auswählen<input type="file" accept="application/pdf,.pdf" multiple onChange={handleInput} className="sr-only" /></label>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><ClipboardPaste size={14} />Copy & Paste wird unterstützt</p>
        </div>
        {files.length > 0 ? <div className="mt-4 space-y-2">{files.map((file, index) => <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--color-border)] bg-white px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--color-ink)]">{file.name}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatFileSize(file.size)}</p></div><button type="button" onClick={() => onRemove(index)} aria-label={`${file.name} entfernen`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-50 hover:text-red-600"><X size={17} /></button></div>)}</div> : null}
        <div className="mt-5 flex items-start gap-3 rounded-[1.1rem] bg-[var(--color-surface-muted)] px-4 py-3 text-xs leading-6 text-[var(--color-text-muted)]"><ShieldCheck size={17} className="mt-1 shrink-0 text-[var(--color-accent)]" />Ihre Dateien werden in einem privaten Speicherbereich abgelegt und nur zur Bearbeitung Ihrer Anfrage verwendet.</div>
      </div>
    </div>
  );
}

function formatFileSize(size: number) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}
