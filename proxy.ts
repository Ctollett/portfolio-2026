import { NextRequest, NextResponse } from "next/server";

const BYPASS_COOKIE = "portfolio_preview";
const BYPASS_SECRET = "ct2026";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Always allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If the secret param is present, set the bypass cookie and redirect to home
  if (searchParams.get("preview") === BYPASS_SECRET) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(BYPASS_COOKIE, "1", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  // If bypass cookie is set, allow through
  if (request.cookies.get(BYPASS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  // Already on coming-soon, let through
  if (pathname === "/coming-soon") {
    return NextResponse.next();
  }

  // Everyone else goes to coming soon
  return NextResponse.redirect(new URL("/coming-soon", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
