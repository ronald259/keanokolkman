"use client";

import { useRef } from "react";
import type { MediaItem } from "@/lib/types";
import MediaCard from "./MediaCard";

export default function Carousel({
  title,
  items,
  size = "md",
}: {
  title: string;
  items: MediaItem[];
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section className="px-6 md:px-12 mb-12 group/section">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
          <button onClick={() => scroll(-1)} aria-label="Vorige" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white">‹</button>
          <button onClick={() => scroll(1)} aria-label="Volgende" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white">›</button>
        </div>
      </div>
      <div ref={ref} className="rail flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {items.map((m) => (
          <MediaCard key={m.id} item={m} size={size} />
        ))}
      </div>
    </section>
  );
}
