import type {Metadata, Viewport} from 'next';
import './globals.css';
import {Analytics} from '@vercel/analytics/next';
import CookieNotice from "@/components/CookieNotice";
import {DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL} from '@/lib/seo/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Restnutzungsdauer-Gutachten | RND Gutachten',
    template: '%s | RND Gutachten',
  },
  description: DEFAULT_DESCRIPTION,
  category: 'Immobiliengutachten',
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{url: '/icon.png', type: 'image/png'}],
    apple: [{url: '/icon.png'}],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
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
