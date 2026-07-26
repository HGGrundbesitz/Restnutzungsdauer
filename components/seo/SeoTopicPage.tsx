import Link from 'next/link';
import {ArrowRight, CheckCircle2} from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import JsonLd from '@/components/seo/JsonLd';
import type {SeoTopic} from '@/lib/content/seo-pages';
import {SEO_TOPICS} from '@/lib/content/seo-pages';
import {absoluteUrl, SITE_NAME, SITE_URL} from '@/lib/seo/site';

export default function SeoTopicPage({topic}: {topic: SeoTopic}) {
  const related = SEO_TOPICS.filter((item) => item.slug !== topic.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {'@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL},
              {'@type': 'ListItem', position: 2, name: topic.heading, item: absoluteUrl(`/${topic.slug}`)},
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: topic.heading,
            description: topic.metaDescription,
            url: absoluteUrl(`/${topic.slug}`),
            inLanguage: 'de-DE',
            isPartOf: {'@id': `${SITE_URL}#website`},
            about: topic.primaryKeyword,
            publisher: {'@id': `${SITE_URL}#organization`},
          },
        ]}
      />
      <Header />
      <main className="bg-white pb-0 pt-32 text-[var(--color-ink)] sm:pt-36">
        <article>
          <header className="section-shell pb-16 pt-10 md:pb-24 md:pt-16">
            <div className="max-w-5xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">{topic.eyebrow}</p>
              <h1 className="editorial-title mt-6 max-w-5xl text-5xl leading-[0.98] text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
                {topic.heading}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-9 text-[var(--color-text-muted)]">{topic.lead}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/#ersteinschaetzung" className="cta-btn gap-3 px-7 py-4 text-center text-sm">
                  Kostenlose Ersteinschätzung starten
                  <ArrowRight size={17} />
                </Link>
                <Link href="/#prozess" className="rnd-secondary-btn px-7 py-4 text-center">
                  Prozess ansehen
                </Link>
              </div>
            </div>
          </header>

          <div className="border-y border-[var(--color-border)] bg-[var(--color-bg-alt)]">
            <div className="section-shell grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
              <div className="space-y-14">
                {topic.sections.map((section) => (
                  <section key={section.heading} aria-labelledby={`${topic.slug}-${slugify(section.heading)}`}>
                    <h2 id={`${topic.slug}-${slugify(section.heading)}`} className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                      {section.heading}
                    </h2>
                    <div className="mt-5 space-y-5">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-base leading-8 text-[var(--color-text-muted)]">{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_30px_80px_-54px_rgba(15,23,42,0.3)] sm:p-8">
                  <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em]">{topic.checklistTitle}</h2>
                  <ul className="mt-6 space-y-4">
                    {topic.checklist.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--color-text-muted)]">
                        <CheckCircle2 size={19} className="mt-1 shrink-0 text-[var(--color-accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 rounded-[1.4rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
                  {topic.caution}
                </div>
              </aside>
            </div>
          </div>
        </article>

        <section className="section-shell py-20 md:py-28" aria-labelledby="weitere-themen">
          <h2 id="weitere-themen" className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Weitere Grundlagen
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="premium-focus group rounded-[1.4rem] border border-[var(--color-border)] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-soft)]"
              >
                <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--color-accent)]">{item.eyebrow}</p>
                <h3 className="mt-4 font-heading text-xl font-semibold leading-7">{item.heading}</h3>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                  Thema lesen
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-10 text-xs leading-6 text-[var(--color-text-muted)]">
            Herausgeber: {SITE_NAME}. Stand: Juli 2026. Allgemeine Fachinformation, keine Steuerberatung.
          </p>
        </section>
        <Footer />
      </main>
    </>
  );
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
