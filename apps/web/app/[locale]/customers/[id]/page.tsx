import { CustomerDetailView } from "@/features/customers/customer-detail-view";
import { getCustomerDetail } from "@/lib/api/customers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function CustomerDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";

  const [dictionary, detail] = await Promise.all([getDictionary(resolvedLocale), getCustomerDetail(id)]);

  return <CustomerDetailView locale={resolvedLocale} dictionary={dictionary} id={id} detail={detail} />;
}
