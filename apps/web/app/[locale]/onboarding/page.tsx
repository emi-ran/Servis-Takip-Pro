import { OnboardingView } from "@/features/auth/onboarding-view";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const dictionary = await getDictionary(resolvedLocale);

  return <OnboardingView locale={resolvedLocale} dictionary={dictionary} />;
}
