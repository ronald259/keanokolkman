import Link from "next/link";
import { notFound } from "next/navigation";
import { getById, getByCategory } from "@/lib/store";
import { CATEGORY_LABELS } from "@/lib/types";
import MediaCard from "@/components/MediaCard";

export const dynamic = "force-dynamic";

export default async function MediaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getById(id);
  if (!item || item.status !== "published") notFound();

  const related = (await getByCategory(item.category)).filter((m) => m.id !== item.id).slice(0, 6);

  return (
    <main className="pt-20">
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnailPath} alt="" className="w-full h-[60vh] object-cover opacity-40 blur-2xl scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-[var(--color-bg)]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
          <Link href={`/${item.category}`} className="text-sm text-[var(--color-muted)] hover:text-white inline-flex items-center gap-1 mb-6">
            ← Terug naar {CATEGORY_LABELS[item.category]}
          </Link>

          <div className="rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/60 border border-white/5">
            {item.mediaType === "video" ? (
              <video
                src={item.filePath}
                poster={item.thumbnailPath}
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video bg-black"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.filePath} alt={item.title} className="w-full max-h-[80vh] object-contain bg-black" />
            )}
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 fade-up">
              <div className="text-[var(--color-accent)] text-xs tracking-[0.35em] uppercase">
                {CATEGORY_LABELS[item.category]}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-2">{item.title}</h1>
              <p className="mt-4 text-white/85 leading-relaxed whitespace-pre-wrap">{item.description}</p>
              {item.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <aside className="text-sm text-[var(--color-muted)] space-y-3 md:border-l md:border-white/10 md:pl-8">
              <Row label="Type" value={item.mediaType === "video" ? "Video" : "Foto"} />
              <Row label="Categorie" value={CATEGORY_LABELS[item.category]} />
              <Row label="Datum" value={new Date(item.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} />
              <Row label="Toegevoegd" value={new Date(item.createdAt).toISOString().slice(0, 10)} />
            </aside>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="px-6 md:px-12 mt-10 pb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Meer uit {CATEGORY_LABELS[item.category]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {related.map((m) => (
              <MediaCard key={m.id} item={m} size="sm" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-white/90 text-right">{value}</span>
    </div>
  );
}
