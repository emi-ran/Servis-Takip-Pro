import { PartsOverviewView } from "@/features/parts/parts-overview-view";
import { getPartsOverview } from "@/lib/api/parts";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function PartsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getPartsOverview()]);

  return <PartsOverviewView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
