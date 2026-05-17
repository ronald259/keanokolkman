"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { create, getById, remove, update } from "@/lib/store";
import { saveUpload, validateFile } from "@/lib/upload";
import type { Category, MediaType, Status } from "@/lib/types";

function fileUrl(key: string) {
  return `/api/files/${key}`;
}

const CATEGORIES: Category[] = ["films", "animaties", "fotos", "projecten"];

function str(form: FormData, key: string, fallback = ""): string {
  const v = form.get(key);
  return typeof v === "string" ? v : fallback;
}

function clean(s: string): string {
  // Strip ASCII control chars except \t and \n; React escapes for output.
  return s.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "").trim().slice(0, 4000);
}

export async function uploadAction(
  formData: FormData
): Promise<{ ok: false; error: string } | { ok: true; id: string }> {
  await requireAdmin();

  const title = clean(str(formData, "title"));
  const description = clean(str(formData, "description"));
  const category = str(formData, "category") as Category;
  const tagsRaw = clean(str(formData, "tags"));
  const featured = str(formData, "featured") === "on";
  const status = (str(formData, "status") || "published") as Status;

  if (!title) return { ok: false, error: "Titel is verplicht." };
  if (!CATEGORIES.includes(category)) return { ok: false, error: "Ongeldige categorie." };

  const mediaFile = formData.get("media");
  const thumbFile = formData.get("thumbnail");
  if (!(mediaFile instanceof File) || mediaFile.size === 0) {
    return { ok: false, error: "Selecteer een mediabestand." };
  }

  const isVideo = mediaFile.type.startsWith("video/");
  const mediaKind = isVideo ? "video" : "image";
  const validation = validateFile(mediaFile, mediaKind);
  if (!validation.ok) return validation;

  let thumbUrl: string;
  let mediaUrl: string;
  try {
    const mediaKey = await saveUpload(mediaFile, mediaKind);
    mediaUrl = fileUrl(mediaKey);
    if (thumbFile instanceof File && thumbFile.size > 0) {
      const thumbCheck = validateFile(thumbFile, "thumbnail");
      if (!thumbCheck.ok) return thumbCheck;
      const thumbKey = await saveUpload(thumbFile, "thumbnail");
      thumbUrl = fileUrl(thumbKey);
    } else if (!isVideo) {
      thumbUrl = mediaUrl;
    } else {
      return { ok: false, error: "Voeg een thumbnail toe voor video's." };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload mislukt." };
  }

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  const item = await create({
    title,
    description,
    category,
    mediaType: mediaKind as MediaType,
    filePath: mediaUrl,
    thumbnailPath: thumbUrl,
    status: status === "hidden" ? "hidden" : "published",
    featured,
    tags,
  });

  revalidatePath("/home");
  revalidatePath(`/${category}`);
  revalidatePath("/admin");
  return { ok: true, id: item.id };
}

export async function updateAction(
  id: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const existing = await getById(id);
  if (!existing) return { ok: false, error: "Niet gevonden." };

  const title = clean(str(formData, "title"));
  const description = clean(str(formData, "description"));
  const category = str(formData, "category") as Category;
  const status = (str(formData, "status") || existing.status) as Status;
  const featured = str(formData, "featured") === "on";
  const tags = clean(str(formData, "tags"))
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (!title) return { ok: false, error: "Titel is verplicht." };
  if (!CATEGORIES.includes(category)) return { ok: false, error: "Ongeldige categorie." };

  await update(id, { title, description, category, status, featured, tags });
  revalidatePath("/home");
  revalidatePath(`/${category}`);
  revalidatePath(`/${existing.category}`);
  revalidatePath("/admin");
  revalidatePath(`/media/${id}`);
  return { ok: true };
}

export async function deleteItem(id: string) {
  await requireAdmin();
  await remove(id);
  revalidatePath("/home");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleStatus(id: string) {
  await requireAdmin();
  const m = await getById(id);
  if (!m) return;
  await update(id, { status: m.status === "published" ? "hidden" : "published" });
  revalidatePath("/home");
  revalidatePath("/admin");
  revalidatePath(`/${m.category}`);
}
