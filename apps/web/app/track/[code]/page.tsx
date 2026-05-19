import { ComingSoonView } from "@/features/common/coming-soon-view";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { defaultLocale } from "@/lib/i18n/settings";

export default async function PublicTrackingPage() {
  const dictionary = await getDictionary(defaultLocale);

  return <ComingSoonView locale={defaultLocale} dictionary={dictionary} sectionTitle={dictionary.navigation.track} />;
}
