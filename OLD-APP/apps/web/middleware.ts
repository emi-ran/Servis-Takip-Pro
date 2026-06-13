import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "@/lib/i18n/settings";

function isPublicTrackingPath(pathname: string) {
  return pathname === "/track" || pathname.startsWith("/track/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Check for public tracking paths
  if (isPublicTrackingPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Resolve locale redirects
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard`, request.url));
  }

  // Find if path starts with locale
  const matchedLocale = locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  const hasLocalePrefix = !!matchedLocale;
  const currentLocale = matchedLocale || defaultLocale;

  // Normalize path without locale
  const relativePath = hasLocalePrefix
    ? pathname.replace(new RegExp(`^\\/${currentLocale}`), "")
    : pathname;

  const isAuthPage = relativePath === "/login" || relativePath === "/onboarding";

  // Check auth cookie token
  const token = request.cookies.get("token")?.value;

  if (!hasLocalePrefix) {
    // Redirect to default locale prefix
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  if (!token) {
    // If not authenticated and trying to access app pages, redirect to login
    if (!isAuthPage) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }
  } else {
    // If authenticated and trying to access login/onboarding pages, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
