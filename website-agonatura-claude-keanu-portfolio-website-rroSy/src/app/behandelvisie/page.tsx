import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { SectionVisie } from "@/components/section-visie";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Behandelvisie",
  description:
    "De inhoudelijke visie van AgoNatura: traumasensitief, hechtingsgericht, lichaamsgericht en systeemgericht behandelen in en met de natuur.",
};

export default function BehandelvisiePage() {
  return (
    <>
      <PageHero
        eyebrow="Behandelvisie"
        title="Natuur als co-therapeut. Relatie als fundament. Ervaring als motor."
        intro="Onze behandelvisie rust op vier overtuigingen die elke dag op het terrein zichtbaar zijn — in hoe we welkom heten, hoe we kijken, hoe we behandelen en hoe we afronden."
      />

      <SectionVisie />

      <section className="container-wide py-20 sm:py-24">
        <Prose>
          <h2>Wat we onder de natuur verstaan</h2>
          <p>
            Natuur is voor ons geen achtergrond, en al helemaal geen
            marketingdecor. Het is een actief onderdeel van de behandeling.
            Stress daalt aantoonbaar in groene omgevingen. Aandacht herstelt,
            ademhaling verdiept zich, lichaam en geest komen weer in
            verbinding. Wij gebruiken dat dagelijks, doelgericht.
          </p>
          <h2>Traumasensitief werken</h2>
          <p>
            Veel kinderen die bij ons komen, dragen onverwerkte ervaringen mee.
            Wij werken traumasensitief: we bouwen eerst veiligheid en
            voorspelbaarheid op, en pas binnen die veiligheid behandelen we
            wat speelt. Soms via EMDR, soms via lichaamsgericht werken, soms
            door alleen te zijn in de buitenlucht met iemand die echt
            aanwezig is.
          </p>
          <h2>Hechtingsgericht werken</h2>
          <p>
            Ontwikkeling vindt plaats in relatie. We werken bewust met vaste
            behandelaren, vaste rituelen en een voorspelbare structuur. Een
            kind moet weten: <em>hier word ik gezien, ook op een slechte dag.</em>
          </p>
          <h2>Lichaamsgericht en ervaringsgericht</h2>
          <p>
            Het denken van Kolb en Van der Ploeg loopt door ons werk heen:
            handelen, reflecteren, begrijpen, toepassen. Op het terrein zien
            we kinderen pas écht — niet wat ze vertellen dat er aan de hand
            is, maar wat hun lichaam laat zien als ze samenwerken, hindernis
            tegenkomen, of even rust nemen.
          </p>
          <h2 id="groei">Groei en eigen regie</h2>
          <p>
            Herstel is geen rechte lijn. Er zijn dagen van vooruitgang en
            dagen van terugval. Wij geloven dat eigen regie niet ontstaat
            door dwang, maar door ervaren wat lukt. De moestuin, het pad, de
            vuurplaats — het zijn echte plekken waar dat zichtbaar wordt.
          </p>
        </Prose>
      </section>

      <SectionCTA />
    </>
  );
}
