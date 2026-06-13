import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, companyId: session.companyId },
  });
  if (!customer) {
    return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
  }

  const [debtResult, collectionResult] = await Promise.all([
    prisma.payment.aggregate({
      where: { customerId: id, type: "BORC" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { customerId: id, type: "TAHSILAT" },
      _sum: { amount: true },
    }),
  ]);

  const totalDebt = debtResult._sum.amount?.toNumber() || 0;
  const totalCollection = collectionResult._sum.amount?.toNumber() || 0;
  const balance = totalDebt - totalCollection;

  return NextResponse.json({ balance, totalDebt, totalCollection });
}
