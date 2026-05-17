import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getById } from "@/lib/store";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "admin") redirect("/login");
  const { id } = await params;
  const item = await getById(id);
  if (!item) notFound();

  return (
    <main className="pt-28 px-6 md:px-12 pb-16 max-w-3xl mx-auto">
      <Link href="/admin" className="text-sm text-[var(--color-muted)] hover:text-white">← Terug naar beheer</Link>
      <header className="my-6">
        <div className="text-[var(--color-accent)] text-xs tracking-[0.4em] uppercase">Bewerken</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">{item.title}</h1>
      </header>
      <EditForm item={item} />
    </main>
  );
}
