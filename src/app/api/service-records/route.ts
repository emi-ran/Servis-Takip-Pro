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
  serviceMode: z.enum(["SERVISTE", "YERINDE", "CIHAZ_ALINACAK", "CIHAZ_BIRAKILACAK", "BAKIM", "KURULUM"]).default("SERVISTE"),
  scheduledAt: z.string().optional().or(z.literal("")),
});

const closedStatuses = ["TESLIM_EDILDI", "IPTAL_EDILDI", "MUSTERI_REDDETTI"];

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status") || "";
  const scope = searchParams.get("scope") || "";
  const serviceMode = searchParams.get("serviceMode") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir: "asc" | "desc" = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const where: Record<string, unknown> = { companyId: session.companyId };

  const customerId = searchParams.get("customerId") || "";
  if (customerId) {
    where.customerId = customerId;
  }

  if (status) {
    where.status = scope === "active" ? { equals: status, notIn: closedStatuses } : status;
  } else if (scope === "active") {
    where.status = { notIn: closedStatuses };
  }

  if (serviceMode) {
    where.serviceMode = serviceMode;
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
    const words = query.trim().split(/\s+/).filter(Boolean);
    const trackingNo = parseInt(query);
    if (words.length > 0) {
      where.OR = [
        ...(!isNaN(trackingNo) ? [{ trackingNo: trackingNo }] : []),
        {
          AND: words.map((word) => ({
            OR: [
              { faultDescription: { contains: word, mode: "insensitive" as const } },
              {
                customer: {
                  OR: [
                    { name: { contains: word, mode: "insensitive" as const } },
                    { surname: { contains: word, mode: "insensitive" as const } },
                  ],
                },
              },
              {
                device: {
                  OR: [
                    { brand: { contains: word, mode: "insensitive" as const } },
                    { model: { contains: word, mode: "insensitive" as const } },
                    { serialNo: { contains: word, mode: "insensitive" as const } },
                  ],
                },
              },
            ],
          })),
        },
      ];
    }
  }

  const orderBy = (() => {
    if (sortBy === "trackingNo") return { trackingNo: sortDir };
    if (sortBy === "customer") return { customer: { name: sortDir } };
    if (sortBy === "serviceMode") return { serviceMode: sortDir };
    if (sortBy === "status") return { status: sortDir };
    if (sortBy === "priority") return { priority: sortDir };
    return { createdAt: sortDir };
  })();

  const [serviceRecords, total] = await Promise.all([
    prisma.serviceRecord.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
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

    if (data.assignedUserId) {
      const assignedUser = await prisma.user.findFirst({
        where: {
          id: data.assignedUserId,
          companyId: session.companyId,
          role: { in: ["ADMIN", "TECHNICIAN"] },
        },
      });
      if (!assignedUser) {
        return NextResponse.json({ message: "Teknisyen bulunamadı" }, { status: 404 });
      }
    }

    let scheduledAt: Date | null = null;
    if (data.serviceMode !== "SERVISTE") {
      if (!data.scheduledAt) {
        return NextResponse.json({ message: "Planlanan tarih zorunlu" }, { status: 400 });
      }
      scheduledAt = new Date(data.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        return NextResponse.json({ message: "Planlanan tarih geçersiz" }, { status: 400 });
      }
    }

    const serviceRecord = await prisma.serviceRecord.create({
      data: {
        companyId: session.companyId,
        customerId: data.customerId,
        deviceId: data.deviceId,
        faultDescription: data.faultDescription,
        priority: data.priority,
        serviceMode: data.serviceMode,
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

    if (data.serviceMode !== "SERVISTE") {
      if (!scheduledAt) {
        return NextResponse.json({ message: "Planlanan tarih zorunlu" }, { status: 400 });
      }

      const taskTypeMap: Record<string, "CIHAZ_ALINACAK" | "CIHAZ_BIRAKILACAK" | "BAKIM" | "KURULUM"> = {
        YERINDE: "BAKIM",
        CIHAZ_ALINACAK: "CIHAZ_ALINACAK",
        CIHAZ_BIRAKILACAK: "CIHAZ_BIRAKILACAK",
        BAKIM: "BAKIM",
        KURULUM: "KURULUM",
      };

      await prisma.scheduledTask.create({
        data: {
          companyId: session.companyId,
          customerId: data.customerId,
          serviceRecordId: serviceRecord.id,
          title: `${serviceRecord.device.brand} ${serviceRecord.device.model}`,
          description: data.faultDescription,
          taskType: taskTypeMap[data.serviceMode],
          date: scheduledAt,
          status: "PLANLANDI",
          assignedUserId: data.assignedUserId || null,
        },
      });
    }

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
