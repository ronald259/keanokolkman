import { put } from "@vercel/blob";

const ALLOWED_VIDEO = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

export type UploadKind = "video" | "image" | "thumbnail";

export function validateFile(file: File, kind: UploadKind): { ok: true } | { ok: false; error: string } {
  if (file.size > MAX_SIZE) {
    return { ok: false, error: `Bestand te groot (max ${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB).` };
  }
  const allowed = kind === "video" ? ALLOWED_VIDEO : ALLOWED_IMAGE;
  if (!allowed.includes(file.type)) {
    return { ok: false, error: `Bestandstype niet toegestaan: ${file.type}` };
  }
  return { ok: true };
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function uploadToBlob(file: File, kind: UploadKind): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Geen Vercel Blob token geconfigureerd. Maak een Blob store aan in het Vercel dashboard (Storage > Blob) en zet BLOB_READ_WRITE_TOKEN als environment variable."
    );
  }
  const filename = sanitizeFilename(file.name);
  const key = `${kind}/${Date.now()}-${filename}`;
  const blob = await put(key, file, {
    access: "public",
    token,
    addRandomSuffix: false,
  });
  return blob.url;
}
