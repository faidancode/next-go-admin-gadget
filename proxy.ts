import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.cookies.get("access_token"));

  const PUBLIC_PATHS = ["/login"];

  function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  }

  // ❌ User BELUM login → akses halaman protected
  if (!isLoggedIn && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ User SUDAH login → akses halaman auth
  if (isLoggedIn && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};
