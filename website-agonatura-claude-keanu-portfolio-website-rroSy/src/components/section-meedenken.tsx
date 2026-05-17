import Link from "next/link";
import Image from "next/image";
import { bospad } from "@/lib/images";

export function SectionMeedenken() {
  return (
    <section className="relative isolate overflow-hidden py-24 text-mist sm:py-32" aria-labelledby="meedenken-heading">
      <Image
        src={bospad.src}
        alt={bospad.alt}
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,28,21,0.75) 0%, rgba(14,28,21,0.65) 50%, rgba(14,28,21,0.85) 100%)",
        }}
      />

      <div className="container-wide relative">
        <div className="max-w-3xl">
          <p className="eyebrow text-mist/70">Onze specialiteit</p>
          <h2
            id="meedenken-heading"
            className="display-2 mt-3 text-balance text-cream"
          >
            We denken graag mee in de ingewikkelde casus.
          </h2>
          <p className="lede mt-6 text-mist/90">
            Daar ligt onze kracht. Waar reguliere routes vastlopen, blijkt
            de natuur — onze co-therapeut — vaak wél een opening te geven.
            Niet als magie, wel als rustige omgeving waarin regulatie,
            relatie en ervaring opnieuw kunnen ademen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card
            title="Vastgelopen casuïstiek"
            body="Multi-problem, thuiszitters, trauma- en hechtingsproblematiek. We denken inhoudelijk mee, ook als nog niet duidelijk is wat passend is."
          />
          <Card
            title="Natuur als co-therapeut"
            body="Geen decor — een actief onderdeel van de behandeling. Stress daalt, aandacht herstelt, lichaam en geest komen weer in verbinding."
          />
          <Card
            title="Inhoudelijk overleggen"
            body="Twijfelt u of een vraag bij ons past? Bel of mail. Goed verwijzen begint bij eerlijk kijken — ook als wij niet de juiste plek zijn."
          />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/aanmelden" className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none">
            Een casus overleggen
          </Link>
          <Link href="/voor-verwijzers" className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10">
            Voor verwijzers
          </Link>
        </div>
      </div>
    </section>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-mist/15 bg-cream/5 p-6 backdrop-blur-sm">
      <h3 className="font-display text-xl text-cream">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-mist/85">{body}</p>
    </div>
  );
}
