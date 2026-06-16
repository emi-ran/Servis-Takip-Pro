import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

const setupSchema = z.object({
  companyName: z.string().trim().min(1).max(100),
  companySlug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  adminEmail: z.string().trim().email().max(255),
  adminPassword: z.string().min(12).max(128),
  adminName: z.string().trim().min(1).max(80),
  adminSurname: z.string().trim().min(1).max(80),
});

export async function GET() {
  const userCount = await prisma.user.count();
  return NextResponse.json({ canSetup: userCount === 0 });
}

export async function POST(request: Request) {
  try {
    const data = setupSchema.parse(await request.json());
    const passwordHash = await hashPassword(data.adminPassword);

    const company = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const userCount = await tx.user.count();

      if (userCount > 0) {
        throw new Error("SETUP_ALREADY_DONE");
      }

      const existingCompany = await tx.company.findUnique({
        where: { slug: data.companySlug },
        select: { id: true },
      });

      if (existingCompany) {
        throw new Error("COMPANY_SLUG_EXISTS");
      }

      return tx.company.create({
        data: {
          name: data.companyName,
          slug: data.companySlug,
          users: {
            create: {
              email: data.adminEmail.toLowerCase(),
              passwordHash,
              name: data.adminName,
              surname: data.adminSurname,
              role: "ADMIN",
            },
          },
        },
        include: { users: true },
      });
    });
    const user = company.users[0];

    await createSession({
      userId: user.id,
      companyId: company.id,
      role: user.role,
      userUpdatedAt: user.updatedAt.toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "SETUP_ALREADY_DONE") {
      return NextResponse.json(
        { message: "İlk kurulum zaten tamamlanmış." },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message === "COMPANY_SLUG_EXISTS") {
      return NextResponse.json(
        { message: "Bu şirket kısayolu zaten kullanılıyor." },
        { status: 409 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri" },
        { status: 400 }
      );
    }

    console.error("[setup]", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
