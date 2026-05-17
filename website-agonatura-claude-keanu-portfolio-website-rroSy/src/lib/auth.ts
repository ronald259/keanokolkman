import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "./referrals/types";

const COOKIE_NAME = "agn_admin";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 uur

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ADMIN_SECRET ontbreekt of is te kort (minimaal 16 tekens vereist).",
      );
    }
    // Dev-fallback — bewust onveilig zodat productie expliciet moet zetten.
    return "dev-only-secret-do-not-use-in-prod";
  }
  return secret;
}

export type AdminSession = {
  name: string;
  role: Role;
  issuedAt: number;
};

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function decodeSession(token: string): AdminSession | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;
    const age = Date.now() - session.issuedAt;
    if (age > SESSION_MAX_AGE * 1000) return null;
    return session;
  } catch {
    return null;
  }
}

export function getSession(): AdminSession | null {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  return decodeSession(cookie);
}

export function setSession(session: AdminSession): void {
  cookies().set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSession(): void {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function verifyAdminPassword(password: string): AdminSession | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return null;
  if (password.length !== expected.length) return null;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (!timingSafeEqual(a, b)) return null;
  const name = process.env.ADMIN_NAME || "AgoNatura admin";
  return { name, role: "admin", issuedAt: Date.now() };
}

export function requireRole(
  session: AdminSession | null,
  roles: Role[],
): session is AdminSession {
  return !!session && roles.includes(session.role);
}
