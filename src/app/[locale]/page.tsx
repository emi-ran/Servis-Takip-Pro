import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: Props) {
  const { locale } = await params;
  const session = await verifySession();
  const userCount = await prisma.user.count();

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  redirect(userCount === 0 ? `/${locale}/setup` : `/${locale}/login`);
}
