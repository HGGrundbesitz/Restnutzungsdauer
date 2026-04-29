'use client';

import {AnimatePresence, motion} from 'motion/react';
import {AlertTriangle, Loader2, X} from 'lucide-react';

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export default function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  title = 'Anfrage loeschen',
  message = 'Moechten Sie diese Anfrage wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden und alle zugehörigen Daten werden dauerhaft entfernt.',
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={!isDeleting ? onClose : undefined}
            className="fixed inset-0 z-[100] bg-[var(--color-ink)]/22 backdrop-blur-sm"
          />

          <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{opacity: 0, scale: 0.95, y: 10}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={{opacity: 0, scale: 0.95, y: 10}}
              transition={{type: 'spring', damping: 25, stiffness: 300}}
              className="admin-card pointer-events-auto w-full max-w-md overflow-hidden rounded-[1.8rem]"
            >
              <div className="p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-200/60 bg-red-50/80">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <button onClick={onClose} disabled={isDeleting} className="admin-ghost-btn rounded-full p-2 disabled:opacity-50">
                    <X size={20} />
                  </button>
                </div>

                <h3 className="font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">{message}</p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="admin-ghost-btn rounded-[1rem] px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-[1rem] border border-red-600 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Wird gelöscht...
                    </>
                  ) : (
                    'Endgueltig loeschen'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

