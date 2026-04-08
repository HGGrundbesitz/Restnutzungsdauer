'use client';

import {useEffect} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {CheckCircle, Info, X, XCircle} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastProps = {
  id: string;
  message: string;
  type?: ToastType;
  onClose: (id: string) => void;
};

export default function Toast({id, message, type = 'info', onClose}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-[var(--color-accent)]" size={20} />,
  };

  const bgColors = {
    success: 'border-emerald-200/60 bg-emerald-50/90',
    error: 'border-red-200/60 bg-red-50/90',
    info: 'border-[var(--color-border)] bg-[var(--color-surface-strong)]',
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 20, scale: 0.95}}
      animate={{opacity: 1, y: 0, scale: 1}}
      exit={{opacity: 0, y: -20, scale: 0.95}}
      transition={{type: 'spring', damping: 25, stiffness: 300}}
      className={`pointer-events-auto flex items-center gap-3 rounded-[1rem] border px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.32)] ${bgColors[type]}`}
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium text-[var(--color-ink)]">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-2 rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-ink)]"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
