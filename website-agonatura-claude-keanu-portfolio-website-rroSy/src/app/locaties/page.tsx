import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SectionCTA } from "@/components/section-cta";
import { LOCATIES } from "@/lib/locaties";

export const metadata: Metadata = {
  title: "Locaties & aanbod",
  description:
    "AgoNatura biedt op de Veluwe specialistische dagbehandeling en in Lelystad een kortdurende BGGZ-route voor enkelvoudige problematiek.",
};

export default function LocatiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Aanbod per gemeente"
        title="Twee contracten, twee inhoudelijk verschillende routes."
        intro="AgoNatura heeft per regio een ander gemeentecontract. Welk aanbod past, hangt niet af van waar het kind behandeld wordt, maar van de woongemeente. Hieronder per regio wat we doen, voor wie, en met welke gemeenten we werken."
      />

      <section className="container-wide py-20 sm:py-24">
        <ul className="space-y-16">
          {LOCATIES.map((loc) => (
            <li key={loc.id} id={loc.id} className="scroll-mt-28">
              <article className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
                <header className="lg:sticky lg:top-28 lg:self-start">
                  <p className="eyebrow">{loc.zorgkader}</p>
                  <h2 className="display-2 mt-3 text-balance text-moss-950">
                    {loc.naam}
                  </h2>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-moss-700">
                    {loc.ondertitel}
                  </p>
                  <p className="mt-5 text-moss-800">{loc.korteBeschrijving}</p>
                  <p className="eyebrow mt-7">
                    {loc.id === "lelystad" ? "Woongemeente kind" : "Contracteerde gemeenten"}
                  </p>
                  <p className="mt-2 text-sm text-moss-900">
                    {loc.gemeenten.join(" · ")}
                  </p>
                  <p className="eyebrow mt-5">
                    Behandellocatie{loc.behandellocaties.length > 1 ? "s" : ""}
                  </p>
                  <p className="mt-2 text-sm text-moss-900">
                    {loc.behandellocaties.join(" · ")}
                    {loc.behandellocaties.length > 1 && (
                      <span className="block mt-1 text-xs text-moss-700">
                        Keuze in overleg met gemeente of verwijzer.
                      </span>
                    )}
                  </p>
                </header>

                <div className="space-y-6">
                  <Card title="Gericht op" items={loc.gericht_op} tone="moss" />
                  <Card title="Wat we doen" items={loc.wij_doen} tone="forest" />
                  <Card title="Wat we niet zijn" items={loc.wij_zijn_niet} tone="clay" />
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={`/aanmelden/start?route=${loc.aanmeldRoute}`}
                      className="btn-primary"
                    >
                      {loc.aanmeldLabel} →
                    </Link>
                    {loc.id === "lelystad" ? (
                      <Link href="/lelystad" className="btn-ghost">
                        Meer over Lelystad
                      </Link>
                    ) : (
                      <Link href="/voor-verwijzers" className="btn-ghost">
                        Voor verwijzers
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <SectionCTA />
    </>
  );
}

function Card({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "moss" | "forest" | "clay";
}) {
  const tones = {
    moss: "border-moss-200/70 bg-cream",
    forest: "border-forest-700/20 bg-forest-700/5",
    clay: "border-clay-200/70 bg-clay-50",
  };
  const dotColor = {
    moss: "bg-moss-500",
    forest: "bg-forest-700",
    clay: "bg-clay-600",
  };
  return (
    <div className={`rounded-3xl border p-6 ${tones[tone]}`}>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-3 text-moss-900">
        {items.map((it) => (
          <li key={it} className="flex gap-3">
            <span aria-hidden="true" className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[tone]}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
