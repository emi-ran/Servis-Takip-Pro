import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const updatePaymentSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  type: z.enum(["BORC", "TAHSILAT"]),
  amount: z.number().positive("Tutar pozitif olmalı"),
  paymentMethod: z.enum(["NAKIT", "KART", "EFT", "DIGER"]).optional(),
  date: z.string().min(1, "Tarih zorunlu"),
  description: z.string().optional().or(z.literal("")),
  serviceRecordId: z.string().optional().or(z.literal("")),
  deviceId: z.string().optional().or(z.literal("")),
});

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

export async function PUT(
  request: Request,
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

  try {
    const body = await request.json();
    const data = updatePaymentSchema.parse(body);

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: session.companyId },
    });
    if (!customer) {
      return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
    }

    if (data.serviceRecordId) {
      const record = await prisma.serviceRecord.findFirst({
        where: { id: data.serviceRecordId, companyId: session.companyId },
      });
      if (!record) {
        return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
      }
    }

    if (data.deviceId) {
      const device = await prisma.device.findFirst({
        where: { id: data.deviceId, companyId: session.companyId },
      });
      if (!device) {
        return NextResponse.json({ message: "Cihaz bulunamadı" }, { status: 404 });
      }
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        customerId: data.customerId,
        type: data.type,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description || null,
        serviceRecordId: data.serviceRecordId || null,
        deviceId: data.deviceId || null,
        ...(data.type === "TAHSILAT" && data.paymentMethod
          ? { paymentMethod: data.paymentMethod }
          : { paymentMethod: "DIGER" }),
      },
    });

    return NextResponse.json({ payment: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[payments PUT]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}

