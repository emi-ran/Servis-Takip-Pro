import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SetupPage({ params }: Props) {
  const { locale } = await params;
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    redirect(`/${locale}/login`);
  }

  return <SetupForm />;
}
