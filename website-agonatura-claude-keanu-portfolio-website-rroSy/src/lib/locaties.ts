/**
 * Aanbod per gemeente.
 *
 * AgoNatura heeft twee aanbodvormen, afhankelijk van de woongemeente van
 * het kind:
 *
 *  1. Specialistische dagbehandeling — voor de Veluwe-gemeenten. Wordt
 *     aangeboden op twee behandellocaties: Lelystad en Nunspeet. De
 *     gemeente / verwijzer kiest welke locatie passend is (reisafstand,
 *     voorkeur jeugdige, beschikbaarheid).
 *
 *  2. BGGZ gemeente Lelystad — voor jeugdigen die in gemeente Lelystad
 *     wonen. Wordt aangeboden op locatie Lelystad. Dit is het product
 *     dat in de zorg-engine wordt gepiloot.
 *
 * Let op: de fysieke behandellocatie staat los van het product. De
 * locatie Lelystad wordt zowel voor dagbehandeling als voor BGGZ
 * ingezet — wat het aanbod bepaalt is de woongemeente van het kind in
 * combinatie met het gemeentecontract.
 */

export type LocatieAanbod = {
  id: "lelystad" | "veluwe";
  /** Korte, herkenbare naam van het aanbod. */
  naam: string;
  /** Eén regel die de productpositionering samenvat. */
  ondertitel: string;
  /** Zorgkader / contractkader. */
  zorgkader: string;
  /** Korte beschrijving voor cards en hero's. */
  korteBeschrijving: string;
  /** Voor wie het aanbod is. */
  gericht_op: string[];
  /** Wat we binnen dit aanbod doen. */
  wij_doen: string[];
  /** Wat dit aanbod expliciet niet is. */
  wij_zijn_niet: string[];
  /** Woongemeenten waarvoor dit aanbod geldt. */
  gemeenten: string[];
  /** Fysieke behandellocaties waar het aanbod kan plaatsvinden. */
  behandellocaties: string[];
  /** Wizard-route die met dit aanbod gepre-set wordt. */
  aanmeldRoute: "lelystad" | "ouder" | "verwijzer" | "gemeente" | "casusoverleg";
  /** Tekst op de primaire CTA-knop. */
  aanmeldLabel: string;
};

export const LOCATIES: LocatieAanbod[] = [
  {
    id: "lelystad",
    naam: "BGGZ gemeente Lelystad",
    ondertitel: "Kortdurende BGGZ-route — enkelvoudige problematiek",
    zorgkader: "Basis GGZ (BGGZ) — contract gemeente Lelystad",
    korteBeschrijving:
      "Voor jeugdigen die in gemeente Lelystad wonen, biedt AgoNatura een specifiek BGGZ-aanbod voor enkelvoudige problematiek. Samen onderzoeken we of een kortdurende interventie passend is, of helpen we met de juiste vervolgstap.",
    gericht_op: [
      "Jeugdigen woonachtig in gemeente Lelystad.",
      "Enkelvoudige problematiek binnen de BGGZ.",
      "Vragen waarbij een kortdurende, gerichte interventie passend kan zijn — of waar eerst onderzocht moet worden welke zorg past.",
    ],
    wij_doen: [
      "Kortdurende, gerichte BGGZ-interventies in en met de natuur.",
      "Gezamenlijk inhoudelijk verkennen wat een jeugdige nodig heeft.",
      "Helpen met passende doorverwijzing naar SGGZ of een andere route, wanneer dat beter past.",
    ],
    wij_zijn_niet: [
      "Geen langlopende, complexe specialistische trajecten binnen dit BGGZ-aanbod.",
      "Geen crisis- of stabilisatiezorg.",
    ],
    gemeenten: ["Lelystad"],
    behandellocaties: ["Lelystad"],
    aanmeldRoute: "lelystad",
    aanmeldLabel: "Aanmelden gemeente Lelystad",
  },
  {
    id: "veluwe",
    naam: "Specialistische dagbehandeling",
    ondertitel: "Complexe problematiek — locatie Lelystad of Nunspeet",
    zorgkader: "Specialistische jeugdhulp — Veluwe-gemeenten",
    korteBeschrijving:
      "Voor de Veluwe-gemeenten bieden we specialistische dagbehandeling voor kinderen en jongeren met complexe problematiek. Multidisciplinair, traumasensitief en hechtingsgericht. Behandeling vindt plaats op locatie Lelystad of Nunspeet — de keuze hangt af van wat voor de jeugdige praktisch het beste past.",
    gericht_op: [
      "Jeugdigen met complexe, gestapelde problematiek.",
      "Thuiszitters en jeugdigen die vastlopen in reguliere routes.",
      "Trauma-, hechtings- en regulatieproblematiek.",
    ],
    wij_doen: [
      "Multidisciplinaire specialistische dagbehandeling op het terrein.",
      "PMT, EMDR, ACT, muziektherapie en lichaamsgericht werken.",
      "Systeemgerichte ouderbegeleiding gedurende het traject.",
    ],
    wij_zijn_niet: [
      "Geen dagbesteding of recreatieve buitenzorg.",
      "Geen acute crisiszorg.",
    ],
    gemeenten: [
      "Elburg",
      "Oldebroek",
      "Harderwijk",
      "Putten",
      "Zeewolde",
      "Nunspeet",
      "Ermelo",
    ],
    behandellocaties: ["Lelystad", "Nunspeet"],
    aanmeldRoute: "verwijzer",
    aanmeldLabel: "Aanmelden of overleggen",
  },
];

export function getLocatie(id: LocatieAanbod["id"]): LocatieAanbod {
  const found = LOCATIES.find((l) => l.id === id);
  if (!found) throw new Error(`Onbekende locatie: ${id}`);
  return found;
}

/** Unieke lijst van behandellocaties, voor algemene weergave in footer / over. */
export const ALLE_BEHANDELLOCATIES = Array.from(
  new Set(LOCATIES.flatMap((l) => l.behandellocaties)),
).sort();
