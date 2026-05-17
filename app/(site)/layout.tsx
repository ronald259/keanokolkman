import Link from "next/link";
import { getSession } from "@/lib/auth";
import Nav from "@/components/Nav";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="min-h-screen flex flex-col">
      <Nav role={session?.role ?? "viewer"} />
      <div className="flex-1">{children}</div>
      <footer className="mt-24 border-t border-white/5 py-10 px-6 md:px-12 text-sm text-[var(--color-muted)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          © {new Date().getFullYear()} Keanu Kolkman — Privé archief
        </div>
        <div className="flex gap-5">
          <Link href="/home" className="hover:text-white">Home</Link>
          <Link href="/films" className="hover:text-white">Films</Link>
          <Link href="/animaties" className="hover:text-white">Animaties</Link>
          <Link href="/fotos" className="hover:text-white">Foto&apos;s</Link>
          <a href="/logout" className="hover:text-white">Uitloggen</a>
        </div>
      </footer>
    </div>
  );
}
