import type {Metadata} from 'next';
import LegalPage from '@/components/LegalPage';
import {buildPageMetadata} from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Impressum',
  description: 'Anbieterkennzeichnung und rechtliche Kontaktinformationen von RND Gutachten.',
  path: '/impressum',
  noIndex: true,
});

export default function ImpressumPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Impressum">
      <p>TODO: Exakten Firmennamen, Anschrift, Vertretungsberechtigte und Kontaktangaben ergänzen, sobald die finalen Unternehmensdaten vorliegen.</p>
      <p>Bis zum Launch sollte diese Seite durch die verantwortliche Firma oder Rechtsberatung final geprüft werden.</p>
    </LegalPage>
  );
}
