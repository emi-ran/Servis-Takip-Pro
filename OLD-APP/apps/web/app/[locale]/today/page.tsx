import { TodayWorkView } from "@/features/today/today-work-view";
import { getTodayWorkOverview } from "@/lib/api/today";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";

  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getTodayWorkOverview()]);

  return <TodayWorkView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
