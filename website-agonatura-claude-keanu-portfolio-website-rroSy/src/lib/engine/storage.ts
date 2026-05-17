/**
 * Storage-laag voor de zorg-engine.
 *
 * Volgt hetzelfde patroon als de referral-store: een interface met een
 * file-backed adapter voor lokale ontwikkeling en eenvoudige selfhost.
 * Voor productie vervangen door een managed database adapter (Postgres /
 * Supabase) zonder dat de aanroepende code hoeft te veranderen.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type {
  EngineAlert,
  EngineNotification,
  Medewerker,
  Traject,
} from "./types";
import {
  KV_KEYS,
  kvAvailable,
  kvReadArray,
  kvWithLock,
  kvWriteArray,
} from "@/lib/storage/kv";

/** Zie src/lib/referrals/storage.ts voor de uitleg van deze fallback-volgorde. */
const DATA_ROOT =
  process.env.AGONATURA_DATA_DIR ||
  (process.env.VERCEL ? "/tmp/agonatura-data" : path.join(process.cwd(), ".data"));
const TRAJECTEN_FILE = path.join(DATA_ROOT, "trajecten.json");
const ALERTS_FILE = path.join(DATA_ROOT, "alerts.json");
const NOTIFICATIONS_FILE = path.join(DATA_ROOT, "notifications.json");
const MEDEWERKERS_FILE = path.join(DATA_ROOT, "medewerkers.json");
const LOCK_FILE = path.join(DATA_ROOT, ".engine.lock");

/**
 * Seed-team voor de feedbackversie. Sluit aan op de namen uit het
 * masterplan (Ronald, Harold, Moniek, Jasper). Vervang in productie
 * door echte medewerkers uit een identity provider.
 */
const SEED_MEDEWERKERS: Medewerker[] = [
  { id: "med_ronald", name: "Ronald", email: "ronald@agonatura.nl", role: "admin", active: true },
  { id: "med_harold", name: "Harold", email: "harold@agonatura.nl", role: "intake-coordinator", active: true },
  { id: "med_moniek", name: "Moniek", email: "moniek@agonatura.nl", role: "intake-coordinator", active: true },
  { id: "med_jasper", name: "Jasper", email: "jasper@agonatura.nl", role: "behandelaar", active: true },
  { id: "med_gd_demo", name: "Drs. Demo Gedragswetenschapper", email: "gd@agonatura.nl", role: "behaviour-scientist", active: true },
];

async function ensureDirs() {
  await fs.mkdir(DATA_ROOT, { recursive: true });
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

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDirs();
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export interface EngineStore {
  listTrajecten(): Promise<Traject[]>;
  getTraject(id: string): Promise<Traject | null>;
  getTrajectByReferralId(referralId: string): Promise<Traject | null>;
  createTraject(traject: Traject): Promise<Traject>;
  updateTraject(id: string, patch: Partial<Traject>): Promise<Traject | null>;

  listAlerts(filter?: { trajectId?: string; unresolvedOnly?: boolean }): Promise<EngineAlert[]>;
  createAlert(alert: EngineAlert): Promise<EngineAlert>;
  resolveAlert(id: string, resolvedByName: string): Promise<EngineAlert | null>;

  listNotifications(filter?: { trajectId?: string }): Promise<EngineNotification[]>;
  createNotification(notification: EngineNotification): Promise<EngineNotification>;
  markNotificationSent(id: string, sentAt?: string): Promise<EngineNotification | null>;

  listMedewerkers(): Promise<Medewerker[]>;
}

class FileEngineStore implements EngineStore {
  async listTrajecten(): Promise<Traject[]> {
    return readJson<Traject[]>(TRAJECTEN_FILE, []);
  }
  async getTraject(id: string): Promise<Traject | null> {
    const all = await this.listTrajecten();
    return all.find((t) => t.id === id) ?? null;
  }
  async getTrajectByReferralId(referralId: string): Promise<Traject | null> {
    const all = await this.listTrajecten();
    return all.find((t) => t.referralId === referralId) ?? null;
  }
  async createTraject(traject: Traject): Promise<Traject> {
    return withLock(async () => {
      const all = await readJson<Traject[]>(TRAJECTEN_FILE, []);
      all.unshift(traject);
      await writeJson(TRAJECTEN_FILE, all);
      return traject;
    });
  }
  async updateTraject(id: string, patch: Partial<Traject>): Promise<Traject | null> {
    return withLock(async () => {
      const all = await readJson<Traject[]>(TRAJECTEN_FILE, []);
      const idx = all.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      const updated = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
      all[idx] = updated;
      await writeJson(TRAJECTEN_FILE, all);
      return updated;
    });
  }

  async listAlerts(filter?: { trajectId?: string; unresolvedOnly?: boolean }): Promise<EngineAlert[]> {
    const all = await readJson<EngineAlert[]>(ALERTS_FILE, []);
    return all.filter((a) => {
      if (filter?.trajectId && a.trajectId !== filter.trajectId) return false;
      if (filter?.unresolvedOnly && a.resolvedAt) return false;
      return true;
    });
  }
  async createAlert(alert: EngineAlert): Promise<EngineAlert> {
    return withLock(async () => {
      const all = await readJson<EngineAlert[]>(ALERTS_FILE, []);
      all.unshift(alert);
      await writeJson(ALERTS_FILE, all);
      return alert;
    });
  }
  async resolveAlert(id: string, resolvedByName: string): Promise<EngineAlert | null> {
    return withLock(async () => {
      const all = await readJson<EngineAlert[]>(ALERTS_FILE, []);
      const idx = all.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], resolvedAt: new Date().toISOString(), resolvedByName };
      await writeJson(ALERTS_FILE, all);
      return all[idx];
    });
  }

  async listNotifications(filter?: { trajectId?: string }): Promise<EngineNotification[]> {
    const all = await readJson<EngineNotification[]>(NOTIFICATIONS_FILE, []);
    return filter?.trajectId ? all.filter((n) => n.trajectId === filter.trajectId) : all;
  }
  async createNotification(notification: EngineNotification): Promise<EngineNotification> {
    return withLock(async () => {
      const all = await readJson<EngineNotification[]>(NOTIFICATIONS_FILE, []);
      all.unshift(notification);
      await writeJson(NOTIFICATIONS_FILE, all);
      return notification;
    });
  }
  async markNotificationSent(id: string, sentAt = new Date().toISOString()): Promise<EngineNotification | null> {
    return withLock(async () => {
      const all = await readJson<EngineNotification[]>(NOTIFICATIONS_FILE, []);
      const idx = all.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], status: "verzonden", sentAt };
      await writeJson(NOTIFICATIONS_FILE, all);
      return all[idx];
    });
  }

  async listMedewerkers(): Promise<Medewerker[]> {
    const stored = await readJson<Medewerker[] | null>(MEDEWERKERS_FILE, null);
    if (stored && stored.length) return stored;
    // Seed bij eerste gebruik zodat de feedbackversie meteen werkbaar is.
    await writeJson(MEDEWERKERS_FILE, SEED_MEDEWERKERS);
    return SEED_MEDEWERKERS;
  }
}

/**
 * KV-backed adapter — gedeelde state over function instances en deploys.
 */
class KvEngineStore implements EngineStore {
  async listTrajecten(): Promise<Traject[]> {
    return kvReadArray<Traject>(KV_KEYS.trajecten);
  }
  async getTraject(id: string): Promise<Traject | null> {
    const all = await this.listTrajecten();
    return all.find((t) => t.id === id) ?? null;
  }
  async getTrajectByReferralId(referralId: string): Promise<Traject | null> {
    const all = await this.listTrajecten();
    return all.find((t) => t.referralId === referralId) ?? null;
  }
  async createTraject(traject: Traject): Promise<Traject> {
    return kvWithLock(KV_KEYS.trajecten, async () => {
      const all = await kvReadArray<Traject>(KV_KEYS.trajecten);
      all.unshift(traject);
      await kvWriteArray(KV_KEYS.trajecten, all);
      return traject;
    });
  }
  async updateTraject(id: string, patch: Partial<Traject>): Promise<Traject | null> {
    return kvWithLock(KV_KEYS.trajecten, async () => {
      const all = await kvReadArray<Traject>(KV_KEYS.trajecten);
      const idx = all.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      const updated = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
      all[idx] = updated;
      await kvWriteArray(KV_KEYS.trajecten, all);
      return updated;
    });
  }

  async listAlerts(filter?: { trajectId?: string; unresolvedOnly?: boolean }): Promise<EngineAlert[]> {
    const all = await kvReadArray<EngineAlert>(KV_KEYS.alerts);
    return all.filter((a) => {
      if (filter?.trajectId && a.trajectId !== filter.trajectId) return false;
      if (filter?.unresolvedOnly && a.resolvedAt) return false;
      return true;
    });
  }
  async createAlert(alert: EngineAlert): Promise<EngineAlert> {
    return kvWithLock(KV_KEYS.alerts, async () => {
      const all = await kvReadArray<EngineAlert>(KV_KEYS.alerts);
      all.unshift(alert);
      await kvWriteArray(KV_KEYS.alerts, all);
      return alert;
    });
  }
  async resolveAlert(id: string, resolvedByName: string): Promise<EngineAlert | null> {
    return kvWithLock(KV_KEYS.alerts, async () => {
      const all = await kvReadArray<EngineAlert>(KV_KEYS.alerts);
      const idx = all.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], resolvedAt: new Date().toISOString(), resolvedByName };
      await kvWriteArray(KV_KEYS.alerts, all);
      return all[idx];
    });
  }

  async listNotifications(filter?: { trajectId?: string }): Promise<EngineNotification[]> {
    const all = await kvReadArray<EngineNotification>(KV_KEYS.notifications);
    return filter?.trajectId ? all.filter((n) => n.trajectId === filter.trajectId) : all;
  }
  async createNotification(notification: EngineNotification): Promise<EngineNotification> {
    return kvWithLock(KV_KEYS.notifications, async () => {
      const all = await kvReadArray<EngineNotification>(KV_KEYS.notifications);
      all.unshift(notification);
      await kvWriteArray(KV_KEYS.notifications, all);
      return notification;
    });
  }
  async markNotificationSent(id: string, sentAt = new Date().toISOString()): Promise<EngineNotification | null> {
    return kvWithLock(KV_KEYS.notifications, async () => {
      const all = await kvReadArray<EngineNotification>(KV_KEYS.notifications);
      const idx = all.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], status: "verzonden", sentAt };
      await kvWriteArray(KV_KEYS.notifications, all);
      return all[idx];
    });
  }

  async listMedewerkers(): Promise<Medewerker[]> {
    const stored = await kvReadArray<Medewerker>(KV_KEYS.medewerkers);
    if (stored.length) return stored;
    await kvWriteArray(KV_KEYS.medewerkers, SEED_MEDEWERKERS);
    return SEED_MEDEWERKERS;
  }
}

let _store: EngineStore | null = null;
export function engineStore(): EngineStore {
  if (!_store) {
    _store = kvAvailable() ? new KvEngineStore() : new FileEngineStore();
  }
  return _store;
}

export function engineStorageBackend(): "kv" | "file" {
  return kvAvailable() ? "kv" : "file";
}
