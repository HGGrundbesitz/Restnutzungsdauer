import type {MetadataRoute} from 'next';
import {absoluteUrl} from '@/lib/seo/site';

const INDEXABLE_PATHS = [
  '/',
  '/restnutzungsdauer-gutachten',
  '/afa-immobilie',
  '/restnutzungsdauer-berechnen',
  '/restnutzungsdauer-finanzamt',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/restnutzungsdauer') || path === '/afa-immobilie' ? 0.8 : 0.3,
  }));
}
