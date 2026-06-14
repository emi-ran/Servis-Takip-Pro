import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const COOKIE_NAME = "session";

export type SessionPayload = {
  userId: string;
  companyId: string;
  role: "ADMIN" | "TECHNICIAN";
  userUpdatedAt: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as SessionPayload;

    if (!session.userId || !session.companyId || !session.role || !session.userUpdatedAt) {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: session.userId,
        companyId: session.companyId,
      },
      select: {
        id: true,
        companyId: true,
        role: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    if (user.updatedAt.toISOString() !== session.userUpdatedAt) {
      cookieStore.delete(COOKIE_NAME);
      return null;
    }

    return {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      userUpdatedAt: user.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
