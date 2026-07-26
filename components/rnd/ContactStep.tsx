import {Building, Mail, MapPin, Phone, Ruler, UserRound} from 'lucide-react';
import {getGermanNationalNumber, normalizeGermanPhone} from '@/lib/rnd/phone';
import type {RndContact, RndPropertyContext} from '@/lib/rnd/types';

export default function ContactStep({
  value,
  property,
  honeypot,
  onChange,
  onPropertyChange,
  onHoneypotChange,
}: {
  value: RndContact;
  property: RndPropertyContext;
  honeypot: string;
  onChange: (patch: Partial<RndContact>) => void;
  onPropertyChange: (patch: Partial<RndPropertyContext>) => void;
  onHoneypotChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><UserRound size={29} /></div>
        <h3 className="text-balance font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">Wie dürfen wir Sie kontaktieren?</h3>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">Ergänzen Sie auf Wunsch noch die wichtigsten Objektdaten.</p>
      </div>
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <ContactField label="Vorname" required><input required value={value.firstName} onChange={(event) => onChange({firstName: event.target.value})} className="rnd-input" autoComplete="given-name" /></ContactField>
        <ContactField label="Nachname" required><input required value={value.lastName} onChange={(event) => onChange({lastName: event.target.value})} className="rnd-input" autoComplete="family-name" /></ContactField>
        <ContactField label="E-Mail-Adresse" required icon={Mail}><input required type="email" value={value.email} onChange={(event) => onChange({email: event.target.value})} className="rnd-input" autoComplete="email" placeholder="name@beispiel.de" /></ContactField>
        <ContactField label="Telefonnummer - optional" icon={Phone}>
          <div className="flex overflow-hidden rounded-xl border border-[var(--color-border)] bg-white transition focus-within:border-[var(--color-accent)] focus-within:ring-4 focus-within:ring-[var(--color-accent-soft)]">
            <span className="flex h-14 items-center border-r border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-sm font-semibold text-[var(--color-ink)]">+49</span>
            <input
              type="tel"
              inputMode="tel"
              value={getGermanNationalNumber(value.phone)}
              onChange={(event) => onChange({phone: normalizeGermanPhone(event.target.value)})}
              className="min-w-0 flex-1 bg-transparent px-4 text-base text-[var(--color-ink)] outline-none"
              autoComplete="tel-national"
              aria-label="Deutsche Telefonnummer ohne Ländervorwahl"
              placeholder="151 23456789"
            />
          </div>
        </ContactField>
        <ContactField label="Objektadresse - optional" icon={MapPin} wide>
          <input
            value={property.address ?? ''}
            onChange={(event) => onPropertyChange({address: event.target.value})}
            className="rnd-input"
            autoComplete="street-address"
            placeholder="Straße, Hausnummer, PLZ, Ort"
          />
        </ContactField>
        <ContactField label="Fläche - optional" icon={Ruler}>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={100000}
              value={property.area ?? ''}
              onChange={(event) => onPropertyChange({area: event.target.value ? Number(event.target.value) : undefined})}
              className="rnd-input pr-12"
              placeholder="z. B. 225"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">m²</span>
          </div>
        </ContactField>
        <ContactField label="Nutzungseinheiten - optional" icon={Building}>
          <input
            type="number"
            min={1}
            max={1000}
            value={property.units ?? ''}
            onChange={(event) => onPropertyChange({units: event.target.value ? Number(event.target.value) : undefined})}
            className="rnd-input"
            placeholder="z. B. 3"
          />
        </ContactField>
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          <label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => onHoneypotChange(event.target.value)} /></label>
        </div>
        <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-[1.2rem] border border-[var(--color-border)] bg-white/78 p-4 text-sm leading-6 text-[var(--color-text-muted)]">
          <input type="checkbox" checked={value.consent} onChange={(event) => onChange({consent: event.target.checked})} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]" />
          <span>Ich bin mit der Speicherung meiner Angaben zur Bearbeitung der Ersteinschätzung und zur Kontaktaufnahme einverstanden. Die <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-accent)] underline underline-offset-4">Datenschutzhinweise</a> habe ich gelesen.</span>
        </label>
      </div>
    </div>
  );
}

function ContactField({label, required, icon: Icon, wide, children}: {label: string; required?: boolean; icon?: typeof Mail; wide?: boolean; children: React.ReactNode}) {
  return <label className={`rounded-[1.25rem] border border-[var(--color-border)] bg-white/78 p-4 ${wide ? 'sm:col-span-2' : ''}`}><span className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">{Icon ? <Icon size={16} className="text-[var(--color-accent)]" /> : null}{label}{required ? <span className="text-red-500">*</span> : null}</span>{children}</label>;
}
