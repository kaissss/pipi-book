import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/member", "/coach", "/admin"];
const COACH_PREFIXES = ["/coach"];
const ADMIN_PREFIXES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  // We rely on the access token cookie (set by the API client's refresh interceptor).
  // For SSR-safe auth checks we read a httpOnly cookie set at login.
  const token = request.cookies.get("cb_access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access: parse JWT payload (no secret verification — that's the API's job)
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8")
    ) as { role?: string; exp?: number };

    // Expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("cb_access_token");
      return response;
    }

    const role = payload.role ?? "STUDENT";

    // Admin-only routes
    if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Coach-only routes
    if (COACH_PREFIXES.some((p) => pathname.startsWith(p)) && role !== "COACH" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/coach/:path*", "/admin/:path*"],
};
