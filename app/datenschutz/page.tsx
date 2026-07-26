import type {Metadata} from 'next';
import LegalPage from '@/components/LegalPage';
import {buildPageMetadata} from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Datenschutzhinweise',
  description: 'Datenschutzhinweise zur digitalen Ersteinschätzung, Kontaktaufnahme und optionalen Dokumentenübermittlung.',
  path: '/datenschutz',
  noIndex: true,
});

export default function DatenschutzPage() {
  return (
    <LegalPage eyebrow="Datenschutz" title="Datenschutzhinweise">
      <p>TODO: Finale Datenschutzhinweise für Kontaktformular, QuickCheck, optionale Dokumenten-Uploads, E-Mail-Versand und Supabase-Speicherung ergänzen.</p>
      <p>Hochgeladene Dokumente dürfen nur zur Bearbeitung der Anfrage genutzt werden. Speicher- und Löschfristen müssen vor dem Launch verbindlich ergänzt werden.</p>
    </LegalPage>
  );
}
