export default function CTA() {
  return (
    <>
      <section className="overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-bg)] py-20 md:py-24">
        <div
          className="marquee-track whitespace-nowrap"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black 30%, black 60%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 30%, black 60%, transparent)',
          }}
        >
          <span className="mx-12 text-[8rem] font-medium tracking-tighter text-[var(--color-primary)] opacity-[0.03]">
            STEUERN SPAREN
          </span>
          <span className="mx-12 text-[8rem] font-medium tracking-tighter text-[var(--color-primary)] opacity-[0.03]">
            HOEHERE AFA
          </span>
          <span className="mx-12 text-[8rem] font-medium tracking-tighter text-[var(--color-primary)] opacity-[0.03]">
            RESTNUTZUNGSDAUER
          </span>
          <span className="mx-12 text-[8rem] font-medium tracking-tighter text-[var(--color-primary)] opacity-[0.03]">
            DIGITALER PROZESS
          </span>
        </div>
      </section>

      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-bg)]/80"></div>
        <div className="absolute h-64 w-64 rounded-full bg-[var(--color-accent-soft)] blur-[100px]"></div>
        <h2 className="relative z-10 mb-6 font-heading text-5xl tracking-tight text-[var(--color-primary)] md:text-7xl">
          Elegant im Auftritt.
          <br />
          Klar in der Umsetzung.
        </h2>
        <p className="relative z-10 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)] md:text-xl">
          Wenn die Landingpage Vertrauen wecken soll, muss auch der Prozess dahinter ruhig, hochwertig und mobil stark wirken.
        </p>
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#anfrage" className="cta-btn px-10 py-4 text-lg font-medium">
            Jetzt Gutachten anfragen
          </a>
        </div>
      </section>
    </>
  );
}
