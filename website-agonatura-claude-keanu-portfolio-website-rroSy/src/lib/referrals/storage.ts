/**
 * Storage-abstractielaag voor referrals.
 *
 * In fase 1 schrijven we naar een lokaal JSON-bestand buiten de public webroot,
 * met file-level locking via een tijdelijke .lock-marker. Voor productie moet
 * deze adapter vervangen worden door een managed database (Postgres / Supabase
 * achter een VPC) en een object store (S3 / Vercel Blob / R2) voor uploads.
 *
 * BELANGRIJK:
 *  - Schrijf nooit gevoelige data in logs.
 *  - Bestanden worden opgeslagen in `<dataRoot>/uploads/<referralId>/<docId>`,
 *    nooit onder `/public`.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { Referral, ReferralStatus } from "./types";
import {
  KV_KEYS,
  kvAvailable,
  kvClient,
  kvReadArray,
  kvWithLock,
  kvWriteArray,
} from "@/lib/storage/kv";

/**
 * Data-locatie. Volgorde:
 *  1. AGONATURA_DATA_DIR (expliciete configuratie — productie / selfhost).
 *  2. /tmp/agonatura-data wanneer we op Vercel draaien (cwd is read-only,
 *     /tmp is wel writable maar ephemeral — alleen geschikt voor demo / test).
 *  3. <repo>/.data voor lokale ontwikkeling.
 */
const DATA_ROOT =
  process.env.AGONATURA_DATA_DIR ||
  (process.env.VERCEL ? "/tmp/agonatura-data" : path.join(process.cwd(), ".data"));

const REFERRALS_FILE = path.join(DATA_ROOT, "referrals.json");
const UPLOADS_DIR = path.join(DATA_ROOT, "uploads");
const LOCK_FILE = path.join(DATA_ROOT, ".referrals.lock");

export interface ReferralStore {
  list(): Promise<Referral[]>;
  get(id: string): Promise<Referral | null>;
  create(referral: Referral): Promise<Referral>;
  update(id: string, patch: Partial<Referral>): Promise<Referral | null>;
  saveDocument(
    referralId: string,
    documentId: string,
    bytes: Uint8Array,
  ): Promise<string>;
  readDocument(storagePath: string): Promise<Uint8Array>;
}

async function ensureDirs() {
  await fs.mkdir(DATA_ROOT, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDirs();
  const start = Date.now();
  while (true) {
    try {
      await fs.writeFile(LOCK_FILE, String(process.pid), { flag: "wx" });
      break;
    } catch {
      if (Date.now() - start > 3000) {
        await fs.rm(LOCK_FILE, { force: true });
      }
      await new Promise((r) => setTimeout(r, 25));
    }
  }
  try {
    return await fn();
  } finally {
    await fs.rm(LOCK_FILE, { force: true });
  }
}

async function readAll(): Promise<Referral[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(REFERRALS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Referral[]) : [];
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(referrals: Referral[]): Promise<void> {
  await ensureDirs();
  const tmp = `${REFERRALS_FILE}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(referrals, null, 2), "utf8");
  await fs.rename(tmp, REFERRALS_FILE);
}

class FileReferralStore implements ReferralStore {
  async list(): Promise<Referral[]> {
    return readAll();
  }

  async get(id: string): Promise<Referral | null> {
    const all = await readAll();
    return all.find((r) => r.id === id) ?? null;
  }

  async create(referral: Referral): Promise<Referral> {
    return withLock(async () => {
      const all = await readAll();
      all.unshift(referral);
      await writeAll(all);
      return referral;
    });
  }

  async update(id: string, patch: Partial<Referral>): Promise<Referral | null> {
    return withLock(async () => {
      const all = await readAll();
      const idx = all.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      const updated = {
        ...all[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      all[idx] = updated;
      await writeAll(all);
      return updated;
    });
  }

  async saveDocument(
    referralId: string,
    documentId: string,
    bytes: Uint8Array,
  ): Promise<string> {
    const dir = path.join(UPLOADS_DIR, referralId);
    await fs.mkdir(dir, { recursive: true });
    const storagePath = path.join(dir, documentId);
    await fs.writeFile(storagePath, bytes);
    return storagePath;
  }

  async readDocument(storagePath: string): Promise<Uint8Array> {
    const abs = path.resolve(storagePath);
    if (!abs.startsWith(path.resolve(UPLOADS_DIR))) {
      throw new Error("Toegang geweigerd: pad valt buiten upload-directory.");
    }
    return fs.readFile(abs);
  }
}

/**
 * KV-backed (Upstash Redis) adapter. Persistente storage gedeeld over alle
 * serverless function instances en deploys. Documenten blijven file-backed
 * (Upstash KV is geen object store) — voor productie hoort daar Vercel Blob
 * of S3 onder.
 */
class KvReferralStore implements ReferralStore {
  private fileFallback = new FileReferralStore();

  async list(): Promise<Referral[]> {
    return kvReadArray<Referral>(KV_KEYS.referrals);
  }
  async get(id: string): Promise<Referral | null> {
    const all = await this.list();
    return all.find((r) => r.id === id) ?? null;
  }
  async create(referral: Referral): Promise<Referral> {
    return kvWithLock(KV_KEYS.referrals, async () => {
      const all = await kvReadArray<Referral>(KV_KEYS.referrals);
      all.unshift(referral);
      await kvWriteArray(KV_KEYS.referrals, all);
      return referral;
    });
  }
  async update(id: string, patch: Partial<Referral>): Promise<Referral | null> {
    return kvWithLock(KV_KEYS.referrals, async () => {
      const all = await kvReadArray<Referral>(KV_KEYS.referrals);
      const idx = all.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      const updated = {
        ...all[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      all[idx] = updated;
      await kvWriteArray(KV_KEYS.referrals, all);
      return updated;
    });
  }
  // Documenten blijven file-backed (binary, niet geschikt voor KV).
  async saveDocument(referralId: string, documentId: string, bytes: Uint8Array): Promise<string> {
    return this.fileFallback.saveDocument(referralId, documentId, bytes);
  }
  async readDocument(storagePath: string): Promise<Uint8Array> {
    return this.fileFallback.readDocument(storagePath);
  }
}

let _store: ReferralStore | null = null;

export function referralStore(): ReferralStore {
  if (!_store) {
    _store = kvAvailable() ? new KvReferralStore() : new FileReferralStore();
  }
  return _store;
}

/** Welke backend wordt gebruikt — handig voor de admin diagnose-pagina. */
export function referralStorageBackend(): "kv" | "file" {
  return kvAvailable() ? "kv" : "file";
}

// Voorkom unused-warning op kvClient bij future imports
export { kvClient as _kvClient };

export function statusIsTerminal(status: ReferralStatus): boolean {
  return (
    status === "geaccepteerd" ||
    status === "niet-passend" ||
    status === "doorgezet-naar-behandelaren-app"
  );
}
