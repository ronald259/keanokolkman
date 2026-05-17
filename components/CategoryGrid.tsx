import type { MediaItem } from "@/lib/types";
import MediaCard from "./MediaCard";

export default function CategoryGrid({ title, subtitle, items }: { title: string; subtitle?: string; items: MediaItem[] }) {
  return (
    <main className="pt-28 px-6 md:px-12 pb-12">
      <header className="mb-8 fade-up">
        <div className="text-[var(--color-accent)] text-xs tracking-[0.4em] uppercase">Categorie</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">{title}</h1>
        {subtitle && <p className="text-[var(--color-muted)] mt-2 max-w-2xl">{subtitle}</p>}
        <div className="text-sm text-[var(--color-muted)] mt-3">{items.length} {items.length === 1 ? "item" : "items"}</div>
      </header>
      {items.length === 0 ? (
        <div className="text-[var(--color-muted)] py-20 text-center border border-dashed border-white/10 rounded-xl">
          Nog geen content in deze categorie.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} size="sm" />
          ))}
        </div>
      )}
    </main>
  );
}
