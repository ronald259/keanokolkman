import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { getLocatie } from "@/lib/locaties";

export const metadata: Metadata = {
  title: "Gemeente Lelystad — BGGZ-aanbod",
  description:
    "Voor jeugdigen die in gemeente Lelystad wonen: kortdurende BGGZ-interventie of een gezamenlijk onderzoek naar passende zorg, inclusief doorverwijzing naar SGGZ.",
};

const loc = getLocatie("lelystad");

export default function LelystadPage() {
  return (
    <>
      <PageHero
        eyebrow="Gemeente Lelystad — BGGZ-aanbod"
        title="Voor jeugdigen die wonen in gemeente Lelystad."
        intro={loc.korteBeschrijving}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/aanmelden/start?route=lelystad"
            className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none"
          >
            Start aanmelding gemeente Lelystad →
          </Link>
          <Link
            href="/aanmelden"
            className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10"
          >
            Andere routes
          </Link>
        </div>
      </PageHero>

      {/* Sticky aanmeld-CTA — zichtbaar bij scrollen */}
      <section className="sticky top-16 z-30 border-y border-moss-200/70 bg-cream/95 backdrop-blur sm:top-20">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-sm text-moss-900">
            <strong>Woont het kind in gemeente Lelystad?</strong> De aanmelding is het beginpunt — wij nemen contact op.
          </p>
          <Link href="/aanmelden/start?route=lelystad" className="btn-primary">
            Aanmelden gemeente Lelystad →
          </Link>
        </div>
      </section>

      <section className="container-wide py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <p className="eyebrow">Op deze pagina</p>
            <ul className="mt-4 space-y-2 text-sm text-moss-700">
              <li><a href="#voor-wie" className="hover:text-forest-700">Voor wie</a></li>
              <li><a href="#hoe-werkt" className="hover:text-forest-700">Hoe werkt het</a></li>
              <li><a href="#aanmelden" className="hover:text-forest-700">Aanmelden</a></li>
              <li><a href="#vragen" className="hover:text-forest-700">Vragen</a></li>
            </ul>
          </aside>

          <Prose>
            <section id="voor-wie">
              <h2>Voor wie</h2>
              <p>
                Dit aanbod is bedoeld voor <strong>jeugdigen die in gemeente
                Lelystad wonen</strong> en bij wie sprake is van enkelvoudige
                problematiek binnen de Basis GGZ. Het gaat dus niet om waar het
                kind behandeld wordt — onze terreinen kunnen ook voor andere
                contracten worden ingezet — maar om de woongemeente waarmee
                AgoNatura dit specifieke BGGZ-contract heeft.
              </p>
              <p>
                Voor jeugdigen uit de Veluwe-gemeenten (Elburg, Oldebroek,
                Harderwijk, Putten, Zeewolde, Nunspeet, Ermelo) geldt een
                ander aanbod: specialistische dagbehandeling voor complexe
                problematiek. Loopt het binnen Lelystad complexer dan
                enkelvoudige BGGZ, dan helpen we met een passende
                doorverwijzing.
              </p>
            </section>

            <section id="hoe-werkt">
              <h2>Hoe werkt het</h2>
              <h3>Wat we doen</h3>
              <ul>
                {loc.wij_doen.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <h3>Wat dit aanbod niet is</h3>
              <ul>
                {loc.wij_zijn_niet.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <blockquote>
                Wanneer anderen vastlopen kan de natuur — onze co-therapeut —
                vaak wél een opening geven.
              </blockquote>
            </section>

            <section id="aanmelden">
              <h2>Aanmelden</h2>
              <p>
                De aanmelding gebeurt via ons aanmeldsysteem. Geen
                contactformulier vooraf, geen onnodige tussenstappen — direct
                het proces in dat hoort bij een zorgvuldige BGGZ-route. Na
                verzending krijgt u een cliëntcode en wordt de aanmelding
                direct in onze zorg-engine geplaatst voor inhoudelijke
                beoordeling door een gedragswetenschapper.
              </p>
              <p>
                <Link
                  href="/aanmelden/start?route=lelystad"
                  className="btn-primary not-prose"
                >
                  Start aanmelding gemeente Lelystad →
                </Link>
              </p>
              <p>
                Liever eerst overleggen of past dit bij uw vraag? Bel of mail —
                contactgegevens staan op de{" "}
                <Link href="/aanmelden">aanmeldpagina</Link>.
              </p>
            </section>

            <section id="vragen">
              <h2>Veelgestelde vragen</h2>
              <h3>Geldt dit aanbod ook als het kind elders woont?</h3>
              <p>
                Nee. Dit specifieke BGGZ-aanbod is gekoppeld aan het contract
                dat AgoNatura met gemeente Lelystad heeft. Woont het kind in
                een andere gemeente, kies dan een van de andere
                aanmeldroutes op de <Link href="/aanmelden">aanmeldpagina</Link>.
              </p>
              <h3>Komt mijn kind op dezelfde locatie als de dagbehandeling?</h3>
              <p>
                Locatie Lelystad wordt gebruikt voor twee aanbodvormen:
                dagbehandeling (voor jeugdigen uit de Veluwe-gemeenten) en
                het BGGZ-aanbod (voor jeugdigen uit gemeente Lelystad). Het
                gaat om twee inhoudelijk verschillende programma&apos;s, met
                eigen begeleiding en eigen ritme — al gebruiken we
                hetzelfde terrein.
              </p>
              <h3>Heb ik een verwijzing nodig om aan te melden?</h3>
              <p>
                U mag eerst vrijblijvend overleggen zonder verwijzing. Voor
                een BGGZ-traject is in de regel een verwijzing nodig — we
                helpen u bij de juiste route als dat nog niet rond is.
              </p>
              <h3>Hoelang duurt zo&apos;n traject?</h3>
              <p>
                BGGZ-routes zijn kortdurend van aard. We werken vraaggericht
                en evalueren tussentijds. Doel is helderheid: of de
                interventie effect heeft, of dat een andere route passender
                blijkt.
              </p>
              <h3>Wat als blijkt dat ik bij SGGZ moet zijn?</h3>
              <p>
                Dan helpen wij met de doorverwijzing. We laten u niet
                zwemmen. Goede zorg begint bij eerlijk kijken naar wat past —
                ook als dat ergens anders is.
              </p>
            </section>
          </Prose>
        </div>
      </section>

      <section className="bg-forest-900 py-20 text-mist sm:py-24">
        <div className="container-wide text-center">
          <p className="eyebrow text-mist/70">Gemeente Lelystad — BGGZ-aanbod</p>
          <h2 className="display-2 mt-3 text-balance text-cream">
            Het begint met de aanmelding.
          </h2>
          <p className="lede mt-5 mx-auto max-w-xl text-mist/85">
            Daarna pakken wij het op: beoordeling door een
            gedragswetenschapper, terugkoppeling binnen vijf werkdagen, en
            samen de vervolgstap bepalen.
          </p>
          <div className="mt-8">
            <Link
              href="/aanmelden/start?route=lelystad"
              className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none"
            >
              Aanmelden gemeente Lelystad — start nu →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
