import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const rateLimitKey = `${getClientIp(request)}:${data.email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);

    if (rateLimit.limited) {
      return NextResponse.json(
        { message: "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      companyId: user.companyId,
      role: user.role as "ADMIN" | "TECHNICIAN",
      userUpdatedAt: user.updatedAt.toISOString(),
    });

    clearRateLimit(rateLimitKey);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri" },
        { status: 400 }
      );
    }
    console.error("[login]", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
