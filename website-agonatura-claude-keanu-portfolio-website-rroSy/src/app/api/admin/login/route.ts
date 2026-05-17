import { NextResponse } from "next/server";
import { setSession, verifyAdminPassword } from "@/lib/auth";
import { audit } from "@/lib/referrals/audit";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { fingerprintIp } from "@/lib/referrals/id";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const fingerprint = fingerprintIp(ip);
  const rl = rateLimit(`admin-login:${fingerprint}`, 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.redirect(
      new URL("/admin/login?error=ratelimit", req.url),
      { status: 303 },
    );
  }

  let password = "";
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const form = await req.formData();
    password = String(form.get("password") ?? "");
  } else {
    const body = await req.json().catch(() => ({}));
    password = String((body as { password?: unknown }).password ?? "");
  }

  // ADMIN_PASSWORD ontbreekt → expliciete melding (anders ziet de gebruiker
  // alleen 'wachtwoord onjuist' terwijl het in werkelijkheid niet is ingesteld).
  if (!process.env.ADMIN_PASSWORD) {
    await audit({ action: "admin.login-failed", actor: "anonymous", meta: { reason: "no_password_env" } });
    return NextResponse.redirect(new URL("/admin/login?error=no_password", req.url), { status: 303 });
  }

  const session = verifyAdminPassword(password);
  if (!session) {
    await audit({
      action: "admin.login-failed",
      actor: "anonymous",
      meta: { fingerprint },
    });
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", req.url),
      { status: 303 },
    );
  }

  try {
    setSession(session);
  } catch (err) {
    // Meest waarschijnlijke oorzaak: ADMIN_SECRET ontbreekt of <16 tekens.
    const reason = err instanceof Error ? err.message : "unknown";
    await audit({
      action: "admin.login-failed",
      actor: "anonymous",
      meta: { reason: "set_session_failed", detail: reason },
    });
    return NextResponse.redirect(
      new URL("/admin/login?error=secret", req.url),
      { status: 303 },
    );
  }
  await audit({
    action: "admin.login-success",
    actor: session.name,
    role: session.role,
  });

  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}