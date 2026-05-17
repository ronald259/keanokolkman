/**
 * Datamodel voor het AgoNatura aanmeldplatform (fase 1).
 *
 * Bewust gestructureerd zodat fase 2 — koppeling met de behandelaren-app
 * (cliëntdossier, screening, intake, behandelplan) — geen breaking change
 * vraagt. Elke top-level entiteit krijgt een eigen id en kan los geëxporteerd
 * worden naar een ander systeem.
 *
 * Privacy by design:
 *  - Geen BSN-veld in dit model (zou alleen in een gecertificeerde back-end mogen).
 *  - Optionele velden zijn écht optioneel; minimale dataverwerking is uitgangspunt.
 *  - Documenten worden los van de referral opgeslagen, met metadata-only verwijzing.
 */

export type Role =
  | "admin"
  | "coordinator"
  | "behaviour-scientist"
  | "viewer";

export type ReferralRoute =
  | "ouder"
  | "verwijzer"
  | "gemeente"
  | "casusoverleg"
  | "lelystad"
  | "anders";

export type ReferralStatus =
  | "nieuw"
  | "in-beoordeling"
  | "aanvullende-informatie-gevraagd"
  | "screening-gepland"
  | "geaccepteerd"
  | "niet-passend"
  | "doorgezet-naar-behandelaren-app";

export type Urgency = "laag" | "regulier" | "verhoogd" | "crisis-overleg-gewenst";

export type Client = {
  id: string;
  /** Initialen of voornaam — geen volledige NAW zonder noodzaak. */
  givenName: string;
  familyName?: string;
  birthDate?: string; // ISO date
  pronouns?: string;
  city?: string;
  municipality?: string;
  school?: School;
};

export type ParentGuardian = {
  id: string;
  givenName: string;
  familyName?: string;
  relation: "moeder" | "vader" | "verzorger" | "voogd" | "anders";
  email?: string;
  phone?: string;
};

export type Referrer = {
  id: string;
  type:
    | "huisarts"
    | "jeugdarts"
    | "gi-jeugdbeschermer"
    | "cjg-wijkteam"
    | "jeugdconsulent"
    | "school"
    | "andere-behandelaar"
    | "anders";
  name: string;
  organisation?: string;
  email?: string;
  phone?: string;
  agbCode?: string;
};

export type Municipality = {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
};

export type School = {
  name?: string;
  type?: string;
  contactPerson?: string;
  status?: "ingeschreven" | "thuiszitter" | "geen-school" | "anders";
};

export type ProblemArea =
  | "trauma"
  | "hechting"
  | "ass"
  | "adhd"
  | "hoogbegaafdheid"
  | "angst"
  | "depressie"
  | "thuiszitten"
  | "suicidaliteit"
  | "emotieregulatie"
  | "gedragsproblemen"
  | "anders";

export type RiskSignals = {
  urgency: Urgency;
  /** Vrij invulbaar, géén suïcidedetails — beperk tot 'aanwezig / overleg gewenst'. */
  safetyConcerns?: string;
  selfHarm?: boolean;
  suicidality?: boolean;
  unsafeAtHome?: boolean;
  policeInvolvement?: boolean;
};

export type InvolvedParty =
  | "ouders-verzorgers"
  | "school"
  | "huisarts"
  | "cjg-wijkteam"
  | "jeugdconsulent"
  | "gi-voogd"
  | "andere-behandelaar";

export type UploadedDocument = {
  id: string;
  kind:
    | "verwijzing"
    | "beschikking"
    | "verslag"
    | "diagnostiek"
    | "schoolinformatie"
    | "veiligheidsplan"
    | "anders";
  filename: string; // gesaneerd
  size: number;
  mimeType: string;
  storagePath: string; // pad buiten public webroot
  uploadedAt: string;
};

export type Consent = {
  /** Toestemming voor verwerking persoonsgegevens. */
  dataProcessing: boolean;
  /** Toestemming voor contact opname. */
  contact: boolean;
  /** Toestemming voor het delen met betrokken professionals binnen het traject. */
  shareWithProfessionals: boolean;
  /** Bevestiging dat informatie naar waarheid is ingevuld. */
  truthful: boolean;
  /** Versie van de privacyverklaring waarmee akkoord is gegaan. */
  privacyPolicyVersion: string;
  /** Tijdstip van akkoord. */
  givenAt: string;
  /** Vrije naam van de persoon die toestemming gaf (digitale handtekening). */
  signedBy: string;
};

export type InternalNote = {
  id: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
};

export type StatusHistoryEntry = {
  id: string;
  status: ReferralStatus;
  authorName: string;
  authorRole: Role;
  reason?: string;
  changedAt: string;
};

export type Referral = {
  id: string;
  /**
   * Cliëntcode in formaat AGN-YYYY-XXX, conform de behandelaren-app
   * (TRAJECTEN.client_id). Wordt automatisch gegenereerd bij intake.
   */
  clientCode: string;
  route: ReferralRoute;
  status: ReferralStatus;
  /** Toewijzing aan een behandelaar — Row Owner in de behandelaren-app. */
  assignedBehandelaarEmail?: string;
  /** Toegewezen intake-coördinator. */
  assignedCoordinatorEmail?: string;
  /** Spoed-vlag conform TRAJECTEN.spoed in de behandelaren-app. */
  spoed: boolean;
  createdAt: string;
  updatedAt: string;
  client: Client;
  parents: ParentGuardian[];
  referrer?: Referrer;
  municipality?: Municipality;
  helpRequest: {
    summary: string;
    whatStuck?: string;
    triedSoFar?: string;
  };
  problemAreas: ProblemArea[];
  problemAreasOther?: string;
  risk: RiskSignals;
  involvedParties: InvolvedParty[];
  documents: UploadedDocument[];
  consent: Consent;
  notes: InternalNote[];
  statusHistory: StatusHistoryEntry[];
  /** Bron-IP gehasht voor rate limit / fraude-onderzoek; geen plain IP opslaan. */
  submissionFingerprint?: string;
};

export const ALL_STATUSES: ReferralStatus[] = [
  "nieuw",
  "in-beoordeling",
  "aanvullende-informatie-gevraagd",
  "screening-gepland",
  "geaccepteerd",
  "niet-passend",
  "doorgezet-naar-behandelaren-app",
];

export const STATUS_LABEL: Record<ReferralStatus, string> = {
  "nieuw": "Nieuw",
  "in-beoordeling": "In beoordeling",
  "aanvullende-informatie-gevraagd": "Aanvullende informatie gevraagd",
  "screening-gepland": "Screening gepland",
  "geaccepteerd": "Geaccepteerd",
  "niet-passend": "Niet passend",
  "doorgezet-naar-behandelaren-app": "Doorgezet naar behandelaren-app",
};

export const ROUTE_LABEL: Record<ReferralRoute, string> = {
  ouder: "Aanmelding door ouder",
  verwijzer: "Aanmelding door verwijzer",
  gemeente: "Aanvraag door gemeente",
  casusoverleg: "Casusoverleg",
  lelystad: "Kind woont in gemeente Lelystad — BGGZ",
  anders: "Anders",
};

export const PROBLEM_LABEL: Record<ProblemArea, string> = {
  trauma: "Trauma",
  hechting: "Hechting",
  ass: "Autisme spectrum (ASS)",
  adhd: "ADHD",
  hoogbegaafdheid: "Hoogbegaafdheid",
  angst: "Angst",
  depressie: "Depressie",
  thuiszitten: "Thuiszitten",
  suicidaliteit: "Suïcidaliteit",
  emotieregulatie: "Emotieregulatie",
  gedragsproblemen: "Gedragsproblemen",
  anders: "Anders",
};

export const INVOLVED_LABEL: Record<InvolvedParty, string> = {
  "ouders-verzorgers": "Ouders / verzorgers",
  school: "School",
  huisarts: "Huisarts",
  "cjg-wijkteam": "CJG / wijkteam",
  jeugdconsulent: "Jeugdconsulent",
  "gi-voogd": "GI / voogd",
  "andere-behandelaar": "Andere behandelaar",
};

export const PRIVACY_POLICY_VERSION = "2026-05-01";
