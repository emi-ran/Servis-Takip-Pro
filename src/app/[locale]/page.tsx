import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: Props) {
  const { locale } = await params;
  const session = await verifySession();

  redirect(session ? `/${locale}/dashboard` : `/${locale}/login`);
}
