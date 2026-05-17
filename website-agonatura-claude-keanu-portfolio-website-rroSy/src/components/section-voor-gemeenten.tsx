import Link from "next/link";
import Image from "next/image";
import { picknicktafel } from "@/lib/images";

const points = [
  {
    label: "Voor complexe casuïstiek",
    body: "Wij werken met jeugdigen waar reguliere routes vastlopen — thuiszitters, multiproblem, hechtings- en traumaproblematiek.",
  },
  {
    label: "Voorkomt escalatie",
    body: "Een ervaringsgerichte, regulerende setting vermindert druk op acute zorg en voorkomt onnodig zware vervolgindicaties.",
  },
  {
    label: "Multidisciplinair team",
    body: "Uitsluitend gekwalificeerd personeel — waaronder SKJ-geregistreerde behandelaren — gedragswetenschappelijk aangestuurd. Diagnostiek, behandeling en ouderbegeleiding onder één dak.",
  },
  {
    label: "Helder en evalueerbaar",
    body: "Concrete doelen, transparante voortgang, korte lijnen met verwijzers en gemeentelijke toegangsteams.",
  },
];

export function SectionVoorGemeenten() {
  return (
    <section className="relative bg-mist py-24 sm:py-32" aria-labelledby="gemeenten-heading">
      <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Voor gemeenten & verwijzers</p>
          <h2 id="gemeenten-heading" className="display-2 mt-3 text-balance text-moss-950">
            Een inhoudelijke partner voor jeugdigen die nergens anders meer landen.
          </h2>
          <p className="lede mt-6">
            AgoNatura is een specialistische jeugdhulpaanbieder. We werken samen
            met lokale toegangsteams, jeugdbeschermers, huisartsen, scholen en
            GGZ-partners. Helder, samenwerkend, professioneel.
          </p>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-moss-200/70">
            <Image
              src={picknicktafel.src}
              alt={picknicktafel.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/voor-gemeenten" className="btn-primary">Samenwerking</Link>
            <Link href="/voor-verwijzers" className="btn-ghost">Voor verwijzers</Link>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {points.map((p) => (
            <li
              key={p.label}
              className="rounded-2xl border border-moss-200/70 bg-cream p-6"
            >
              <p className="font-display text-lg text-forest-800">{p.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-moss-800">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
