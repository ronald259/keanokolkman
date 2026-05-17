"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/lib/types";
import { deleteItem, updateAction } from "../../actions";

export default function EditForm({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category);
  const [tags, setTags] = useState(item.tags.join(", "));
  const [featured, setFeatured] = useState(item.featured);
  const [status, setStatus] = useState(item.status);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("category", category);
    fd.set("tags", tags);
    fd.set("status", status);
    fd.set("featured", featured ? "on" : "");
    startTransition(async () => {
      const res = await updateAction(item.id, fd);
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.error || "Opslaan mislukt.");
      }
    });
  }

  function remove() {
    if (!confirm("Weet je zeker dat je dit item wilt verwijderen?")) return;
    startTransition(async () => {
      await deleteItem(item.id);
    });
  }

  return (
    <form onSubmit={save} className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnailPath} alt="" className="rounded-lg w-full" />
          <p className="text-xs text-[var(--color-muted)] mt-2 truncate">{item.mediaType} · {new URL(item.filePath).hostname}</p>
        </div>
        <div className="sm:col-span-2 space-y-4">
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">Titel</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)]" />
          </label>
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">Beschrijving</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)] resize-y" />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-[var(--color-muted)]">Categorie</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as MediaItem["category"])} className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5">
                <option value="films">Films</option>
                <option value="animaties">Animaties</option>
                <option value="fotos">Foto&apos;s</option>
                <option value="projecten">Projecten</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-[var(--color-muted)]">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as MediaItem["status"])} className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5">
                <option value="published">Zichtbaar</option>
                <option value="hidden">Verborgen</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">Tags (komma-gescheiden)</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Uitgelicht
          </label>
        </div>
      </div>

      {error && <div className="text-sm text-red-300 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">{error}</div>}
      {success && <div className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded-lg px-3 py-2">Opgeslagen.</div>}

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <button type="button" onClick={remove} className="btn btn-ghost text-red-300 hover:text-red-200" disabled={pending}>
          Verwijderen
        </button>
        <div className="flex gap-3">
          <a href={`/media/${item.id}`} className="btn btn-ghost">Bekijk</a>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Opslaan…" : "Opslaan"}
          </button>
        </div>
      </div>
    </form>
  );
}
