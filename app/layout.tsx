import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restnutzungsdauer-Gutachten | Digital, diskret, finanzamtsfest',
  description:
    'Digitale Restnutzungsdauer-Gutachten für Immobilienbesitzer, die Abschreibung, Klarheit und einen sauberen Prozess wollen.',
};

const themeInitScript = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem('site-theme');
      const theme = storedTheme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {}
  })();
`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="de" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
      </head>
      <body
        className="font-sans bg-[var(--color-bg)] text-[var(--color-ink)] antialiased selection:bg-[var(--color-ink)] selection:text-[var(--color-bg)]"
      >
        {children}
      </body>
    </html>
  );
}

