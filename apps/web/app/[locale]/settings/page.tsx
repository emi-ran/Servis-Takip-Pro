import { SettingsOverviewView } from "@/features/settings/settings-overview-view";
import { getSettingsOverview } from "@/lib/api/settings";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getSettingsOverview()]);

  return <SettingsOverviewView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
