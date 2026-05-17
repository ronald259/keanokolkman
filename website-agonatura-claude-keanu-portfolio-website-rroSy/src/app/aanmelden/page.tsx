import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Aanmelden of overleggen",
  description:
    "Aanmelden, overleggen of een casus inhoudelijk bespreken met AgoNatura. Een rustige, zorgvuldige route voor ouders, verwijzers en gemeenten.",
};

const routes = [
  {
    id: "ouder",
    label: "Aanmelding door ouder",
    body: "U bent ouder of verzorger en wilt uw kind aanmelden of vrijblijvend overleggen.",
  },
  {
    id: "verwijzer",
    label: "Aanmelding door verwijzer",
    body: "U bent huisarts, jeugdarts, GI, school of behandelaar en meldt een jeugdige aan.",
  },
  {
    id: "casusoverleg",
    label: "Casusoverleg aanvragen",
    body: "U wilt eerst inhoudelijk overleggen voordat u formeel aanmeldt.",
  },
  {
    id: "gemeente",
    label: "Gemeente of ketenpartner",
    body: "U werkt bij een toegangsteam, jeugdteam of gemeentelijke partner en wilt overleggen.",
  },
];

export default function AanmeldenPage() {
  return (
    <>
      <PageHero
        eyebrow="Aanmelden of overleggen"
        title="Een goed gesprek begint vóór het formulier."
        intro="Twijfelt u of uw vraag bij ons past? Bel of mail eerst. Wilt u liever schriftelijk aanmelden? Kies hieronder de route die het beste past — dan starten we daar de intake."
      />

      <section className="container-wide pt-20 sm:pt-24">
        <Link
          href="/aanmelden/start?route=lelystad"
          className="group relative block overflow-hidden rounded-[2.5rem] border border-forest-700/30 bg-forest-700 px-8 py-12 text-mist transition-shadow hover:shadow-xl hover:shadow-forest-900/20 sm:px-12 sm:py-16"
        >
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow text-mist/70">Woont het kind in gemeente Lelystad?</p>
              <h2 className="display-2 mt-3 max-w-2xl text-balance text-cream">
                Start hier — BGGZ-aanbod gemeente Lelystad.
              </h2>
              <p className="lede mt-5 max-w-2xl text-mist/90">
                Voor jeugdigen die wonen in gemeente Lelystad met enkelvoudige
                BGGZ-problematiek. We onderzoeken samen of een kortdurende
                interventie passend is, of helpen met een doorverwijzing naar
                SGGZ. De aanmelding hieronder is het startpunt — daarna nemen
                wij contact op.
              </p>
            </div>
            <div className="flex items-center justify-start lg:justify-end">
              <span className="btn-primary bg-cream text-forest-900 group-hover:bg-mist group-hover:shadow-none">
                Aanmelden gemeente Lelystad →
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section className="container-wide py-16 sm:py-20">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="display-3 text-moss-950">Andere routes</h2>
          <p className="max-w-md text-sm text-moss-700">
            Voor specialistische dagbehandeling vanuit de Veluwe-gemeenten
            (Elburg, Oldebroek, Harderwijk, Putten, Zeewolde, Nunspeet,
            Ermelo). Behandeling vindt plaats op locatie Lelystad of
            Nunspeet — die keuze maken we samen.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {routes.map((r) => (
            <Link
              key={r.id}
              href={`/aanmelden/start?route=${r.id}`}
              className="group card-soft transition-shadow hover:shadow-md hover:shadow-moss-900/10"
            >
              <p className="eyebrow">Route</p>
              <h3 className="display-3 mt-3 text-moss-950">{r.label}</h3>
              <p className="mt-4 text-moss-800">{r.body}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-forest-700 transition-transform group-hover:translate-x-1">
                Start aanmelding <span aria-hidden="true">→</span>
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="card-soft">
            <p className="eyebrow">Liever direct contact</p>
            <p className="mt-3 font-display text-2xl text-moss-950">085 — nog in te vullen</p>
            <p className="mt-1 text-sm text-moss-700">Ma t/m vr · 09.00 – 17.00</p>
            <a href="mailto:aanmelden@agonatura.nl" className="mt-5 inline-flex text-forest-700 underline-offset-4 hover:underline">
              aanmelden@agonatura.nl
            </a>
          </div>
          <div className="card-soft">
            <p className="eyebrow">Goed om te weten</p>
            <ul className="mt-4 space-y-3 text-sm text-moss-800">
              <li>U hoeft nog geen verwijzing te hebben om te overleggen.</li>
              <li>Uw aanmelding wordt beoordeeld door een coördinator.</li>
              <li>U ontvangt na verzending een cliëntcode voor verdere correspondentie.</li>
              <li>Privacygevoelige documenten worden veilig opgeslagen, niet op de publieke website.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
