import { NewServiceRecordForm } from "@/features/service-records/new-service-record-form";
import { getCreateServiceRecordFormOptions, resolveServiceRecordFormPreselection } from "@/lib/api/service-records";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function NewServiceRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ customerId?: string; deviceId?: string }>;
}) {
  const { locale } = await params;
  const { customerId, deviceId } = await searchParams;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, options, preselection] = await Promise.all([
    getDictionary(resolvedLocale),
    getCreateServiceRecordFormOptions(),
    resolveServiceRecordFormPreselection({ customerId, deviceId }),
  ]);

  return <NewServiceRecordForm dictionary={dictionary} locale={resolvedLocale} options={options} preselection={preselection} />;
}
