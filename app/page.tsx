import type {Metadata} from 'next';
import HomePage from '@/components/HomePage';
import JsonLd from '@/components/seo/JsonLd';
import {FAQS, INITIAL_VISIBLE_FAQ_COUNT} from '@/lib/content/faqs';
import {buildPageMetadata, SITE_NAME, SITE_URL} from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Restnutzungsdauer-Gutachten für Immobilien',
  description:
    'Restnutzungsdauer kostenlos einschätzen und ein objektbezogenes Gutachten strukturiert vorbereiten – transparent, unverbindlich und ohne Anerkennungsversprechen.',
  path: '/',
});

const visibleFaqs = FAQS.slice(0, INITIAL_VISIBLE_FAQ_COUNT);

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${SITE_URL}#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/icon.png`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${SITE_URL}#website`,
            name: SITE_NAME,
            url: SITE_URL,
            inLanguage: 'de-DE',
            publisher: {'@id': `${SITE_URL}#organization`},
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Restnutzungsdauer-Gutachten',
            serviceType: 'Objektbezogene Herleitung der Restnutzungsdauer von Immobilien',
            provider: {'@id': `${SITE_URL}#organization`},
            areaServed: { '@type': 'Country', name: 'Deutschland' },
            url: SITE_URL,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: visibleFaqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]}
      />
      <HomePage />
    </>
  );
}
