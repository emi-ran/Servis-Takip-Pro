import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [dailyCollectionResult, debtResult, collectionResult, pendingCount, readyCount] =
    await Promise.all([
      prisma.payment.aggregate({
        where: {
          companyId: session.companyId,
          type: "TAHSILAT",
          date: { gte: today, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { companyId: session.companyId, type: "BORC" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { companyId: session.companyId, type: "TAHSILAT" },
        _sum: { amount: true },
      }),
      prisma.serviceRecord.count({
        where: {
          companyId: session.companyId,
          status: { notIn: ["TESLIM_EDILDI", "IPTAL_EDILDI", "MUSTERI_REDDETTI"] },
        },
      }),
      prisma.serviceRecord.count({
        where: {
          companyId: session.companyId,
          status: "HAZIR",
        },
      }),
    ]);

  const totalDebt = debtResult._sum.amount?.toNumber() || 0;
  const totalCollection = collectionResult._sum.amount?.toNumber() || 0;

  return NextResponse.json({
    dailyCollection: dailyCollectionResult._sum.amount?.toNumber() || 0,
    unpaidBalance: totalDebt - totalCollection,
    pendingServices: pendingCount,
    readyDevices: readyCount,
  });
}
