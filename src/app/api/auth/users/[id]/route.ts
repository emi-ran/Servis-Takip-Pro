import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1, "Ad zorunlu"),
  surname: z.string().min(1, "Soyad zorunlu"),
  email: z.string().email("Geçersiz e-posta"),
  role: z.enum(["ADMIN", "TECHNICIAN"]),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı").optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  if (user.companyId !== session.companyId) {
    return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
  }

  if (user.id === session.userId) {
    return NextResponse.json({ message: "Kendinizi düzenleyemezsiniz" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Geçersiz veri", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, surname, email, role, password } = parsed.data;

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Bu e-posta adresi zaten kullanılıyor" }, { status: 409 });
    }
  }

  const data: Record<string, unknown> = { name, surname, email, role };
  if (password) {
    data.passwordHash = await hashPassword(password);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, surname: true, email: true, role: true },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  if (user.companyId !== session.companyId) {
    return NextResponse.json({ message: "Yetkiniz yok" }, { status: 403 });
  }

  if (user.id === session.userId) {
    return NextResponse.json({ message: "Kendinizi silemezsiniz" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "Kullanıcı silindi" });
}
