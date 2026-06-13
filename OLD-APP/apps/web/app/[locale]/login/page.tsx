import { LoginView } from "@/features/auth/login-view";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/settings";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "tr";
  const dictionary = await getDictionary(resolvedLocale);

  return <LoginView locale={resolvedLocale} dictionary={dictionary} />;
}
