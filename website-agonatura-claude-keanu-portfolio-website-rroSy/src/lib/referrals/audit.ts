/**
 * Auditlog voor het aanmeldplatform.
 *
 * Loggt acties (wie, wat, wanneer, op welk record), nooit de inhoud van
 * gevoelige velden. Schrijft naar Upstash KV als die beschikbaar is (zodat
 * alle function instances + alle deploys naar dezelfde log schrijven),
 * anders naar een lokaal bestand. Voor productie: stream door naar een
 * immutable log sink (Loki, Cloud Logging, SIEM).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { KV_KEYS, kvAvailable, kvClient } from "@/lib/storage/kv";

const DATA_ROOT =
  process.env.AGONATURA_DATA_DIR ||
  (process.env.VERCEL ? "/tmp/agonatura-data" : path.join(process.cwd(), ".data"));
const AUDIT_FILE = path.join(DATA_ROOT, "audit.log");

export type AuditAction =
  | "referral.created"
  | "referral.status-changed"
  | "referral.note-added"
  | "referral.document-uploaded"
  | "referral.document-viewed"
  | "referral.document-downloaded"
  | "referral.exported-json"
  | "referral.exported-pdf"
  | "admin.login-success"
  | "admin.login-failed"
  | "admin.logout";

export interface AuditEntry {
  ts: string;
  action: AuditAction;
  actor: string;
  role?: string;
  referralId?: string;
  meta?: Record<string, string | number | boolean | undefined>;
}

const MAX_RETAINED = 5000;

export async function audit(entry: Omit<AuditEntry, "ts">): Promise<void> {
  const full: AuditEntry = { ts: new Date().toISOString(), ...entry };
  if (kvAvailable()) {
    try {
      const client = kvClient();
      await client.lpush(KV_KEYS.audit, JSON.stringify(full));
      await client.ltrim(KV_KEYS.audit, 0, MAX_RETAINED - 1);
      return;
    } catch {
      // Val terug op file storage als KV faalt — audit mag nooit blocken.
    }
  }
  try {
    await fs.mkdir(DATA_ROOT, { recursive: true });
    await fs.appendFile(AUDIT_FILE, JSON.stringify(full) + "\n", "utf8");
  } catch {
    // Stille catch — auditlog mag de gebruiker nooit blokkeren.
  }
}

export async function readAudit(limit = 500): Promise<AuditEntry[]> {
  if (kvAvailable()) {
    try {
      const raw = await kvClient().lrange(KV_KEYS.audit, 0, limit - 1);
      return raw
        .map((line) => {
          if (typeof line === "string") {
            try {
              return JSON.parse(line) as AuditEntry;
            } catch {
              return null;
            }
          }
          // Sommige clients geven al een geparset object terug.
          return line as unknown as AuditEntry;
        })
        .filter((e): e is AuditEntry => e !== null);
    } catch {
      // Val terug op file.
    }
  }
  try {
    const raw = await fs.readFile(AUDIT_FILE, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((l) => JSON.parse(l) as AuditEntry)
      .reverse();
  } catch {
    return [];
  }
}
