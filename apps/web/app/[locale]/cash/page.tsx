import { CashOverviewView } from "@/features/cash/cash-overview-view";
import { getCashOverview } from "@/lib/api/cash";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function CashPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getCashOverview()]);

  return <CashOverviewView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
