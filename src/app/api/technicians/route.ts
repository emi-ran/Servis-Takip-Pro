import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const technicians = await prisma.user.findMany({
    where: { companyId: session.companyId, role: { in: ["ADMIN", "TECHNICIAN"] } },
    select: { id: true, name: true, surname: true, role: true },
    orderBy: [{ name: "asc" }, { surname: "asc" }],
  });

  return NextResponse.json({ technicians });
}
