import { CustomersListView } from "@/features/customers/customers-list-view";
import { searchCustomers } from "@/lib/api/customers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function CustomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), searchCustomers("")]);

  return <CustomersListView locale={resolvedLocale} dictionary={dictionary} initialData={data} />;
}
