import { DevicesListView } from "@/features/devices/devices-list-view";
import { searchDevices } from "@/lib/api/customers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function DevicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), searchDevices("")]);

  return <DevicesListView locale={resolvedLocale} dictionary={dictionary} initialData={data} />;
}
