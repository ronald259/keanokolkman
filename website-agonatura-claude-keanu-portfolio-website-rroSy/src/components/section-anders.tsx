"use client";

import { motion } from "framer-motion";

const beliefs = [
  {
    title: "Sommige kinderen hebben geen strengere structuur nodig.",
    body: "Ze hebben een omgeving nodig waarin ze weer kunnen ademen. Pas dan komt ontwikkeling op gang.",
  },
  {
    title: "Gedrag is geen probleem dat onderdrukt moet worden.",
    body: "Gedrag is een signaal. Wij onderzoeken wat eronder ligt — en wat een kind nodig heeft om verder te komen.",
  },
  {
    title: "Niet ieder kind past binnen een spreekkamer.",
    body: "Voor sommigen begint herstel pas in beweging, in de natuur, in een echte relatie met een professional.",
  },
];

export function SectionAnders() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="anders-heading">
      <div className="container-wide">
        <div className="max-w-3xl">
          <p className="eyebrow">Waarom het anders werkt</p>
          <h2 id="anders-heading" className="display-2 mt-3 text-balance text-moss-950">
            De vraag is niet altijd hoe een kind binnen het systeem past.
            Soms is de vraag of het systeem nog bij dit kind past.
          </h2>
          <p className="lede mt-6">
            AgoNatura is geen alternatieve zorg. Wij zijn een inhoudelijke
            correctie op een systeem waarin kinderen vastlopen in protocollen,
            waarin gedrag centraal komt te staan in plaats van de oorzaak, en
            waarin veiligheid soms boven ontwikkeling wordt geplaatst.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {beliefs.map((b, i) => (
            <motion.article
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
              className="card-soft"
            >
              <span className="font-display text-3xl text-forest-700">{`0${i + 1}`}</span>
              <h3 className="mt-4 font-display text-xl leading-snug text-moss-950">
                {b.title}
              </h3>
              <p className="mt-3 text-moss-800">{b.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
