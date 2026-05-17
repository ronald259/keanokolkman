import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Voor gemeenten",
  description:
    "Een professionele jeugdhulppartner voor gemeenten en beleidsmakers. Effectief, evalueerbaar en samenwerkingsgericht.",
};

const numbers = [
  { value: "1:3", label: "Maximale verhouding begeleiders – jeugdigen op het terrein." },
  { value: "SKJ+", label: "Alleen gekwalificeerd personeel — waaronder SKJ-geregistreerde behandelaren, gedragswetenschappelijk aangestuurd." },
  { value: "9–18 mnd", label: "Reguliere duur van een specialistisch traject op de Veluwe." },
];

export default function VoorGemeentenPage() {
  return (
    <>
      <PageHero
        eyebrow="Voor gemeenten & beleidsmakers"
        title="Een inhoudelijke partner voor de jeugdigen waar het systeem op vastloopt."
        intro="AgoNatura is een specialistische jeugdhulpaanbieder die zich richt op complexe casuïstiek. Geen experiment. Geen tussenoplossing. Een professionele behandelplek met heldere structuur."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/aanmelden" className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none">
            Maak een afspraak
          </Link>
          <Link href="/over" className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10">
            Over de organisatie
          </Link>
        </div>
      </PageHero>

      <section className="container-wide py-20 sm:py-24">
        <ul className="grid gap-6 sm:grid-cols-3">
          {numbers.map((n) => (
            <li key={n.label} className="card-soft text-center sm:text-left">
              <p className="font-display text-5xl text-forest-700">{n.value}</p>
              <p className="mt-3 text-sm leading-relaxed text-moss-800">{n.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Waarom AgoNatura</p>
            <h2 className="display-2 mt-3 text-balance text-moss-950">
              Voorkomt escalatie. Voorkomt onnodige plaatsing.
            </h2>
          </div>
          <Prose>
            <h3>Voor complexe casuïstiek</h3>
            <p>
              Wij ontvangen jeugdigen die in reguliere routes vastlopen:
              thuiszitters, multiproblem, trauma- en hechtingsproblematiek,
              vroege schooluitval. Onze setting biedt rust, structuur en
              specialistische behandeling waar dat in een klassieke
              spreekkamer niet meer landt.
            </p>
            <h3>Effectief op meerdere lagen</h3>
            <p>
              We werken systeemgericht: kind én ouders zijn onderdeel van de
              behandeling. Dit verhoogt de kans op duurzaam herstel en
              vermindert kans op terugval of opschaling naar zwaardere
              voorzieningen.
            </p>
            <h3>Heldere lijnen</h3>
            <p>
              Korte communicatielijnen met lokale teams, jeugdbescherming en
              onderwijspartners. Concrete doelen, evalueerbare voortgang en
              transparante afronding.
            </p>
            <h3>Kwaliteit en verantwoording</h3>
            <p>
              AgoNatura werkt volgens de richtlijnen voor specialistische
              jeugdhulp, uitsluitend met gekwalificeerd personeel
              — waaronder SKJ-geregistreerde behandelaren —
              gedragswetenschappelijke aansturing,{" "}
              <strong>ISO 9001 gecertificeerd</strong> kwaliteitsmanagement
              en AVG-conforme verwerking. Aanbestedingsdossiers en
              kwaliteitsdocumentatie zijn op aanvraag beschikbaar.
            </p>
            <h3>Twee aanbodvormen, twee behandellocaties</h3>
            <p>
              Met de Veluwe-gemeenten (Elburg, Oldebroek, Harderwijk, Putten,
              Zeewolde, Nunspeet en Ermelo) hebben we een contract voor
              specialistische dagbehandeling voor complexe problematiek. Die
              dagbehandeling vindt plaats op locatie Lelystad óf Nunspeet —
              we kiezen samen wat voor de jeugdige praktisch passend is
              (reisafstand, voorkeur, beschikbaarheid).
            </p>
            <p>
              Met gemeente Lelystad hebben we daarnaast een BGGZ-contract voor
              enkelvoudige problematiek — een kortdurende interventie of een
              gezamenlijk onderzoek naar wat nodig is, inclusief passende
              doorverwijzing naar SGGZ. Dit aanbod geldt alleen voor
              jeugdigen die in gemeente Lelystad wonen en wordt aangeboden
              op locatie Lelystad.
            </p>
            <h3>Samenwerking</h3>
            <p>
              We sluiten graag aan bij regionale inkoop, pilotprogramma&apos;s voor
              thuiszitters en samenwerkingsverbanden onderwijs–zorg. Plan
              gerust een verkennend gesprek.
            </p>
          </Prose>
        </div>
      </section>

      <SectionCTA />
    </>
  );
}
