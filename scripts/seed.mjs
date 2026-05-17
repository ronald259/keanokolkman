#!/usr/bin/env node
/**
 * Seeds the database with demo content if `media` is empty.
 * Reads from data/seed.json.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.resolve(__dirname, "..", "data", "seed.json");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is niet gezet.");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query("SELECT COUNT(*)::int AS c FROM media");
    if (rows[0].c > 0) {
      console.log(`Media-tabel bevat al ${rows[0].c} item(s). Sla seed over.`);
      return;
    }
    const items = JSON.parse(await readFile(SEED_FILE, "utf8"));
    for (const m of items) {
      await client.query(
        `INSERT INTO media
          (id, title, description, category, media_type, file_path, thumbnail_path,
           status, sort_order, featured, tags, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          m.id,
          m.title,
          m.description,
          m.category,
          m.mediaType,
          m.filePath,
          m.thumbnailPath,
          m.status,
          m.sortOrder,
          m.featured,
          m.tags,
          m.createdAt,
          m.updatedAt,
        ]
      );
    }
    console.log(`Geseed: ${items.length} items.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
