import { NextResponse } from "next/server";
import type { Prisma, ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const closedStatuses: ServiceStatus[] = ["TESLIM_EDILDI", "IPTAL_EDILDI", "MUSTERI_REDDETTI"];

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeServiceWhere: Prisma.ServiceRecordWhereInput = {
    companyId: session.companyId,
    status: { notIn: closedStatuses },
  };

  const serviceSelect: Prisma.ServiceRecordSelect = {
    id: true,
    trackingNo: true,
    status: true,
    priority: true,
    faultDescription: true,
    createdAt: true,
    customer: { select: { id: true, name: true, surname: true, phone: true } },
    device: { select: { brand: true, model: true } },
  };

  const [
    dailyCollectionResult,
    debtResult,
    collectionResult,
    pendingCount,
    readyCount,
    todayTaskCount,
    todayTasks,
    urgentRecords,
    readyRecords,
    paymentWaitingRecords,
    recentRecords,
  ] =
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
        where: activeServiceWhere,
      }),
      prisma.serviceRecord.count({
        where: {
          companyId: session.companyId,
          status: "HAZIR",
        },
      }),
      prisma.scheduledTask.count({
        where: {
          companyId: session.companyId,
          date: { gte: today, lt: tomorrow },
        },
      }),
      prisma.scheduledTask.findMany({
        where: {
          companyId: session.companyId,
          date: { gte: today, lt: tomorrow },
        },
        orderBy: { date: "asc" },
        take: 8,
        select: {
          id: true,
          title: true,
          taskType: true,
          status: true,
          date: true,
          customer: { select: { id: true, name: true, surname: true, phone: true } },
          assignedUser: { select: { id: true, name: true, surname: true } },
        },
      }),
      prisma.serviceRecord.findMany({
        where: { ...activeServiceWhere, priority: "ACIL" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: serviceSelect,
      }),
      prisma.serviceRecord.findMany({
        where: { companyId: session.companyId, status: "HAZIR" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: serviceSelect,
      }),
      prisma.serviceRecord.findMany({
        where: { companyId: session.companyId, status: "ODEME_BEKLIYOR" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: serviceSelect,
      }),
      prisma.serviceRecord.findMany({
        where: activeServiceWhere,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: serviceSelect,
      }),
    ]);

  const totalDebt = debtResult._sum.amount?.toNumber() || 0;
  const totalCollection = collectionResult._sum.amount?.toNumber() || 0;

  return NextResponse.json({
    dailyCollection: dailyCollectionResult._sum.amount?.toNumber() || 0,
    unpaidBalance: totalDebt - totalCollection,
    pendingServices: pendingCount,
    readyDevices: readyCount,
    todayTasks: todayTaskCount,
    todayTaskList: todayTasks,
    urgentRecords,
    readyRecords,
    paymentWaitingRecords,
    recentRecords,
  });
}
