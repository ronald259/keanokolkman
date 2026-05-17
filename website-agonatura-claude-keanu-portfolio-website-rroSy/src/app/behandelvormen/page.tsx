import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { SectionTraject } from "@/components/section-traject";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Behandelvormen",
  description:
    "PMT, EMDR, ACT, muziektherapie, orthopedagogische behandeling, lichaamsgericht werken en systeemgerichte ouderbegeleiding bij AgoNatura.",
};

const therapies = [
  {
    title: "PMT — Psychomotorische therapie",
    body: "Lichaamsgericht werken met beweging, spel en oefening. Voor kinderen die woorden tekortkomen om uit te leggen wat er gebeurt.",
    eyebrow: "Lichaamsgericht",
  },
  {
    title: "EMDR",
    body: "Traumaverwerking volgens richtlijn. Wij zetten EMDR in waar nodig — pas binnen voldoende veiligheid en regulatie.",
    eyebrow: "Traumagericht",
  },
  {
    title: "ACT — Acceptance & Commitment Therapy",
    body: "Werken aan psychologische flexibiliteit, waarden en omgaan met moeilijke gedachten en gevoelens.",
    eyebrow: "Cognitief-gedragsmatig",
  },
  {
    title: "Muziektherapie",
    body: "Klank, ritme en muziek als ingang voor regulatie, expressie en verbinding. Ook voor kinderen die zich met taal nog niet kunnen tonen.",
    eyebrow: "Creatief",
  },
  {
    title: "Orthopedagogische behandeling",
    body: "Doelgerichte begeleiding op gedrag, vaardigheden en ontwikkeling in dagelijkse situaties op het terrein.",
    eyebrow: "Ontwikkelingsgericht",
  },
  {
    title: "Systeemgerichte ouderbegeleiding",
    body: "Vaste gesprekken met ouders en het netwerk. Geen losse cursus, maar onderdeel van het behandeltraject.",
    eyebrow: "Systeemgericht",
  },
];

export default function BehandelvormenPage() {
  return (
    <>
      <PageHero
        eyebrow="Behandelvormen"
        title="Specialistische behandeling, op één terrein, in één team."
        intro="Wat ons bijzonder maakt is niet alleen wát we bieden, maar dat het samenkomt: therapie, ervaringsleren, ouderbegeleiding en dagelijkse begeleiding in dezelfde omgeving."
      />

      <section className="container-wide py-20 sm:py-24">
        <ul className="grid gap-6 md:grid-cols-2">
          {therapies.map((t) => (
            <li key={t.title} className="card-soft">
              <p className="eyebrow">{t.eyebrow}</p>
              <h3 className="display-3 mt-3 text-moss-950">{t.title}</h3>
              <p className="mt-4 text-moss-800">{t.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="ervaringsleren" className="bg-mist py-20 sm:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Ervaringsleren</p>
            <h2 className="display-2 mt-3 text-balance text-moss-950">
              Wat een kind ervaart, blijft. Wat een kind alleen gehoord heeft, vervliegt.
            </h2>
          </div>
          <div className="space-y-6 text-moss-900">
            <p className="lede">
              Wij werken vanuit de leercirkel van Kolb: handelen, observeren,
              begrijpen, toepassen. Op het activiteitenveld, in het bos, bij
              het vuur. Niet als avontuur, wel als doelgerichte oefening voor
              regulatie, samenwerking en zelfvertrouwen.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {["Regulatie", "Samenwerking", "Zelfvertrouwen", "Frustratietolerantie", "Eigenaarschap", "Reflectie"].map((label) => (
                <li key={label} className="rounded-2xl border border-moss-200/70 bg-cream px-4 py-3 text-sm">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SectionTraject />
      <SectionCTA />
    </>
  );
}
