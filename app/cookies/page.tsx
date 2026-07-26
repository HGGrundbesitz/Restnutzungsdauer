import type {Metadata} from 'next';
import LegalPage from '@/components/LegalPage';
import {buildPageMetadata} from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cookie-Einstellungen',
  description: 'Informationen zu technisch notwendiger Speicherung und Cookie-Einstellungen auf rnd-gutachten.de.',
  path: '/cookies',
  noIndex: true,
});

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Cookies" title="Cookie-Einstellungen">
      <p>Diese Website nutzt technisch notwendige Cookies und lokale Speicherung, damit Navigation, Formularfunktionen und die Cookie-Information selbst zuverlässig funktionieren.</p>
      <p>Für den Launch müssen eingesetzte Analyse- oder Tracking-Dienste final geprüft und hier transparent ergänzt werden. Bis dahin wird die Seite bewusst zurückhaltend gehalten.</p>
    </LegalPage>
  );
}
