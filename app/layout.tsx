import type {Metadata} from 'next';
import './globals.css';
import {Analytics} from '@vercel/analytics/next';
import CookieNotice from "@/components/CookieNotice";
export const metadata: Metadata = {
  title: 'Restnutzungsdauer-Gutachten | RND Gutachten',
  description:
    'Kostenlose Ersteinschätzung und objektbezogene Restnutzungsdauer-Gutachten für vermietete Immobilien. Nachvollziehbar vorbereitet für Steuerberatung und Finanzamt.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="de">
      <body className="bg-[var(--color-bg)] font-sans text-[var(--color-ink)] antialiased selection:bg-[var(--color-ink)] selection:text-[var(--color-bg)]">
        {children}
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  );
}
