import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Voor verwijzers",
  description:
    "Praktische informatie voor verwijzers: doelgroep, contra-indicaties, aanmelden, terugkoppeling en samenwerking met AgoNatura.",
};

const indications = [
  "Trauma- en stressgerelateerde problematiek.",
  "Hechtingsproblematiek en relationeel verstoorde ontwikkeling.",
  "Emotie- en gedragsregulatieproblemen, internaliserend of externaliserend.",
  "Thuiszitters en (dreigende) schooluitval bij complexe achtergrond.",
  "Multiproblem-jeugdigen waarbij reguliere routes onvoldoende werken.",
];

const contra = [
  "Acute suïcidaliteit of crisisbehandeling als primaire vraag.",
  "Actieve psychose of ernstige verslavingsproblematiek op de voorgrond.",
  "Wanneer uitsluitend gedragsbeheersing wordt gevraagd — wij werken behandelend.",
  "Wanneer onveiligheid in het systeem eerst om jeugdbescherming of veiligheidsplanning vraagt.",
];

export default function VoorVerwijzersPage() {
  return (
    <>
      <PageHero
        eyebrow="Voor verwijzers"
        title="Onze specialiteit: meedenken in de ingewikkelde casus."
        intro="Waar reguliere routes vastlopen, blijkt de natuur — onze co-therapeut — vaak wél een opening te geven. We werken samen met huisartsen, jeugdartsen, GI's, lokale teams, GGZ-partners en scholen — kort, professioneel en inhoudelijk. Voor de Veluwe-gemeenten als specialistische dagbehandeling; voor jeugdigen die wonen in gemeente Lelystad als kortdurend BGGZ-aanbod."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/aanmelden" className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none">
            Vrijblijvend overleggen
          </Link>
          <Link href="/behandelvormen" className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10">
            Behandelvormen
          </Link>
        </div>
      </PageHero>

      <section className="container-wide py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="card-soft">
            <h2 className="display-3 text-moss-950">Indicaties</h2>
            <ul className="mt-6 space-y-3 text-moss-900">
              {indications.map((i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-soft">
            <h2 className="display-3 text-moss-950">Contra-indicaties</h2>
            <ul className="mt-6 space-y-3 text-moss-900">
              {contra.map((i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-600" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-moss-700">
              Twijfelt u of een casus past? Bel of mail. We denken graag mee,
              ook als we uiteindelijk niet de juiste plek zijn.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Werkwijze</p>
            <h2 className="display-2 mt-3 text-balance text-moss-950">
              Van eerste contact tot terugkoppeling
            </h2>
          </div>
          <Prose>
            <h3>Aanmelden</h3>
            <p>
              Aanmelden kan via ons aanmeldformulier of telefonisch. Voor een
              vrijblijvend casusoverleg hoeft nog geen verwijzing of
              beschikking aanwezig te zijn — een eerste inhoudelijke check
              voorkomt onnodige omwegen.
            </p>
            <h3>Intake & observatie</h3>
            <p>
              Een gedragswetenschapper en behandelaar verzorgen samen de
              intake. We betrekken het systeem, school en relevante eerdere
              dossiers. Waar nodig vragen we aanvullende diagnostiek aan.
            </p>
            <h3>Behandelplan & doelen</h3>
            <p>
              Doelen worden concreet, evalueerbaar en in begrijpelijke taal
              geformuleerd. U ontvangt een afschrift en bent
              gesprekspartner bij evaluaties.
            </p>
            <h3>Terugkoppeling</h3>
            <p>
              Tussentijdse terugkoppeling op afgesproken momenten en
              vraaggestuurd bij relevante ontwikkelingen. Korte lijnen,
              betrouwbare communicatie.
            </p>
            <h3>Afronding & vervolgzorg</h3>
            <p>
              We werken altijd toe naar een passende vervolgstap: terug naar
              school, ambulante begeleiding, of indien nodig opschaling. Geen
              kind raakt zoek tussen voorzieningen.
            </p>
          </Prose>
        </div>
      </section>

      <SectionCTA />
    </>
  );
}
