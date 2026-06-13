import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const updateDeviceSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  category: z.string().min(1, "Kategori zorunlu"),
  brand: z.string().min(1, "Marka zorunlu"),
  model: z.string().min(1, "Model zorunlu"),
  serialNo: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

async function getDeviceOrNull(id: string, companyId: string) {
  return prisma.device.findFirst({
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
  const device = await getDeviceOrNull(id, session.companyId);

  if (!device) {
    return NextResponse.json({ message: "Cihaz bulunamadı" }, { status: 404 });
  }

  const [customer, serviceRecords] = await Promise.all([
    prisma.customer.findFirst({
      where: { id: device.customerId, companyId: session.companyId },
    }),
    prisma.serviceRecord.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ device, customer, serviceRecords });
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
  const existing = await getDeviceOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Cihaz bulunamadı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateDeviceSchema.parse(body);

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: session.companyId },
    });
    if (!customer) {
      return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
    }

    const device = await prisma.device.update({
      where: { id },
      data: {
        customerId: data.customerId,
        category: data.category,
        brand: data.brand,
        model: data.model,
        serialNo: data.serialNo || "",
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ device });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[devices PUT]", error);
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
  const existing = await getDeviceOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Cihaz bulunamadı" }, { status: 404 });
  }

  await prisma.device.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
