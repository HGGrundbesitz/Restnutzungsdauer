import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RND Gutachten – Restnutzungsdauer',
    short_name: 'RND Gutachten',
    description: 'Digitale Ersteinschätzung der Restnutzungsdauer für Immobilien.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    lang: 'de-DE',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
