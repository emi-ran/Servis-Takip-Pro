import { ServiceRecordsView } from "@/features/service-records/service-records-view";
import { getServiceRecordsOverview } from "@/lib/api/service-records";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function ServiceRecordsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";

  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getServiceRecordsOverview()]);

  return <ServiceRecordsView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
