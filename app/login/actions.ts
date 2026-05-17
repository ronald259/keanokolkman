"use server";

import { setSession, verifyPassword } from "@/lib/auth";

// Simple in-memory brute-force throttle per process (best-effort).
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function throttle(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return true;
  }
  rec.count += 1;
  return rec.count <= MAX_ATTEMPTS;
}

export async function loginAction(
  password: string,
  from?: string
): Promise<{ ok: true; redirect: string } | { ok: false; error: string }> {
  if (!throttle("login")) {
    return { ok: false, error: "Te veel pogingen. Wacht een minuut en probeer opnieuw." };
  }
  // tiny constant-time-ish delay to slow scripted attempts
  await new Promise((r) => setTimeout(r, 250));

  const role = verifyPassword(password);
  if (!role) return { ok: false, error: "Onjuist wachtwoord." };

  await setSession(role);
  const safeFrom = from && from.startsWith("/") && !from.startsWith("//") ? from : "/home";
  return { ok: true, redirect: safeFrom };
}
