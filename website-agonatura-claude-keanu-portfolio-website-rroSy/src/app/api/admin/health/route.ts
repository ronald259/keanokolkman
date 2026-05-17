import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/health
 *
 * Toont aanwezigheid en lengte van vereiste env-variabelen. Géén waarden,
 * alleen "set" / "missing" + lengte. Bedoeld om snel te debuggen wanneer
 * inloggen niet lukt op Vercel.
 *
 * Veiligheid: lekt geen secrets — alleen presence + lengte. Vrij toegankelijk
 * zodat het ook werkt als sessies kapot zijn.
 */
export async function GET() {
  const status = {
    runtime: process.env.NODE_ENV,
    ADMIN_PASSWORD: present("ADMIN_PASSWORD"),
    ADMIN_SECRET: presentMin("ADMIN_SECRET", 16),
    ADMIN_NAME: present("ADMIN_NAME"),
    IP_HASH_SALT: present("IP_HASH_SALT"),
    REFERRAL_WEBHOOK_URL: present("REFERRAL_WEBHOOK_URL"),
    NOTIFICATION_WEBHOOK_URL: present("NOTIFICATION_WEBHOOK_URL"),
    KV_REST_API_URL: present("KV_REST_API_URL"),
    KV_REST_API_TOKEN: present("KV_REST_API_TOKEN"),
  };

  const issues: string[] = [];
  if (status.ADMIN_PASSWORD.startsWith("missing"))
    issues.push("ADMIN_PASSWORD ontbreekt — login werkt niet.");
  if (status.ADMIN_SECRET.startsWith("missing"))
    issues.push("ADMIN_SECRET ontbreekt — login crasht na correct wachtwoord.");
  if (status.ADMIN_SECRET.startsWith("too_short"))
    issues.push("ADMIN_SECRET is te kort (minimaal 16 tekens) — login crasht na correct wachtwoord.");

  return NextResponse.json({ ok: issues.length === 0, issues, status });
}

function present(key: string): string {
  const v = process.env[key];
  if (!v) return "missing";
  return `set:${v.length} tekens`;
}

function presentMin(key: string, min: number): string {
  const v = process.env[key];
  if (!v) return "missing";
  if (v.length < min) return `too_short:${v.length}/${min}`;
  return `set:${v.length} tekens`;
}
