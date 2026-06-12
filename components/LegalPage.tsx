import Link from 'next/link';

type LegalPageProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export default function LegalPage({eyebrow, title, children}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-24 text-[var(--color-ink)] sm:px-6 md:py-32">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--color-border)] bg-white/86 p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <Link href="/" className="mb-8 inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-ink)]">
          Zurück zur Website
        </Link>
        <p className="section-eyebrow mb-5 inline-flex">{eyebrow}</p>
        <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em] text-[var(--color-ink)] md:text-6xl">{title}</h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-[var(--color-text-muted)]">{children}</div>
      </section>
    </main>
  );
}
