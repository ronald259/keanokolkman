import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";
import { audit } from "@/lib/referrals/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = getSession();
  if (session) {
    await audit({
      action: "admin.logout",
      actor: session.name,
      role: session.role,
    });
  }
  clearSession();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
