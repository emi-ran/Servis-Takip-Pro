import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";
import { normalizePhone, isValidPhone } from "@/lib/phone";

const phoneSchema = z.string().min(1).transform(normalizePhone).refine(isValidPhone, {
  message: "Geçerli bir telefon numarası girin (05XX XXX XXXX)",
});

const updateCustomerSchema = z.object({
  name: z.string().min(1, "Ad zorunlu"),
  surname: z.string().min(1, "Soyad zorunlu"),
  phone: phoneSchema,
  email: z.string().email("Geçersiz e-posta").trim().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

async function getCustomerOrNull(id: string, companyId: string) {
  return prisma.customer.findFirst({
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
  const customer = await getCustomerOrNull(id, session.companyId);

  if (!customer) {
    return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
  }

  const [devices, serviceRecords] = await Promise.all([
    prisma.device.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceRecord.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { device: { select: { brand: true, model: true } } },
    }),
  ]);

  return NextResponse.json({ customer, devices, serviceRecords });
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
  const existing = await getCustomerOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateCustomerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[customers PUT]", error);
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
  const existing = await getCustomerOrNull(id, session.companyId);
  if (!existing) {
    return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
  }

  await prisma.customer.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
