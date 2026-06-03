import { ReportsOverviewView } from "@/features/reports/reports-overview-view";
import { getReportsOverview } from "@/lib/api/reports";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getReportsOverview()]);

  return <ReportsOverviewView data={data} dictionary={dictionary} locale={resolvedLocale} />;
}
