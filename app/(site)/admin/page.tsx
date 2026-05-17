import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAll } from "@/lib/store";
import { CATEGORY_LABELS } from "@/lib/types";
import { deleteItem, toggleStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") {
    return (
      <main className="pt-32 px-6 md:px-12 max-w-2xl">
        <h1 className="text-3xl font-bold">Geen toegang</h1>
        <p className="text-[var(--color-muted)] mt-2">
          Deze pagina is alleen voor beheerders. Log in met het admin-wachtwoord.
        </p>
        <a href="/logout" className="btn btn-ghost mt-6">Uitloggen</a>
      </main>
    );
  }

  const items = await getAll();
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <main className="pt-28 px-6 md:px-12 pb-16 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[var(--color-accent)] text-xs tracking-[0.4em] uppercase">Beheer</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">Mediabibliotheek</h1>
          <p className="text-[var(--color-muted)] mt-2">{items.length} items totaal</p>
        </div>
        <Link href="/admin/upload" className="btn btn-primary">
          + Nieuw item uploaden
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3 text-right">Acties</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.thumbnailPath} alt="" className="w-20 aspect-video object-cover rounded" />
                </td>
                <td className="px-4 py-3 font-medium">{m.title}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{CATEGORY_LABELS[m.category]}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{m.mediaType}</td>
                <td className="px-4 py-3">
                  <form action={toggleStatus.bind(null, m.id)}>
                    <button className={`text-xs px-2 py-1 rounded ${m.status === "published" ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                      {m.status === "published" ? "Zichtbaar" : "Verborgen"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(m.createdAt).toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/edit/${m.id}`} className="text-[var(--color-accent)] hover:underline mr-4">
                    Bewerk
                  </Link>
                  <form action={deleteItem.bind(null, m.id)} className="inline">
                    <button className="text-red-400 hover:underline" type="submit">
                      Verwijder
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
