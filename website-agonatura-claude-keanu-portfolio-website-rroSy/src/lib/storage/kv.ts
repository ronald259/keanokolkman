/**
 * Upstash Redis (Vercel KV) — gedeelde persistente storage voor de
 * AgoNatura admin & engine. Vervangt de file-backed `/tmp`-storage zodra
 * de env-variabelen aanwezig zijn (KV_REST_API_URL + KV_REST_API_TOKEN).
 *
 * Vercel injecteert die variabelen automatisch zodra een Upstash Redis-
 * integratie aan het project is gekoppeld. Lokaal valt de applicatie
 * terug op de file-backed adapter.
 *
 * Datamodel — bewust simpel: één key per collectie met de hele lijst als
 * JSON. Werkt prima tot enkele duizenden records. Voor schaal zou je
 * later kunnen migreren naar één key per record + een sorted index.
 */

import { Redis } from "@upstash/redis";

let _client: Redis | null = null;

export function kvAvailable(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
}

export function kvClient(): Redis {
  if (!kvAvailable()) {
    throw new Error("Upstash Redis env-vars ontbreken (KV_REST_API_URL + KV_REST_API_TOKEN).");
  }
  if (!_client) {
    _client = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _client;
}

const KEY_PREFIX = "agonatura:";
export const KV_KEYS = {
  referrals: `${KEY_PREFIX}referrals`,
  trajecten: `${KEY_PREFIX}trajecten`,
  alerts: `${KEY_PREFIX}alerts`,
  notifications: `${KEY_PREFIX}notifications`,
  medewerkers: `${KEY_PREFIX}medewerkers`,
  audit: `${KEY_PREFIX}audit`,
} as const;

/**
 * Helper: ophalen van een JSON-array uit KV. @upstash/redis deserialiseert
 * automatisch wanneer je hebt gesetst met een object — maar oudere data of
 * data van een andere bron kan stringified zijn. Robuuste ophaal:
 */
export async function kvReadArray<T>(key: string): Promise<T[]> {
  const raw = await kvClient().get(key);
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function kvWriteArray<T>(key: string, items: T[]): Promise<void> {
  await kvClient().set(key, JSON.stringify(items));
}

/** Lichte mutex tegen concurrent writes via een korte SET NX-lock. */
export async function kvWithLock<T>(
  key: string,
  fn: () => Promise<T>,
  timeoutMs = 3000,
): Promise<T> {
  const lockKey = `${key}:lock`;
  const start = Date.now();
  const client = kvClient();
  while (true) {
    const acquired = await client.set(lockKey, "1", { nx: true, ex: 5 });
    if (acquired === "OK") break;
    if (Date.now() - start > timeoutMs) {
      // Forceer overname om deadlocks te voorkomen bij eerdere crashes.
      await client.del(lockKey);
    }
    await new Promise((r) => setTimeout(r, 30));
  }
  try {
    return await fn();
  } finally {
    await client.del(lockKey);
  }
}
