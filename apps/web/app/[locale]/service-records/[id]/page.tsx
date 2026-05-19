import { ServiceRecordDetailView } from "@/features/service-records/service-record-detail-view";
import { getServiceRecordDetail } from "@/lib/api/service-records";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function ServiceRecordDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";

  const [dictionary, detail] = await Promise.all([getDictionary(resolvedLocale), getServiceRecordDetail(id)]);

  return <ServiceRecordDetailView detail={detail} dictionary={dictionary} id={id} locale={resolvedLocale} />;
}
