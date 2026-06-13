import { DashboardView } from "@/features/dashboard/dashboard-view";
import { getDashboardOverview } from "@/lib/api/dashboard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";

  const [dictionary, data] = await Promise.all([
    getDictionary(resolvedLocale),
    getDashboardOverview(),
  ]);

  return <DashboardView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
