import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Voor ouders",
  description:
    "Hoe AgoNatura werkt voor ouders en verzorgers van kinderen en jongeren met complexe problematiek. Erkenning, veiligheid en een werkbaar plan.",
};

export default function VoorOudersPage() {
  return (
    <>
      <PageHero
        eyebrow="Voor ouders en verzorgers"
        title="U hoeft niet alles uit te leggen. Wij luisteren eerst."
        intro="Veel ouders die ons benaderen, hebben al een lange weg achter de rug. Diagnoses, wachtlijsten, gesprekken die niet leiden tot beweging. Hier mag het eerst even rustig zijn."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/aanmelden" className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none">
            Vrijblijvend overleggen
          </Link>
          <Link href="/behandelvormen" className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10">
            Wat we bieden
          </Link>
        </div>
      </PageHero>

      <section className="container-wide py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="Op deze pagina" className="text-sm text-moss-700">
              <p className="eyebrow">Op deze pagina</p>
              <ul className="mt-4 space-y-2">
                <li><a href="#herkenning" className="hover:text-forest-700">Herkenning</a></li>
                <li><a href="#wat" className="hover:text-forest-700">Wat AgoNatura biedt</a></li>
                <li><a href="#dag" className="hover:text-forest-700">Een dag op het terrein</a></li>
                <li><a href="#rol" className="hover:text-forest-700">Uw rol als ouder</a></li>
                <li><a href="#kosten" className="hover:text-forest-700">Kosten en vergoeding</a></li>
                <li><a href="#vragen" className="hover:text-forest-700">Veelgestelde vragen</a></li>
              </ul>
            </nav>
          </aside>

          <Prose>
            <section id="herkenning">
              <h2>Herkenning</h2>
              <p>
                Misschien herkent u dit. Uw kind loopt vast. Op school, in
                vriendschappen, soms ook thuis. Boos worden lijkt makkelijker
                dan praten. Slapen wil niet, of juist alleen maar slapen. De
                wereld voelt te druk, te eisend, te weinig veilig.
              </p>
              <p>
                Tegelijk doet u alles. U regelt afspraken, leest, leest nog
                meer, vraagt door, voert gesprekken, vecht voor de juiste hulp.
                En soms voelt het alsof niemand écht ziet wat hier speelt.
              </p>
              <blockquote>
                Wij geloven dat sommige kinderen geen strengere structuur nodig
                hebben, maar een omgeving waarin ze weer kunnen ademen.
              </blockquote>
            </section>

            <section id="wat">
              <h2>Wat AgoNatura biedt</h2>
              <p>
                AgoNatura biedt specialistische dagbehandeling in en met de
                natuur. Geen dagbesteding. Geen zorgboerderij. Geen losse
                training. Een volwaardig multidisciplinair behandeltraject,
                gefundeerd in trauma-, hechtings- en systeemgericht werken.
              </p>
              <h3>Wat we doen</h3>
              <ul>
                <li>Specialistische behandeling op een vast, vertrouwd terrein.</li>
                <li>Persoonlijke behandelaar en een gedragswetenschapper die meekijkt.</li>
                <li>Therapievormen als PMT, EMDR, ACT en muziektherapie.</li>
                <li>Ervaringsgerichte activiteiten waarin gedrag en regulatie écht geoefend worden.</li>
                <li>Ouderbegeleiding en systeemgesprekken, omdat herstel nooit alleen het kind is.</li>
              </ul>
            </section>

            <section id="dag">
              <h2>Een dag op het terrein</h2>
              <p>
                Een dag begint rustig. Een vast ritueel, een eerste check-in,
                samen vuur maken of de dag plannen. Geen overprikkelend
                klaslokaal, geen wachtkamer. Daarna een mix van behandeling,
                ervaringsgerichte activiteit en stilte.
              </p>
              <p>
                Lichaamsgericht werken, beweging, samen koken, momenten van
                reflectie. We kijken niet alleen wat een kind doet, maar wat
                het probeert te vertellen.
              </p>
            </section>

            <section id="rol">
              <h2>Uw rol als ouder</h2>
              <p>
                U bent geen toeschouwer. Ouderbegeleiding is een vast onderdeel
                van elk traject. We werken systeemgericht: u krijgt inzicht in
                wat we doen, waarom, en hoe u thuis kunt aansluiten. Niet als
                huiswerk, wel als verbinding.
              </p>
            </section>

            <section id="kosten">
              <h2>Kosten en vergoeding</h2>
              <p>
                De behandeling wordt in de regel vergoed vanuit de Jeugdwet via
                uw gemeente. Voor een aanmelding heeft u meestal een verwijzing
                of een beschikking nodig. Wij denken graag mee bij de juiste
                route. Loop gerust eerst onbevangen bij ons binnen.
              </p>
            </section>

            <section id="vragen">
              <h2>Veelgestelde vragen</h2>
              <h3>Is AgoNatura geschikt voor mijn kind?</h3>
              <p>
                Wij behandelen kinderen en jongeren met complexe problematiek
                op het snijvlak van GGZ en jeugdhulp: trauma, hechting,
                regulatie, thuiszitten, vastlopen in onderwijs. In een intake
                kijken we eerlijk of wij de juiste plek zijn.
              </p>
              <h3>Hoe lang duurt een traject?</h3>
              <p>
                Op de Veluwe duurt een specialistisch traject regulier
                negen maanden tot anderhalf jaar. Het is bewust geen kort
                programma — duurzaam herstel vraagt tijd. We werken met
                heldere fases en evaluatiemomenten. Doel is altijd dat een
                kind weer verder kan, met een passende vervolgstap.
              </p>
              <p>
                Voor kinderen die wonen in gemeente Lelystad werken we
                juist kortdurend binnen de BGGZ. We onderzoeken samen of
                een kortdurende interventie passend is, of helpen u met een
                doorverwijzing naar SGGZ of een andere route die beter
                past.
              </p>
              <h3>En als het in een spreekkamer wel had gewerkt?</h3>
              <p>
                Dan was u waarschijnlijk niet hier. Wij zijn juist voor de
                kinderen waarbij standaard routes onvoldoende hebben opgeleverd.
              </p>
            </section>
          </Prose>
        </div>
      </section>

      <SectionCTA />
    </>
  );
}
