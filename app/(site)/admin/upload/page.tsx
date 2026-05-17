import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import UploadWizard from "./UploadWizard";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const s = await getSession();
  if (!s || s.role !== "admin") redirect("/login");

  return (
    <main className="pt-28 px-6 md:px-12 pb-16 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="text-[var(--color-accent)] text-xs tracking-[0.4em] uppercase">Beheer</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">Nieuw item uploaden</h1>
        <p className="text-[var(--color-muted)] mt-2">Volg de stappen om een film, animatie of foto toe te voegen. Max 500 MB per bestand.</p>
      </header>

      <UploadWizard />
    </main>
  );
}
