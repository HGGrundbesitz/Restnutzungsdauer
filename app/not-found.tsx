import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-alt)] px-6 py-16">
      <section className="w-full max-w-2xl rounded-[2rem] border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-soft)] sm:p-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">404</p>
        <h1 className="mt-5 font-heading text-4xl font-semibold tracking-[-0.045em] text-[var(--color-ink)]">
          Diese Seite wurde nicht gefunden
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--color-text-muted)]">
          Die Adresse ist möglicherweise veraltet. Ihre gespeicherten Formulardaten werden dadurch nicht verändert.
        </p>
        <Link href="/" className="cta-btn mt-8 px-7 py-4 text-sm">
          Zur Startseite
        </Link>
      </section>
    </main>
  );
}
