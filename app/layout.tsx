import type {Metadata} from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
export const metadata: Metadata = {
  title: 'Restnutzungsdauer-Gutachten | Digital, diskret, finanzamtsfest',
  description:
    'Digitale Restnutzungsdauer-Gutachten für Immobilienbesitzer, die Abschreibung, Klarheit und einen sauberen Prozess wollen.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="de">
      <body
        className="font-sans bg-[var(--color-bg)] text-[var(--color-ink)] antialiased selection:bg-[var(--color-ink)] selection:text-[var(--color-bg)]"
      >
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
