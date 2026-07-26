import type {Metadata} from 'next';
import LegalPage from '@/components/LegalPage';
import {buildPageMetadata} from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Allgemeine Geschäftsbedingungen',
  description: 'Allgemeine Geschäftsbedingungen von RND Gutachten.',
  path: '/agb',
  noIndex: true,
});

export default function AGBPage() {
  return (
    <LegalPage eyebrow="AGB" title="Allgemeine Geschäftsbedingungen">
      <p>TODO: AGB der verantwortlichen Firma ergänzen oder entfernen, falls keine AGB veröffentlicht werden sollen.</p>
      <p>Diese Platzhalterseite verhindert tote Footer-Links und markiert klar, welche Inhalte vor dem Launch noch freigegeben werden müssen.</p>
    </LegalPage>
  );
}
