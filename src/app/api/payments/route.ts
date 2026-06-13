import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const createPaymentSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  type: z.enum(["BORC", "TAHSILAT"]),
  amount: z.number().positive("Tutar pozitif olmalı"),
  paymentMethod: z.enum(["NAKIT", "KART", "EFT", "DIGER"]).optional(),
  date: z.string().min(1, "Tarih zorunlu"),
  description: z.string().optional().or(z.literal("")),
  serviceRecordId: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const customerId = searchParams.get("customerId") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const where: Record<string, unknown> = { companyId: session.companyId };

  if (type) {
    where.type = type;
  }

  if (customerId) {
    where.customerId = customerId;
  }

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
    where.customer = {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { surname: { contains: query, mode: "insensitive" as const } },
      ],
    };
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "desc" },
      include: {
        customer: { select: { id: true, name: true, surname: true } },
        serviceRecord: { select: { id: true, trackingNo: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ payments, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createPaymentSchema.parse(body);

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

    const payment = await prisma.payment.create({
      data: {
        companyId: session.companyId,
        customerId: data.customerId,
        type: data.type,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description || null,
        serviceRecordId: data.serviceRecordId || null,
        ...(data.type === "TAHSILAT" && data.paymentMethod
          ? { paymentMethod: data.paymentMethod }
          : { paymentMethod: "DIGER" }),
      },
      include: {
        customer: { select: { id: true, name: true, surname: true } },
        serviceRecord: { select: { id: true, trackingNo: true } },
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[payments POST]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
