import Link from "next/link";
import { Logo } from "@/components/logo";

const cols = [
  {
    title: "Behandeling",
    links: [
      { href: "/behandelvisie", label: "Behandelvisie" },
      { href: "/behandelvormen", label: "Behandelvormen" },
      { href: "/behandelvormen#traject", label: "Het traject" },
    ],
  },
  {
    title: "Voor wie",
    links: [
      { href: "/voor-ouders", label: "Ouders" },
      { href: "/voor-verwijzers", label: "Verwijzers" },
      { href: "/voor-gemeenten", label: "Gemeenten" },
      { href: "/locaties", label: "Aanbod per gemeente" },
    ],
  },
  {
    title: "Organisatie",
    links: [
      { href: "/over", label: "Over AgoNatura" },
      { href: "/team", label: "Team" },
      { href: "/aanmelden", label: "Contact" },
      { href: "/privacyverklaring", label: "Privacyverklaring" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-forest-950 text-mist/90">
      <div className="absolute inset-0 bg-canopy opacity-90" aria-hidden="true" />
      <div className="relative">
        <div className="container-wide pt-20 pb-12">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <Logo className="h-9 w-9 text-mist" />
                <span className="font-display text-2xl tracking-tight text-cream">
                  AgoNatura
                </span>
              </Link>
              <p className="mt-6 max-w-sm text-balance text-base leading-relaxed text-mist/80">
                Specialistische dagbehandeling in en met de natuur. Voor kinderen
                en jongeren die meer ruimte nodig hebben dan een spreekkamer
                biedt.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/aanmelden" className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none">
                  Aanmelden of overleggen
                </Link>
              </div>
            </div>

            {cols.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-mist/60">{col.title}</p>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-mist/85 transition-colors hover:text-cream"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="divider mt-16 opacity-30" />

          <div className="mt-8 flex flex-col items-start justify-between gap-4 text-sm text-mist/60 md:flex-row md:items-center">
            <p>© {new Date().getFullYear()} AgoNatura. Specialistische jeugdhulp in de natuur.</p>
            <p className="text-mist/50">
              Alleen gekwalificeerd personeel · ISO 9001 gecertificeerd · AVG-zorgvuldig
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
