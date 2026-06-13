import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const updateScheduledTaskSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  title: z.string().min(1, "Başlık zorunlu"),
  description: z.string().optional().or(z.literal("")),
  taskType: z.enum(["CIHAZ_ALINACAK", "CIHAZ_BIRAKILACAK", "BAKIM", "KURULUM", "DIGER"]),
  date: z.string().min(1, "Tarih zorunlu"),
  status: z.enum(["PLANLANDI", "DEVAM_EDIYOR", "TAMAMLANDI", "IPTAL"]),
  assignedUserId: z.string().optional().or(z.literal("")),
});

async function getScheduledTaskOrNull(id: string, companyId: string) {
  return prisma.scheduledTask.findFirst({
    where: { id, companyId },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getScheduledTaskOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Planlı iş bulunamadı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateScheduledTaskSchema.parse(body);

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

    const scheduledTask = await prisma.scheduledTask.update({
      where: { id },
      data: {
        customerId: data.customerId,
        title: data.title,
        description: data.description || null,
        taskType: data.taskType,
        date: new Date(data.date),
        status: data.status,
        assignedUserId: data.assignedUserId || null,
      },
      include: {
        customer: { select: { id: true, name: true, surname: true, phone: true, address: true } },
        assignedUser: { select: { id: true, name: true, surname: true } },
      },
    });

    return NextResponse.json({ scheduledTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[scheduled-tasks PUT]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
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
  const existing = await getScheduledTaskOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Planlı iş bulunamadı" }, { status: 404 });
  }

  await prisma.scheduledTask.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
