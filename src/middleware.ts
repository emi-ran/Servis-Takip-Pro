import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { routing } from "@/lib/routing";

const intlMiddleware = createMiddleware(routing);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const publicPrefixes = ["/api", "/_next/static", "/_next/image", "/favicon", "/icon", "/apple-icon"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API and static files bypass all middleware
  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session
  const sessionCookie = request.cookies.get("session");
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\/?/, "/");
  const isLoginPath = pathWithoutLocale === "/login";

  if (!sessionCookie?.value) {
    if (pathWithoutLocale !== "/login") {
      return NextResponse.redirect(new URL("/tr/login", request.url));
    }
  } else {
    try {
      await jwtVerify(sessionCookie.value, JWT_SECRET);
    } catch {
      const response = isLoginPath
        ? intlMiddleware(request)
        : NextResponse.redirect(new URL("/tr/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  // Already logged in and trying to access login
  if (sessionCookie?.value && isLoginPath) {
    return NextResponse.redirect(new URL("/tr/dashboard", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icon\.svg|apple-icon\.png).*)"],
};
