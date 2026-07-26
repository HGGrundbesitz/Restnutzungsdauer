import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import SeoTopicPage from '@/components/seo/SeoTopicPage';
import {getSeoTopic, SEO_TOPICS} from '@/lib/content/seo-pages';
import {buildPageMetadata} from '@/lib/seo/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_TOPICS.map((topic) => ({topic: topic.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{topic: string}>;
}): Promise<Metadata> {
  const {topic: slug} = await params;
  const topic = getSeoTopic(slug);
  if (!topic) return {};
  return buildPageMetadata({
    title: topic.title,
    description: topic.metaDescription,
    path: `/${topic.slug}`,
  });
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{topic: string}>;
}) {
  const {topic: slug} = await params;
  const topic = getSeoTopic(slug);
  if (!topic) notFound();
  return <SeoTopicPage topic={topic} />;
}
