import {Shield, MessageCircle, Server, UserCheck} from 'lucide-react';

const trustItems = [
  {icon: Shield, label: 'Diskrete Abwicklung'},
  {icon: MessageCircle, label: 'Verständliche Kommunikation'},
  {icon: Server, label: 'Sichere Datenbehandlung'},
  {icon: UserCheck, label: 'Professionelle Prüfung'},
];

export default function TrustedBy() {
  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center overflow-hidden border-t border-[var(--color-border)] pt-20 pb-20">
      <p className="mb-12 px-6 text-center text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        Vertrauensvolle und rechtskonforme Abwicklung
      </p>

      <div
        className="relative flex w-full items-center overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        <div className="marquee-track flex w-max hover:[animation-play-state:paused]" style={{animationDuration: '40s'}}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-16 pr-16 md:gap-24 md:pr-24">
              {trustItems.map((item) => (
                <div
                  key={`${dup}-${item.label}`}
                  className="flex cursor-default items-center gap-3 text-[var(--color-text-muted)] opacity-50 transition-all duration-300 hover:opacity-100 hover:text-[var(--color-ink)]"
                >
                  <item.icon size={32} />
                  <span className="text-xl font-medium tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

