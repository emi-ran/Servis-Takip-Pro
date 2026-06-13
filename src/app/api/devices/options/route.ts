import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const [brands, categories] = await Promise.all([
    prisma.device.findMany({
      where: { companyId: session.companyId },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.device.findMany({
      where: { companyId: session.companyId },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return NextResponse.json({
    brands: brands.map((b) => b.brand),
    categories: categories.map((c) => c.category),
  });
}
