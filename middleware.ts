import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = (token as any)?.role;
    const isAdmin = role === "ADMIN" || role === "ENGINEER";

    // Block non-admins from /admin/*
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        // Public routes — always allow
        if (
          pathname.startsWith("/api") ||
          pathname.startsWith("/_next") ||
          pathname === "/" ||
          pathname.startsWith("/products") ||
          pathname === "/login" ||
          pathname === "/signup" ||
          pathname === "/forgot-password"
        ) {
          return true;
        }
        // Everything else requires login
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};