import { NextRequest, NextResponse } from "next/server";

const BYPASS_COOKIE = "portfolio_preview";
const BYPASS_SECRET = "ct2026";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (searchParams.get("preview") === BYPASS_SECRET) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(BYPASS_COOKIE, "1", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  if (request.cookies.get(BYPASS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  if (pathname === "/coming-soon") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/coming-soon", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
