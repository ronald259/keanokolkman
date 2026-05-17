"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { vuurplaats } from "@/lib/images";

const pillars = [
  {
    title: "Natuur als co-therapeut",
    body: "De natuur reguleert wat een spreekkamer niet kan reguleren: stress, prikkels, ademhaling, lichaamsgevoel. Onderzoek van Agnes van den Berg en collega's laat zien dat verblijf in groene ruimte herstellend werkt op aandacht en arousal. Wij gebruiken dat dagelijks.",
  },
  {
    title: "Relatie boven protocol",
    body: "Zonder vertrouwen geen behandeling. Onze professionals investeren eerst in de relatie. Pas binnen die relatie kunnen we kijken naar trauma, gedrag, hechting en regulatie.",
  },
  {
    title: "Ervaring boven uitleg",
    body: "Volgens Kolb en Van der Ploeg landt nieuw gedrag pas wanneer een kind het zelf heeft ervaren. Wij combineren handelen, reflecteren, begrijpen en toepassen, in echte situaties op het terrein.",
  },
  {
    title: "Systeem boven individu",
    body: "Een kind staat niet los van zijn omgeving. Ouders, school en netwerk zijn onderdeel van de behandeling. We werken systeemgericht en hechtingsgericht, met ruimte voor het verhaal van iedereen.",
  },
];

export function SectionVisie() {
  return (
    <section className="relative overflow-hidden bg-forest-950 py-24 text-mist sm:py-32" aria-labelledby="visie-heading">
      <Image
        src={vuurplaats.src}
        alt={vuurplaats.alt}
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-canopy opacity-90" aria-hidden="true" />
      <div className="relative container-wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <p className="eyebrow text-mist/70">Behandelvisie</p>
            <h2 id="visie-heading" className="display-2 mt-3 text-balance text-cream">
              Vier overtuigingen waar al ons werk op rust.
            </h2>
            <p className="lede mt-6 text-mist/85">
              Onze behandeling is evidence-informed: gefundeerd in
              traumasensitief werken, hechtingstheorie, lichaamsgerichte
              therapie en ervaringsleren. Concreet, niet zweverig.
            </p>
          </div>

          <ol className="space-y-6">
            {pillars.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="grid grid-cols-[auto_1fr] gap-6 border-t border-mist/15 pt-6 first:border-t-0 first:pt-0"
              >
                <span className="font-display text-3xl text-mist/60">{`0${i + 1}`}</span>
                <div>
                  <h3 className="font-display text-2xl leading-snug text-cream">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-mist/85">{p.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
