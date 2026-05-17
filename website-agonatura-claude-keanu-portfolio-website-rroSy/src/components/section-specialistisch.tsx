"use client";

import { motion } from "framer-motion";

const credentials = [
  { label: "Alleen gekwalificeerd personeel", body: "Waaronder SKJ-geregistreerde behandelaren en BIG-geregistreerde therapeuten." },
  { label: "Gedragswetenschapper", body: "Multidisciplinair team met diagnostiek." },
  { label: "PMT · EMDR · ACT", body: "Specialistische behandelvormen." },
  { label: "Trauma- en hechtingssensitief", body: "Werkkader voor elke behandelaar." },
  { label: "Systeemgericht", body: "Ouderbegeleiding maakt deel uit van het traject." },
  { label: "ISO 9001 gecertificeerd", body: "Kwaliteitsmanagement formeel geborgd." },
];

export function SectionSpecialistisch() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="kwaliteit-heading">
      <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Specialistische zorg</p>
          <h2 id="kwaliteit-heading" className="display-2 mt-3 text-balance text-moss-950">
            Geen dagbesteding. Geen zorgboerderij. Specialistische dagbehandeling.
          </h2>
          <p className="lede mt-6">
            AgoNatura is een professionele jeugdhulpaanbieder voor complexe
            casuïstiek. Onze behandeling is multidisciplinair, methodisch
            onderbouwd en transparant gemonitord.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {credentials.map((c, i) => (
            <motion.li
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              className="rounded-2xl border border-moss-200/70 bg-cream p-6"
            >
              <p className="font-display text-lg text-forest-800">{c.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-moss-800">{c.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
