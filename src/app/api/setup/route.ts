import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Kurulum zaten yapılmış" },
        { status: 400 }
      );
    }

    const companyCount = await prisma.company.count();
    if (companyCount > 0) {
      return NextResponse.json(
        { message: "Kurulum zaten yapılmış" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

    const company = await prisma.company.create({
      data: {
        name: env.COMPANY_NAME,
        slug: env.COMPANY_SLUG,
        users: {
          create: {
            email: env.ADMIN_EMAIL,
            passwordHash,
            name: env.ADMIN_NAME,
            surname: env.ADMIN_SURNAME,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Kurulum başarılı",
        companyId: company.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[setup]", error);
    return NextResponse.json(
      { message: "Kurulum sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    return NextResponse.json({ setupRequired: !admin });
  } catch {
    return NextResponse.json({ setupRequired: true });
  }
}
