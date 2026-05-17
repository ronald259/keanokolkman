import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { Category, MediaItem, Status } from "./types";

type Row = {
  id: string;
  title: string;
  description: string;
  category: Category;
  media_type: "video" | "image";
  file_path: string;
  thumbnail_path: string;
  status: Status;
  sort_order: number;
  featured: boolean;
  tags: string[];
  created_at: Date;
  updated_at: Date;
};

function toItem(r: Row): MediaItem {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    mediaType: r.media_type,
    filePath: r.file_path,
    thumbnailPath: r.thumbnail_path,
    status: r.status,
    sortOrder: r.sort_order,
    featured: r.featured,
    tags: r.tags ?? [],
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export async function getAll(): Promise<MediaItem[]> {
  const { rows } = await db().query<Row>(
    `SELECT * FROM media ORDER BY sort_order ASC, created_at DESC`
  );
  return rows.map(toItem);
}

export async function getPublished(): Promise<MediaItem[]> {
  const { rows } = await db().query<Row>(
    `SELECT * FROM media WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC`
  );
  return rows.map(toItem);
}

export async function getById(id: string): Promise<MediaItem | null> {
  const { rows } = await db().query<Row>(`SELECT * FROM media WHERE id = $1`, [id]);
  return rows[0] ? toItem(rows[0]) : null;
}

export async function getByCategory(category: Category): Promise<MediaItem[]> {
  const { rows } = await db().query<Row>(
    `SELECT * FROM media WHERE category = $1 AND status = 'published' ORDER BY sort_order ASC, created_at DESC`,
    [category]
  );
  return rows.map(toItem);
}

export async function getFeatured(): Promise<MediaItem[]> {
  const { rows } = await db().query<Row>(
    `SELECT * FROM media WHERE featured = true AND status = 'published' ORDER BY sort_order ASC, created_at DESC`
  );
  return rows.map(toItem);
}

export async function getRecent(limit = 12): Promise<MediaItem[]> {
  const { rows } = await db().query<Row>(
    `SELECT * FROM media WHERE status = 'published' ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(toItem);
}

export async function create(input: Omit<MediaItem, "id" | "createdAt" | "updatedAt" | "sortOrder"> & { sortOrder?: number }): Promise<MediaItem> {
  const id = randomUUID();
  const { rows } = await db().query<Row>(
    `INSERT INTO media
       (id, title, description, category, media_type, file_path, thumbnail_path, status, sort_order, featured, tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
       COALESCE($9, (SELECT COALESCE(MAX(sort_order),0)+1 FROM media)),
       $10, $11)
     RETURNING *`,
    [
      id,
      input.title,
      input.description,
      input.category,
      input.mediaType,
      input.filePath,
      input.thumbnailPath,
      input.status,
      input.sortOrder ?? null,
      input.featured,
      input.tags,
    ]
  );
  return toItem(rows[0]);
}

export async function update(id: string, patch: Partial<MediaItem>): Promise<MediaItem | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = {
    title: "title",
    description: "description",
    category: "category",
    mediaType: "media_type",
    filePath: "file_path",
    thumbnailPath: "thumbnail_path",
    status: "status",
    sortOrder: "sort_order",
    featured: "featured",
    tags: "tags",
  };
  for (const [k, col] of Object.entries(map)) {
    if (k in patch && patch[k as keyof MediaItem] !== undefined) {
      values.push(patch[k as keyof MediaItem]);
      fields.push(`${col} = $${values.length}`);
    }
  }
  if (fields.length === 0) return getById(id);
  values.push(id);
  const { rows } = await db().query<Row>(
    `UPDATE media SET ${fields.join(", ")}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] ? toItem(rows[0]) : null;
}

export async function remove(id: string): Promise<MediaItem | null> {
  const { rows } = await db().query<Row>(`DELETE FROM media WHERE id = $1 RETURNING *`, [id]);
  return rows[0] ? toItem(rows[0]) : null;
}

export async function setStatus(id: string, status: Status) {
  return update(id, { status });
}
