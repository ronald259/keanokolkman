import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "kk_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 dagen

type Role = "viewer" | "admin";
type Session = { role: Role; iat: number };

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    // Dev fallback — produceer een waarschuwing in de console maar laat de app niet crashen.
    if (process.env.NODE_ENV !== "production") {
      return "dev-secret-do-not-use-in-production-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    }
    throw new Error("SESSION_SECRET ontbreekt of is te kort (min. 16 tekens).");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(session: Session): string {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): Session | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    if (Date.now() / 1000 - session.iat > MAX_AGE_SECONDS) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decode(token);
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export async function requireAdmin(): Promise<Session> {
  const s = await requireSession();
  if (s.role !== "admin") throw new Error("FORBIDDEN");
  return s;
}

export async function setSession(role: Role) {
  const token = encode({ role, iat: Math.floor(Date.now() / 1000) });
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export function verifyPassword(input: string): Role | null {
  const site = process.env.SITE_PASSWORD || "keanu2026";
  const admin = process.env.ADMIN_PASSWORD || "admin2026";
  // Constant-time vergelijking
  const eq = (a: string, b: string) => {
    const A = Buffer.from(a);
    const B = Buffer.from(b);
    if (A.length !== B.length) return false;
    return timingSafeEqual(A, B);
  };
  if (eq(input, admin)) return "admin";
  if (eq(input, site)) return "viewer";
  return null;
}
