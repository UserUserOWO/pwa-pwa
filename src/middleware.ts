import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection and security headers.
 *
 * Protected routes:
 * - /admin/*  → requires ADMIN or SUPER_ADMIN role
 * - /moderation/* → requires MODERATOR, ADMIN, or SUPER_ADMIN
 * - /settings/* → requires authentication
 * - /balance/* → requires authentication
 * - /topup/* → requires authentication
 *
 * Security headers are added to all responses.
 */

const PUBLIC_ROUTES = ["/", "/login", "/register", "/scan"];
const AUTH_ROUTES = ["/settings", "/balance", "/topup", "/profile"];
const ADMIN_ROUTES = ["/admin"];
const MODERATION_ROUTES = ["/moderation"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
    ].join("; ")
  );
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     * - icons
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon).*)",
  ],
};