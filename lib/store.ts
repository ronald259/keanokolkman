import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { MediaItem, Category, Status } from "./types";

// In Vercel productie is alleen /tmp writable. Lokaal gebruiken we /data.
// Bij eerste read kopiëren we de seed naar de runtime-locatie.
const SEED_FILE = path.join(process.cwd(), "data", "seed.json");
const RUNTIME_FILE =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "keanu-media.json")
    : path.join(process.cwd(), "data", "media.json");

let cache: MediaItem[] | null = null;

async function loadFromDisk(): Promise<MediaItem[]> {
  try {
    const buf = await fs.readFile(RUNTIME_FILE, "utf8");
    return JSON.parse(buf) as MediaItem[];
  } catch {
    const seed = await fs.readFile(SEED_FILE, "utf8");
    const items = JSON.parse(seed) as MediaItem[];
    await persist(items);
    return items;
  }
}

async function persist(items: MediaItem[]): Promise<void> {
  await fs.mkdir(path.dirname(RUNTIME_FILE), { recursive: true });
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(items, null, 2), "utf8");
  cache = items;
}

export async function getAll(): Promise<MediaItem[]> {
  if (!cache) cache = await loadFromDisk();
  return cache;
}

export async function getPublished(): Promise<MediaItem[]> {
  const all = await getAll();
  return all
    .filter((m) => m.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getById(id: string): Promise<MediaItem | null> {
  const all = await getAll();
  return all.find((m) => m.id === id) ?? null;
}

export async function getByCategory(category: Category): Promise<MediaItem[]> {
  const items = await getPublished();
  return items.filter((m) => m.category === category);
}

export async function getFeatured(): Promise<MediaItem[]> {
  const items = await getPublished();
  return items.filter((m) => m.featured);
}

export async function getRecent(limit = 10): Promise<MediaItem[]> {
  const items = await getPublished();
  return [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function create(input: Omit<MediaItem, "id" | "createdAt" | "updatedAt" | "sortOrder"> & { sortOrder?: number }): Promise<MediaItem> {
  const all = await getAll();
  const now = new Date().toISOString();
  const item: MediaItem = {
    ...input,
    id: randomUUID(),
    sortOrder: input.sortOrder ?? all.length,
    createdAt: now,
    updatedAt: now,
  };
  await persist([...all, item]);
  return item;
}

export async function update(id: string, patch: Partial<MediaItem>): Promise<MediaItem | null> {
  const all = await getAll();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const next: MediaItem = { ...all[idx], ...patch, id, updatedAt: new Date().toISOString() };
  const items = [...all];
  items[idx] = next;
  await persist(items);
  return next;
}

export async function remove(id: string): Promise<boolean> {
  const all = await getAll();
  const next = all.filter((m) => m.id !== id);
  if (next.length === all.length) return false;
  await persist(next);
  return true;
}

export async function setStatus(id: string, status: Status) {
  return update(id, { status });
}
