import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const createServiceRecordSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  deviceId: z.string().min(1, "Cihaz seçimi zorunlu"),
  faultDescription: z.string().min(1, "Arıza açıklaması zorunlu"),
  priority: z.enum(["DUSUK", "NORMAL", "YUKSEK", "ACIL"]).default("NORMAL"),
  assignedUserId: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const where: Record<string, unknown> = { companyId: session.companyId };

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    where.createdAt = createdAt;
  }

  if (query) {
    const trackingNo = parseInt(query);
    where.OR = [
      ...(!isNaN(trackingNo) ? [{ trackingNo: trackingNo }] : []),
      { faultDescription: { contains: query, mode: "insensitive" as const } },
      {
        customer: {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { surname: { contains: query, mode: "insensitive" as const } },
          ],
        },
      },
    ];
  }

  const [serviceRecords, total] = await Promise.all([
    prisma.serviceRecord.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, surname: true, phone: true } },
        device: { select: { id: true, brand: true, model: true, category: true, serialNo: true } },
        assignedUser: { select: { id: true, name: true, surname: true } },
      },
    }),
    prisma.serviceRecord.count({ where }),
  ]);

  return NextResponse.json({ serviceRecords, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createServiceRecordSchema.parse(body);

    const device = await prisma.device.findFirst({
      where: { id: data.deviceId, companyId: session.companyId },
    });
    if (!device) {
      return NextResponse.json({ message: "Cihaz bulunamadı" }, { status: 404 });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: session.companyId },
    });
    if (!customer) {
      return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
    }

    const serviceRecord = await prisma.serviceRecord.create({
      data: {
        companyId: session.companyId,
        customerId: data.customerId,
        deviceId: data.deviceId,
        faultDescription: data.faultDescription,
        priority: data.priority,
        assignedUserId: data.assignedUserId || null,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "KAYIT_ACILDI",
            changedById: session.userId,
          },
        },
      },
      include: {
        customer: { select: { id: true, name: true, surname: true } },
        device: { select: { id: true, brand: true, model: true } },
      },
    });

    return NextResponse.json({ serviceRecord }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[service-records POST]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
