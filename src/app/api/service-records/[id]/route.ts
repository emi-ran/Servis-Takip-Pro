import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const updateServiceRecordSchema = z.object({
  faultDescription: z.string().min(1, "Arıza açıklaması zorunlu").optional(),
  priority: z.enum(["DUSUK", "NORMAL", "YUKSEK", "ACIL"]).optional(),
  assignedUserId: z.string().optional().nullable(),
  pricing: z.number().positive("Ücret pozitif olmalı").optional().nullable(),
});

async function getRecordOrNull(id: string, companyId: string) {
  return prisma.serviceRecord.findFirst({
    where: { id, companyId },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.serviceRecord.findFirst({
    where: { id, companyId: session.companyId },
    include: {
      customer: { select: { id: true, name: true, surname: true, phone: true, email: true, address: true } },
      device: { select: { id: true, brand: true, model: true, category: true, serialNo: true } },
      assignedUser: { select: { id: true, name: true, surname: true } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { id: true, name: true, surname: true } } },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, surname: true } } },
      },
    },
  });

  if (!record) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ serviceRecord: record });
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
  const existing = await getRecordOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateServiceRecordSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.faultDescription !== undefined) updateData.faultDescription = data.faultDescription;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId || null;
    if (data.pricing !== undefined) updateData.pricing = data.pricing;

    const record = await prisma.serviceRecord.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, surname: true } },
        device: { select: { id: true, brand: true, model: true } },
      },
    });

    return NextResponse.json({ serviceRecord: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[service-records PUT]", error);
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
  const existing = await getRecordOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  await prisma.serviceRecord.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
