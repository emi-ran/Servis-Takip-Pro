import { ComingSoonView } from "@/features/common/coming-soon-view";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function PartsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const dictionary = await getDictionary(resolvedLocale);

  return <ComingSoonView locale={resolvedLocale} dictionary={dictionary} sectionTitle={dictionary.navigation.parts} />;
}
