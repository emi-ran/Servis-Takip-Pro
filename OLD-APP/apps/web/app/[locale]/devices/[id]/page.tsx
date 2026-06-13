import { DeviceDetailView } from "@/features/devices/device-detail-view";
import { getDeviceDetail } from "@/lib/api/customers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function DeviceDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";

  const [dictionary, detail] = await Promise.all([getDictionary(resolvedLocale), getDeviceDetail(id)]);

  return <DeviceDetailView locale={resolvedLocale} dictionary={dictionary} id={id} detail={detail} />;
}
