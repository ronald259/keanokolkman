"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Eerste contact",
    body: "Ouders of verwijzers melden zich. We luisteren. We bekijken of AgoNatura inhoudelijk past — passend onderwijs en passende zorg beginnen bij eerlijkheid.",
  },
  {
    title: "Intake & observatie",
    body: "Een gedragswetenschapper en behandelaar maken samen met kind en ouders een beeld. We kijken naar gedrag, lichaam, hechting, school en context.",
  },
  {
    title: "Behandelplan",
    body: "Een werkbaar plan met concrete doelen, behandelvormen en evaluatiemomenten. Het kind wordt eigenaar van het eigen herstel.",
  },
  {
    title: "Behandeling",
    body: "Dagbehandeling op het terrein, met therapieën, ervaringsleren, ouderbegeleiding en systeemwerk. Wekelijkse afstemming met het netwerk.",
  },
  {
    title: "Evaluatie & afronding",
    body: "We evalueren met ouders, kind en verwijzer. Stap voor stap terug naar school, thuis, of vervolgzorg. Terugval is geen mislukking, maar onderdeel van herstel.",
  },
];

export function SectionTraject() {
  return (
    <section
      id="traject"
      aria-labelledby="traject-heading"
      className="relative bg-mist py-24 sm:py-32"
    >
      <div className="container-wide">
        <div className="max-w-2xl">
          <p className="eyebrow">Het traject</p>
          <h2 id="traject-heading" className="display-2 mt-3 text-balance text-moss-950">
            Een rustige route van eerste contact tot afronding.
          </h2>
          <p className="lede mt-6">
            Elk traject is anders. Maar de structuur is helder. Geen wachtlijst-mist,
            geen onduidelijke fases. Ouders en verwijzers weten in elke stap waar
            we staan.
          </p>
        </div>

        <ol className="mt-16 relative grid gap-8 md:grid-cols-5">
          <div className="pointer-events-none absolute left-3 top-3 hidden h-px w-[calc(100%-1.5rem)] bg-gradient-to-r from-moss-300/40 via-moss-400/70 to-moss-300/40 md:block" />
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-moss-400 bg-cream text-xs font-medium text-forest-800">
                  {i + 1}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-moss-700">Stap</span>
              </div>
              <h3 className="mt-4 font-display text-xl text-moss-950">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-moss-800">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
