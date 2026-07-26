import {ArrowLeft} from 'lucide-react';

export default function WizardProgress({
  currentStep,
  totalSteps,
  canGoBack,
  onBack,
}: {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="rnd-progress-header">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="Zum vorherigen Schritt"
        className="rnd-back-button"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Zurück</span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-[var(--color-text-muted)]">Schritt {currentStep} von {totalSteps}</span>
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">{Math.round(progress)} %</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          aria-label={`Schritt ${currentStep} von ${totalSteps}`}
          className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]"
        >
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300 motion-reduce:transition-none"
            style={{width: `${progress}%`}}
          />
        </div>
      </div>
    </div>
  );
}
