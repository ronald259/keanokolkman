import { NextRequest } from "next/server";
import { createReadStream, promises as fs } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { resolveStoragePath } from "@/lib/upload";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { key } = await params;
  const joined = key.map(decodeURIComponent).join("/");
  const abs = resolveStoragePath(joined);
  if (!abs) return new Response("Not found", { status: 404 });

  let stat;
  try {
    stat = await fs.stat(abs);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!stat.isFile()) return new Response("Not found", { status: 404 });

  const ext = path.extname(abs).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const total = stat.size;
  const range = req.headers.get("range");

  const baseHeaders: Record<string, string> = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  if (!range) {
    const stream = Readable.toWeb(createReadStream(abs)) as unknown as ReadableStream;
    return new Response(stream, {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(total) },
    });
  }

  // Parse "bytes=start-end"
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    return new Response("Invalid range", { status: 416, headers: { "Content-Range": `bytes */${total}` } });
  }
  const startStr = match[1];
  const endStr = match[2];
  let start = startStr ? parseInt(startStr, 10) : 0;
  let end = endStr ? parseInt(endStr, 10) : total - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= total) {
    return new Response("Range not satisfiable", { status: 416, headers: { "Content-Range": `bytes */${total}` } });
  }
  // Cap a single response chunk to avoid huge buffers (8 MB).
  const MAX_CHUNK = 8 * 1024 * 1024;
  if (end - start + 1 > MAX_CHUNK) end = start + MAX_CHUNK - 1;

  const stream = Readable.toWeb(
    createReadStream(abs, { start, end })
  ) as unknown as ReadableStream;

  return new Response(stream, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Content-Length": String(end - start + 1),
    },
  });
}
