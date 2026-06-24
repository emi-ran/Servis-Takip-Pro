import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1, "Ad zorunlu"),
  surname: z.string().min(1, "Soyad zorunlu"),
  email: z.string().email("Geçersiz e-posta"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  role: z.enum(["ADMIN", "TECHNICIAN"]),
});

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { companyId: session.companyId },
    select: { id: true, name: true, surname: true, email: true, role: true },
    orderBy: [{ name: "asc" }, { surname: "asc" }],
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Geçersiz veri", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, surname, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Bu e-posta adresi zaten kullanılıyor" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      surname,
      email,
      passwordHash,
      role,
      companyId: session.companyId,
    },
    select: { id: true, name: true, surname: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
