import { PublicTrackingView } from "@/features/public-tracking/public-tracking-view";
import { getPublicTrackingCopy, getPublicTrackingLocale } from "@/features/public-tracking/public-tracking-copy";
import { getPublicTrackingRecord } from "@/lib/api/public-tracking";

type PublicTrackingPageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

type PublicTrackingMetadataProps = {
  searchParams?: Promise<{ lang?: string }>;
};

const emptySearchParams: { lang?: string } = {};

export async function generateMetadata({ searchParams }: PublicTrackingMetadataProps) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve(emptySearchParams));
  const locale = getPublicTrackingLocale(resolvedSearchParams.lang);
  const copy = getPublicTrackingCopy(locale);

  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PublicTrackingPage({ params, searchParams }: PublicTrackingPageProps) {
  const [{ code }, resolvedSearchParams] = await Promise.all([params, searchParams ?? Promise.resolve(emptySearchParams)]);
  const locale = getPublicTrackingLocale(resolvedSearchParams.lang);
  const [dictionary, record] = await Promise.all([Promise.resolve(getPublicTrackingCopy(locale)), getPublicTrackingRecord(code)]);

  return <PublicTrackingView code={code} dictionary={dictionary} locale={locale} record={record} />;
}
