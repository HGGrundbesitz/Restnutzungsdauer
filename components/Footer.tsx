import Link from 'next/link';

const legalLinks = [
  {label: 'AGB', href: '/agb'},
  {label: 'Impressum', href: '/impressum'},
  {label: 'Datenschutz', href: '/datenschutz'},
  {label: 'Cookies', href: '/cookies'},
];

export default function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-[var(--color-border)] bg-[linear-gradient(180deg,#ffffff,#f1f6ff)] pb-10 pt-16 sm:pt-20">
      <div aria-hidden="true" className="absolute bottom-0 right-0 h-64 w-[38rem] bg-[url('/rnd/footer-building-lineart.svg')] bg-contain bg-bottom bg-no-repeat opacity-70" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-8">
        <div className="mb-16 grid grid-cols-1 gap-10 md:mb-20 md:grid-cols-12 md:gap-12">
          <div className="flex flex-col items-start md:col-span-5">
            <Link href="/" className="premium-focus group flex items-center gap-3 rounded-md"><span className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--color-ink)]">RND Gutachten</span></Link>
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-[var(--color-text-muted)]">Kostenlose Ersteinschätzung und strukturierte Restnutzungsdauer-Gutachten für vermietete Immobilien. Nachvollziehbar vorbereitet für Steuerberatung und Finanzamt.</p>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Plattform</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              <li><Link href="/#ersteinschaetzung" className="transition-colors hover:text-[var(--color-ink)]">Ersteinschätzung</Link></li>
              <li><Link href="/restnutzungsdauer-gutachten" className="transition-colors hover:text-[var(--color-ink)]">Restnutzungsdauer-Gutachten</Link></li>
              <li><Link href="/afa-immobilie" className="transition-colors hover:text-[var(--color-ink)]">AfA bei Immobilien</Link></li>
              <li><Link href="/restnutzungsdauer-berechnen" className="transition-colors hover:text-[var(--color-ink)]">Restnutzungsdauer berechnen</Link></li>
              <li><Link href="/restnutzungsdauer-finanzamt" className="transition-colors hover:text-[var(--color-ink)]">Finanzamt & Nachweis</Link></li>
              <li><Link href="/#faq" className="transition-colors hover:text-[var(--color-ink)]">FAQ</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="mb-6 font-normal tracking-tight text-[var(--color-ink)]">Rechtliches</h4>
            <ul className="space-y-4 text-sm font-light text-[var(--color-text-muted)]">
              {legalLinks.map((link) => (<li key={link.label}><Link href={link.href} className="transition-colors hover:text-[var(--color-ink)]">{link.label}</Link></li>))}
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
