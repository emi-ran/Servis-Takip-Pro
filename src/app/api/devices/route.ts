import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const createDeviceSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunlu"),
  category: z.string().min(1, "Kategori zorunlu"),
  brand: z.string().min(1, "Marka zorunlu"),
  model: z.string().min(1, "Model zorunlu"),
  serialNo: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const customerId = searchParams.get("customerId") || "";

  const where: Record<string, unknown> = {
    companyId: session.companyId,
  };

  if (customerId) {
    where.customerId = customerId;
  }

  if (query) {
    const words = query.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      where.AND = words.map((word) => ({
        OR: [
          { brand: { contains: word, mode: "insensitive" as const } },
          { model: { contains: word, mode: "insensitive" as const } },
          { serialNo: { contains: word, mode: "insensitive" as const } },
          { category: { contains: word, mode: "insensitive" as const } },
          {
            customer: {
              OR: [
                { name: { contains: word, mode: "insensitive" as const } },
                { surname: { contains: word, mode: "insensitive" as const } },
              ],
            },
          },
        ],
      }));
    }
  }

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, surname: true } },
        _count: { select: { serviceRecords: true } },
      },
    }),
    prisma.device.count({ where }),
  ]);

  return NextResponse.json({ devices, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createDeviceSchema.parse(body);

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: session.companyId },
    });
    if (!customer) {
      return NextResponse.json({ message: "Müşteri bulunamadı" }, { status: 404 });
    }

    const device = await prisma.device.create({
      data: {
        companyId: session.companyId,
        customerId: data.customerId,
        category: data.category,
        brand: data.brand,
        model: data.model,
        serialNo: data.serialNo || "",
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[devices POST]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}
