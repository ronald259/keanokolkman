import Link from "next/link";
import type { MediaItem } from "@/lib/types";

export default function Hero({ item }: { item: MediaItem }) {
  return (
    <section className="relative h-[78vh] min-h-[520px] w-full vignette overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnailPath}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      <div className="absolute inset-0 flex items-end">
        <div className="relative z-10 px-6 md:px-12 pb-20 max-w-2xl fade-up">
          <div className="text-[var(--color-accent)] text-xs tracking-[0.35em] uppercase mb-3">
            Uitgelicht
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            {item.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80 line-clamp-3 max-w-xl">
            {item.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/media/${item.id}`} className="btn btn-primary">
              <PlayIcon /> Bekijk
            </Link>
            <Link href={`/media/${item.id}`} className="btn btn-ghost">
              <InfoIcon /> Meer info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}
