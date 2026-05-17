import { NextResponse, type NextRequest } from "next/server";

/**
 * Globale security headers.
 *
 * CSP is bewust pragmatisch: Next.js' hydratie-runtime werkt met inline
 * boot-scripts. We staan 'unsafe-inline' toe op script-src, maar blokkeren
 * alle third-party herkomsten. Voor productie kan een nonce-gebaseerde CSP
 * geïntroduceerd worden zodra alle componenten daarop zijn voorbereid.
 */

const isProd = process.env.NODE_ENV === "production";

function buildCsp(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", isProd ? "" : "'unsafe-eval'"].filter(Boolean),
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      // Test-/feedbackversie: AI-gegenereerde sfeerbeelden via CloudFront.
      // Voor productie: verwijder deze regel zodra eigen fotografie in /public/images/ staat.
      "https://d8j0ntlcm91z4.cloudfront.net",
    ],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": ["'self'"],
    "media-src": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "upgrade-insecure-requests": [],
  };
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();

  res.headers.set("Content-Security-Policy", buildCsp());
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (isProd) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
