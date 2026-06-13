import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const createScheduledTaskSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  title: z.string().min(1, "Başlık zorunlu"),
  description: z.string().optional().or(z.literal("")),
  taskType: z.enum(["CIHAZ_ALINACAK", "CIHAZ_BIRAKILACAK", "BAKIM", "KURULUM", "DIGER"]),
  date: z.string().min(1, "Tarih zorunlu"),
  status: z.enum(["PLANLANDI", "DEVAM_EDIYOR", "TAMAMLANDI", "IPTAL"]).optional(),
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
  const taskType = searchParams.get("taskType") || "";
  const customerId = searchParams.get("customerId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const where: Record<string, unknown> = { companyId: session.companyId };

  if (status) where.status = status;
  if (taskType) where.taskType = taskType;
  if (customerId) where.customerId = customerId;

  if (dateFrom || dateTo) {
    const date: Record<string, Date> = {};
    if (dateFrom) date.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      date.lte = end;
    }
    where.date = date;
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" as const } },
      { description: { contains: query, mode: "insensitive" as const } },
      { customer: { name: { contains: query, mode: "insensitive" as const } } },
      { customer: { surname: { contains: query, mode: "insensitive" as const } } },
    ];
  }

  const [scheduledTasks, total] = await Promise.all([
    prisma.scheduledTask.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "asc" },
      include: {
        customer: { select: { id: true, name: true, surname: true, phone: true, address: true } },
        assignedUser: { select: { id: true, name: true, surname: true } },
      },
    }),
    prisma.scheduledTask.count({ where }),
  ]);

  return NextResponse.json({ scheduledTasks, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createScheduledTaskSchema.parse(body);

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: session.companyId },
    });
    if (!customer) {
      return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
    }

    if (data.assignedUserId) {
      const user = await prisma.user.findFirst({
        where: { id: data.assignedUserId, companyId: session.companyId },
      });
      if (!user) {
        return NextResponse.json({ message: "Teknisyen bulunamadı" }, { status: 404 });
      }
    }

    const scheduledTask = await prisma.scheduledTask.create({
      data: {
        companyId: session.companyId,
        customerId: data.customerId,
        title: data.title,
        description: data.description || null,
        taskType: data.taskType,
        date: new Date(data.date),
        status: data.status || "PLANLANDI",
        assignedUserId: data.assignedUserId || null,
      },
      include: {
        customer: { select: { id: true, name: true, surname: true, phone: true, address: true } },
        assignedUser: { select: { id: true, name: true, surname: true } },
      },
    });

    return NextResponse.json({ scheduledTask }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[scheduled-tasks POST]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
