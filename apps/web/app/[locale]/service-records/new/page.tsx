import { NewServiceRecordForm } from "@/features/service-records/new-service-record-form";
import { getCreateServiceRecordFormOptions } from "@/lib/api/service-records";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function NewServiceRecordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, options] = await Promise.all([getDictionary(resolvedLocale), getCreateServiceRecordFormOptions()]);

  return <NewServiceRecordForm dictionary={dictionary} locale={resolvedLocale} options={options} />;
}
