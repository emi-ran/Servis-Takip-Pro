import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/settings";

export default async function LocaleIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    redirect("/tr/dashboard");
  }

  redirect(`/${locale}/dashboard`);
}
