import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/lib/routing";

const intlMiddleware = createMiddleware(routing);

const publicPrefixes = ["/api", "/_next/static", "/favicon"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API and static files bypass locale redirect
  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return intlMiddleware(request);
  }

  // Check if setup is needed
  const setupUrl = new URL("/api/setup", request.url);
  const setupRes = await fetch(setupUrl).catch(() => null);
  const setupRequired = setupRes?.ok
    ? (await setupRes.json()).setupRequired
    : true;

  if (setupRequired) {
    // Auto-setup from .env
    await fetch(setupUrl, { method: "POST" }).catch(() => {});
    // Redirect to login
    return NextResponse.redirect(new URL("/tr/login", request.url));
  }

  // Check session
  const sessionCookie = request.cookies.get("session");
  if (!sessionCookie?.value) {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\/?/, "/");
    if (pathWithoutLocale !== "/login") {
      return NextResponse.redirect(new URL("/tr/login", request.url));
    }
  }

  // Already logged in and trying to access login
  if (sessionCookie?.value && pathname.includes("/login")) {
    return NextResponse.redirect(new URL("/tr/dashboard", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api/auth|api/setup|_next/static|favicon.ico).*)"],
};
