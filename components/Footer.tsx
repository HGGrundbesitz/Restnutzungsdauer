export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-10 pt-16 sm:pt-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-16 grid grid-cols-1 gap-10 md:mb-20 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4 flex flex-col items-start">
            <a href="#" className="flex items-center gap-3 group">
              <span className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--color-ink)]">
                RND Gutachten
              </span>
            </a>
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-[var(--color-text-muted)]">
              Ihr digitaler Partner für finanzamtsnahe Restnutzungsdauer-Gutachten. Wir helfen Immobilienbesitzern,
              ihre Steuerlast effizient und legal zu senken.
            </p>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Plattform</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              <li><a href="#vorteile" className="transition-colors hover:text-[var(--color-ink)]">Vorteile</a></li>
              <li><a href="#ablauf" className="transition-colors hover:text-[var(--color-ink)]">Ablauf</a></li>
              <li><a href="#faq" className="transition-colors hover:text-[var(--color-ink)]">FAQ</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Wissen</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              <li><a href="#" className="transition-colors hover:text-[var(--color-ink)]">Was ist die AfA?</a></li>
              <li><a href="#" className="transition-colors hover:text-[var(--color-ink)]">Finanzamtsicht</a></li>
              <li><a href="#" className="transition-colors hover:text-[var(--color-ink)]">Rechner</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Rechtliches</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              <li><a href="#" className="transition-colors hover:text-[var(--color-ink)]">Impressum</a></li>
              <li><a href="#" className="transition-colors hover:text-[var(--color-ink)]">Datenschutz</a></li>
              <li><a href="#" className="transition-colors hover:text-[var(--color-ink)]">AGB</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-[var(--color-border)] pt-8 md:flex-row">
          <p className="text-sm font-light text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} RND Gutachten. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-1.5 text-sm font-medium tracking-wide">
            <span className="text-[var(--color-text-muted)]">Powered by</span>
            <span className="text-[var(--color-ink)]">DemorX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


