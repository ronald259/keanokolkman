import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ALLOWED_VIDEO = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

export type UploadKind = "video" | "image" | "thumbnail";

export const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");

export function validateFile(file: File, kind: UploadKind):
  | { ok: true }
  | { ok: false; error: string } {
  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: `Bestand te groot (max ${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB).`,
    };
  }
  const allowed = kind === "video" ? ALLOWED_VIDEO : ALLOWED_IMAGE;
  if (!allowed.includes(file.type)) {
    return { ok: false, error: `Bestandstype niet toegestaan: ${file.type || "onbekend"}` };
  }
  return { ok: true };
}

export function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "file"
  );
}

function extFor(file: File): string {
  // Prefer original extension; fall back to MIME map
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName && /^\.[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  const map: Record<string, string> = {
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[file.type] || "";
}

/**
 * Saves the uploaded file to disk under UPLOAD_ROOT/<kind>/<random>.<ext>
 * Returns a relative key (e.g. "video/2026-05/abcd1234-clip.mp4") that the
 * site uses with /api/files/<key> to stream behind auth.
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  const stamp = new Date().toISOString().slice(0, 7); // YYYY-MM
  const dir = path.join(UPLOAD_ROOT, kind, stamp);
  await fs.mkdir(dir, { recursive: true });

  const rand = randomBytes(8).toString("hex");
  const ext = extFor(file);
  const safeName = sanitizeFilename(path.basename(file.name, path.extname(file.name)));
  const filename = `${rand}-${safeName}${ext}`;
  const absPath = path.join(dir, filename);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);

  return path.posix.join(kind, stamp, filename);
}

/** Returns the absolute path for a stored key, but only if it stays inside UPLOAD_ROOT. */
export function resolveStoragePath(key: string): string | null {
  const root = path.resolve(UPLOAD_ROOT);
  const abs = path.resolve(root, key);
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  return abs;
}

export const ALLOWED_TYPES = { ALLOWED_VIDEO, ALLOWED_IMAGE };
