import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/contact",
  "/solutions",
  "/legal",
  "/api/auth",
  "/api/contact-requests",
  "/api/webhooks",
  "/api/signature/employee",
  "/api/signature/manager",
  "/api/cron",
  "/p/",
  "/sign/",
];

const staticRoutes = [
  "/favicon.ico",
  "/logo.png",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/_next",
  "/uploads",
  "/screenshots",
  "/google",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route.endsWith("/")) {
      return pathname.startsWith(route);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isStaticRoute(pathname: string): boolean {
  return staticRoutes.some((route) => pathname.startsWith(route));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip static assets
  if (isStaticRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Force password change if required
  if (
    req.auth.user?.mustChangePassword &&
    !pathname.startsWith("/change-password") &&
    !pathname.startsWith("/api/auth")
  ) {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
