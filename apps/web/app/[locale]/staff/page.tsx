import { StaffOverviewView } from "@/features/staff/staff-overview-view";
import { getStaffOverview } from "@/lib/api/staff";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function StaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const [dictionary, data] = await Promise.all([getDictionary(resolvedLocale), getStaffOverview()]);

  return <StaffOverviewView locale={resolvedLocale} dictionary={dictionary} data={data} />;
}
