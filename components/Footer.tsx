const legalLinks = [
  {label: 'AGB', href: '/agb'},
  {label: 'Impressum', href: '/impressum'},
  {label: 'Datenschutz', href: '/datenschutz'},
  {label: 'Cookies', href: '/cookies'},
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-10 pt-16 sm:pt-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-16 grid grid-cols-1 gap-10 md:mb-20 md:grid-cols-12 md:gap-12">
          <div className="flex flex-col items-start md:col-span-5">
            <a href="#hero" className="group flex items-center gap-3"><span className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--color-ink)]">RND Gutachten</span></a>
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-[var(--color-text-muted)]">Digitale Ersteinschätzung und strukturierte Restnutzungsdauer-Gutachten für vermietete Immobilien. Nachvollziehbar vorbereitet für Steuerberatung und Finanzamt.</p>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Plattform</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              <li><a href="#ersteinschaetzung" className="transition-colors hover:text-[var(--color-ink)]">Ersteinschätzung</a></li>
              <li><a href="#unterlagen" className="transition-colors hover:text-[var(--color-ink)]">Unterlagen</a></li>
              <li><a href="#rechtsgrundlage" className="transition-colors hover:text-[var(--color-ink)]">Rechtsgrundlage</a></li>
              <li><a href="#prozess" className="transition-colors hover:text-[var(--color-ink)]">Prozess</a></li>
              <li><a href="#faq" className="transition-colors hover:text-[var(--color-ink)]">FAQ</a></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Rechtliches</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              {legalLinks.map((link) => (<li key={link.label}><a href={link.href} className="transition-colors hover:text-[var(--color-ink)]">{link.label}</a></li>))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-[var(--color-border)] pt-8 md:flex-row">
          <p className="text-sm font-light text-[var(--color-text-muted)]">&copy; {new Date().getFullYear()} RND Gutachten. Alle Rechte vorbehalten.</p>
          <p className="text-sm font-light text-[var(--color-text-muted)]">Keine Steuerberatung. Die steuerliche Einordnung erfolgt über Ihre Steuerberatung.</p>
        </div>
      </div>
    </footer>
  );
}