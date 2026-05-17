"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/films", label: "Films" },
  { href: "/animaties", label: "Animaties" },
  { href: "/fotos", label: "Foto's" },
  { href: "/projecten", label: "Projecten" },
];

export default function Nav({ role }: { role: "viewer" | "admin" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/85 backdrop-blur-md border-b border-white/5" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <nav className="flex items-center gap-8 px-6 md:px-12 py-4">
        <Link href="/home" className="flex items-center gap-2 group">
          <span className="text-xl md:text-2xl font-bold tracking-tight">
            K<span className="text-[var(--color-accent)]">.</span>Kolkman
          </span>
        </Link>
        <ul className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`text-sm transition-colors ${
                    active ? "text-white" : "text-[var(--color-muted)] hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-3">
          {role === "admin" && (
            <Link
              href="/admin"
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                pathname.startsWith("/admin")
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-white/15 text-[var(--color-muted)] hover:text-white hover:border-white/30"
              }`}
            >
              Beheer
            </Link>
          )}
          <a
            href="/logout"
            className="text-sm text-[var(--color-muted)] hover:text-white"
            title="Uitloggen"
          >
            Uitloggen
          </a>
        </div>
      </nav>

      {/* Mobile bottom links */}
      <ul className="flex md:hidden items-center justify-center gap-5 pb-3 px-6 text-xs">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={active ? "text-white" : "text-[var(--color-muted)]"}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
}
