import Link from "next/link";
import type { MediaItem } from "@/lib/types";

export default function MediaCard({ item, size = "md" }: { item: MediaItem; size?: "sm" | "md" | "lg" }) {
  const widths = {
    sm: "w-48 md:w-56",
    md: "w-64 md:w-72",
    lg: "w-80 md:w-96",
  } as const;

  return (
    <Link href={`/media/${item.id}`} className={`card relative shrink-0 ${widths[size]} rounded-lg overflow-hidden bg-[var(--color-surface)] block`}>
      <div className="relative aspect-video bg-[var(--color-surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailPath}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
        {item.mediaType === "video" && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-white/80">
            Video
          </div>
        )}
        {item.featured && (
          <div className="absolute top-2 left-2 bg-[var(--color-accent)] text-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
            Uitgelicht
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <h3 className="text-sm md:text-base font-semibold leading-tight">{item.title}</h3>
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
            {new Date(item.createdAt).toLocaleDateString("nl-NL", { year: "numeric", month: "short" })}
            {item.tags.length > 0 && <span> · {item.tags.slice(0, 2).join(", ")}</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
