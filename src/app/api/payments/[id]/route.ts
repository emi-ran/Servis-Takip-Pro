import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function getPaymentOrNull(id: string, companyId: string) {
  return prisma.payment.findFirst({
    where: { id, companyId },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getPaymentOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Kayıt bulunamadı" }, { status: 404 });
  }

  await prisma.payment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
