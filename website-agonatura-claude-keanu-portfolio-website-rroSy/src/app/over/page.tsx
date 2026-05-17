import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Over AgoNatura",
  description:
    "Wie AgoNatura is, waar we voor staan en waarom we werken zoals we werken.",
};

export default function OverPage() {
  return (
    <>
      <PageHero
        eyebrow="Over AgoNatura"
        title="Een behandelplek, ontstaan uit ongemak met hoe het soms gaat."
        intro="AgoNatura is opgericht door professionals die zagen wat er gebeurt als kinderen vastlopen in bestaande systemen. Geen alternatief voor de GGZ. Een specialistische aanvulling, voor wie meer ruimte nodig heeft dan een spreekkamer biedt."
      />

      <section className="container-wide py-20 sm:py-24">
        <Prose>
          <h2>Waar we voor staan</h2>
          <p>
            Wij accepteren niet automatisch dat kinderen alleen maar moeten
            functioneren binnen systemen die hen laten vastlopen. We geloven
            dat herstel soms juist ontstaat buiten de traditionele setting —
            zonder dat we daarmee de waarde van die setting ontkennen.
          </p>
          <p>
            Regulatie, relatie en ervaring zijn voor ons voorwaarden voor
            ontwikkeling. Daar bouwen we onze behandeling op. We zijn niet
            zweverig en niet activistisch. Wel moedig genoeg om kritisch te
            kijken naar wat een kind écht nodig heeft.
          </p>

          <h2>Hoe we werken</h2>
          <p>
            We werken multidisciplinair, gedragswetenschappelijk aangestuurd,
            met uitsluitend gekwalificeerd personeel — waaronder
            SKJ-geregistreerde behandelaren en BIG-geregistreerde
            therapeuten. Diagnostiek, behandeling en systeemwerk vinden
            plaats op één terrein, in één team.
          </p>

          <h2>Kwaliteit</h2>
          <p>
            AgoNatura werkt volgens de richtlijnen voor specialistische
            jeugdhulp. We zijn <strong>ISO 9001 gecertificeerd</strong> voor
            ons kwaliteitsmanagement, werken AVG-conform en monitoren onze
            trajecten methodisch — niet voor de papierwinkel, wel voor onze
            cliënten en hun verwijzers.
          </p>

          <h2>Twee aanbodvormen, twee behandellocaties</h2>
          <p>
            AgoNatura heeft twee aanbodvormen. Voor de Veluwe-gemeenten
            (Elburg, Oldebroek, Harderwijk, Putten, Zeewolde, Nunspeet en
            Ermelo) bieden we specialistische dagbehandeling voor complexe
            problematiek — die behandeling vindt plaats op locatie Lelystad
            óf Nunspeet, naar wat voor de jeugdige praktisch het beste
            past. Voor jeugdigen die in gemeente Lelystad wonen geldt een
            BGGZ-aanbod voor enkelvoudige problematiek — kortdurende
            interventies of een gezamenlijk onderzoek naar een passende
            vervolgroute, inclusief doorverwijzing naar SGGZ waar dat
            beter past.
          </p>
          <p>
            Welk aanbod past, hangt af van de <em>woongemeente</em> van het
            kind, niet van de behandellocatie. Welke locatie passend is,
            bespreken we samen. Meer hierover op de pagina{" "}
            <a href="/locaties">Aanbod per gemeente</a>.
          </p>

          <h2>Maatschappelijke positie</h2>
          <p>
            We willen niet zomaar nóg een jeugdzorgaanbieder zijn. We willen
            iets toevoegen aan een systeem dat onder druk staat. Dat doen we
            met deskundigheid, met inhoud, en met respect voor de mensen die
            elke dag binnen dat systeem hun best doen.
          </p>
        </Prose>
      </section>

      <SectionCTA />
    </>
  );
}
