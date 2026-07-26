import type {Metadata} from 'next';

export const SITE_NAME = 'RND Gutachten';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.rnd-gutachten.de').replace(/\/$/, '');
export const DEFAULT_DESCRIPTION =
  'Objektbezogene Restnutzungsdauer-Gutachten und kostenlose Ersteinschätzung für vermietete Immobilien.';

export function absoluteUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {canonical: url},
    robots: noIndex
      ? {index: false, follow: false, nocache: true}
      : {index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1},
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{url: absoluteUrl('/opengraph-image'), width: 1200, height: 630, alt: `${SITE_NAME} – ${title}`}],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
  };
}
