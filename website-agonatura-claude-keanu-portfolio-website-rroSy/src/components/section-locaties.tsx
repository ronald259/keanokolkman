import Link from "next/link";
import { LOCATIES } from "@/lib/locaties";

export function SectionLocaties() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="locaties-heading">
      <div className="container-wide">
        <div className="max-w-3xl">
          <p className="eyebrow">Twee aanbodvormen, twee behandellocaties</p>
          <h2 id="locaties-heading" className="display-2 mt-3 text-balance text-moss-950">
            Per gemeente een ander aanbod. Per kind een passende plek.
          </h2>
          <p className="lede mt-6">
            AgoNatura biedt twee inhoudelijk verschillende producten: specialistische
            dagbehandeling voor de Veluwe-gemeenten (op locatie Lelystad of Nunspeet, naar
            keuze) en een kortdurend BGGZ-aanbod voor jeugdigen die in gemeente Lelystad
            wonen. Welk aanbod past, hangt af van de woongemeente — welke locatie past, kiezen
            we samen.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {LOCATIES.map((loc) => {
            const isLelystad = loc.id === "lelystad";
            return (
              <article
                key={loc.id}
                className={`flex flex-col rounded-3xl border p-8 ${
                  isLelystad
                    ? "border-forest-700/30 bg-forest-700 text-mist shadow-md shadow-forest-900/10"
                    : "border-moss-200/60 bg-cream shadow-sm shadow-moss-900/5"
                }`}
              >
                <p className={`eyebrow ${isLelystad ? "text-mist/70" : ""}`}>
                  {loc.zorgkader}
                </p>
                <h3 className={`display-3 mt-3 ${isLelystad ? "text-cream" : "text-moss-950"}`}>
                  {loc.naam}
                </h3>
                <p className={`mt-2 text-sm uppercase tracking-[0.18em] ${isLelystad ? "text-mist/80" : "text-moss-700"}`}>
                  {loc.ondertitel}
                </p>
                <p className={`mt-5 ${isLelystad ? "text-mist/90" : "text-moss-800"}`}>
                  {loc.korteBeschrijving}
                </p>

                <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <dt className={`eyebrow ${isLelystad ? "text-mist/70" : ""}`}>
                    {isLelystad ? "Woongemeente" : "Gemeenten"}
                  </dt>
                  <dt className={`eyebrow ${isLelystad ? "text-mist/70" : ""}`}>
                    Behandellocatie{loc.behandellocaties.length > 1 ? "s" : ""}
                  </dt>
                  <dd className={isLelystad ? "text-mist/85" : "text-moss-800"}>
                    {loc.gemeenten.join(" · ")}
                  </dd>
                  <dd className={isLelystad ? "text-mist/85" : "text-moss-800"}>
                    {loc.behandellocaties.join(" · ")}
                  </dd>
                </dl>

                <div className="mt-auto pt-8 flex flex-wrap gap-3">
                  {isLelystad ? (
                    <>
                      <Link
                        href={`/aanmelden/start?route=${loc.aanmeldRoute}`}
                        className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none"
                      >
                        {loc.aanmeldLabel} →
                      </Link>
                      <Link
                        href="/lelystad"
                        className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10"
                      >
                        Meer over dit aanbod
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/locaties#${loc.id}`}
                      className="inline-flex items-center gap-2 text-forest-700 transition-transform hover:translate-x-1"
                    >
                      Meer over dit aanbod <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
