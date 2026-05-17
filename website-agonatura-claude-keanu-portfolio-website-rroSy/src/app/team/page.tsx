import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { SectionCTA } from "@/components/section-cta";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Het multidisciplinaire team van AgoNatura: gedragswetenschappers, behandelaren (waaronder SKJ-geregistreerd), therapeuten en ervaringsgerichte begeleiders.",
};

const roles = [
  {
    role: "Gedragswetenschapper",
    body: "Verantwoordelijk voor diagnostiek, behandelplan en de inhoudelijke lijn binnen elk traject.",
  },
  {
    role: "Behandelaars",
    body: "De vaste behandelaren op het terrein, waaronder SKJ-geregistreerde collega's. Trauma-, hechtings- en lichaamsgericht geschoold.",
  },
  {
    role: "PMT-therapeut",
    body: "Lichaamsgerichte therapie voor regulatie, zelfbeeld en omgaan met spanning.",
  },
  {
    role: "EMDR-therapeut",
    body: "Traumaverwerking volgens richtlijn, ingezet binnen voldoende veiligheid.",
  },
  {
    role: "Muziektherapeut",
    body: "Muziek als ingang voor verbinding, expressie en regulatie.",
  },
  {
    role: "Ervaringsgerichte begeleiders",
    body: "Specialisten in natuur, beweging en ervaringsleren — getraind in pedagogisch en behandelend werken.",
  },
  {
    role: "Systeemtherapeutisch werker",
    body: "Ouder- en systeembegeleiding als integraal onderdeel van elk traject.",
  },
  {
    role: "Coördinatie & kwaliteit",
    body: "Korte lijnen met verwijzers, gemeenten en netwerk. Methodische monitoring.",
  },
];

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Team"
        title="Een klein, vast team waar kinderen écht een gezicht bij houden."
        intro="Bij AgoNatura werken professionals die hun vak verstaan én die hun rol kennen in de relatie met een kind. Geen wisselende invalkrachten, geen anonieme caseload."
      />

      <section className="container-wide py-20 sm:py-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <li key={r.role} className="card-soft">
              <p className="eyebrow">Rol</p>
              <h3 className="mt-3 font-display text-xl text-moss-950">{r.role}</h3>
              <p className="mt-3 text-sm leading-relaxed text-moss-800">{r.body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-2xl text-moss-700">
          Persoonlijke profielen volgen zodra het team volledig is samengesteld
          en alle medewerkers akkoord hebben gegeven op publicatie.
        </p>
      </section>

      <SectionCTA />
    </>
  );
}
