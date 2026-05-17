"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

const nav = [
  { href: "/behandelvisie", label: "Behandelvisie" },
  { href: "/behandelvormen", label: "Behandelvormen" },
  { href: "/locaties", label: "Aanbod" },
  { href: "/voor-ouders", label: "Voor ouders" },
  { href: "/voor-verwijzers", label: "Voor verwijzers" },
  { href: "/voor-gemeenten", label: "Voor gemeenten" },
  { href: "/over", label: "Over" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-cream/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(60,80,55,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-wide flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="group flex items-center gap-2 text-moss-950"
          aria-label="AgoNatura — home"
        >
          <Logo className="h-8 w-8 text-forest-700 transition-transform duration-500 group-hover:rotate-6" />
          <span className="font-display text-xl tracking-tight sm:text-2xl">
            AgoNatura
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Hoofdnavigatie">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm transition-colors ${
                  active
                    ? "text-forest-800"
                    : "text-moss-900 hover:text-forest-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/aanmelden" className="btn-primary ml-3">
            Aanmelden of overleggen
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-moss-300/60 bg-cream/70 text-moss-900"
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
            <path
              d={open ? "M2 2L16 12M2 12L16 2" : "M1 2H17M1 7H17M1 12H17"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-500 ease-out ${
          open ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container-wide pb-6 pt-2">
          <ul className="flex flex-col gap-1 rounded-3xl border border-moss-200/70 bg-cream/95 p-3 shadow-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-2xl px-4 py-3 text-base text-moss-900 hover:bg-moss-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link href="/aanmelden" className="btn-primary w-full">
                Aanmelden of overleggen
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
