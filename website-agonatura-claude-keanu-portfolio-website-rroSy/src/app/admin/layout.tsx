import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist pt-24 sm:pt-28">
      <div className="container-wide">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Beheer</p>
            <h1 className="font-display text-3xl text-moss-950">Aanmeldplatform</h1>
          </div>
          <nav className="flex items-center gap-2 text-sm" aria-label="Beheer">
            <Link href="/admin" className="btn-quiet">Aanmeldingen</Link>
            <Link href="/admin/trajecten" className="btn-quiet">Trajecten</Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="btn-ghost">Uitloggen</button>
            </form>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
