/**
 * Datamodel voor de AgoNatura zorg-engine (fase 2).
 *
 * Vervangt de Glide + Google Sheets prototype uit het masterplan. Iedere
 * cliënt is altijd in precies één fase. Een `Traject` ontstaat uit een
 * geaccepteerde `Referral` via de actie "Doorzetten naar traject" in
 * /admin.
 *
 * Veldnamen sluiten bewust aan op de TRAJECTEN-tabel uit het masterplan
 * (camelCase intern, snake_case in webhook/export payloads — zie ook
 * src/lib/referrals/types.ts).
 */

import type { Role } from "@/lib/referrals/types";

export type TrajectFase =
  | "aanmelding"
  | "intake"
  | "observatie"
  | "besluit"
  | "behandelplan"
  | "behandeling"
  | "gesloten";

export const FASE_ORDER: TrajectFase[] = [
  "aanmelding",
  "intake",
  "observatie",
  "besluit",
  "behandelplan",
  "behandeling",
  "gesloten",
];

export const FASE_LABEL: Record<TrajectFase, string> = {
  aanmelding: "Aanmelding",
  intake: "Intake",
  observatie: "Observatieperiode",
  besluit: "GO/NO-GO besluit",
  behandelplan: "Behandelplan",
  behandeling: "In behandeling",
  gesloten: "Afgesloten",
};

export type TrajectStatus =
  | "wacht_op_actie"
  | "actief"
  | "in_afwachting"
  | "spoed"
  | "budget_overschreden"
  | "niet_geplaatst"
  | "no_go_verwijzen"
  | "no_go_wachtlijst"
  | "afgerond"
  | "gearchiveerd";

export const STATUS_LABEL_TRAJECT: Record<TrajectStatus, string> = {
  wacht_op_actie: "Wacht op actie",
  actief: "Actief",
  in_afwachting: "In afwachting",
  spoed: "Spoed",
  budget_overschreden: "Budget overschreden",
  niet_geplaatst: "Niet geplaatst",
  no_go_verwijzen: "NO-GO — verwijzen",
  no_go_wachtlijst: "NO-GO — wachtlijst",
  afgerond: "Afgerond",
  gearchiveerd: "Gearchiveerd",
};

export type Medewerker = {
  id: string;
  name: string;
  email: string;
  role: Role | "intake-coordinator" | "behandelaar";
  active: boolean;
};

export type TrajectFaseHistoryEntry = {
  id: string;
  fase: TrajectFase;
  status: TrajectStatus;
  reason?: string;
  authorName: string;
  authorEmail?: string;
  changedAt: string;
};

export type Traject = {
  id: string;
  /** Cliëntcode — overgenomen uit de referral (AGN-YYYY-XXX). */
  clientCode: string;
  /** Bron-referral. Eén traject hoort bij maximaal één referral. */
  referralId: string;

  fase: TrajectFase;
  status: TrajectStatus;
  spoed: boolean;

  /** Toewijzing — vaste behandelaar (Row Owner in de oude Glide-opzet). */
  assignedBehandelaarEmail?: string;
  /** Toewijzing — intake-coördinator. */
  assignedCoordinatorEmail?: string;

  /** Datum waarop het traject formeel start (na intake-acceptatie). */
  startdatum?: string;
  /** Verwachte einddatum (handmatig of berekend). */
  einddatum?: string;

  /** Budget — contractkader met gemeente. */
  maxUren?: number;

  /** Afsluitreden, ingevuld bij overgang naar fase 'gesloten'. */
  afsluitreden?: string;

  /** Volledige fase-overgangshistorie ten behoeve van auditbaarheid. */
  faseHistory: TrajectFaseHistoryEntry[];

  /** Beslissingen op de aanmelding (en later op vervolgfases). */
  decisions: AanmeldingDecisionRecord[];

  /** Audit-getrouwe tijdstempels. */
  createdAt: string;
  updatedAt: string;
};

export type AlertType =
  | "aanmelding_geen_actie"
  | "intake_verlopen"
  | "checkin_gemist"
  | "score_laag"
  | "week4_bespreking"
  | "week8_besluit"
  | "uren_80pct"
  | "uren_overschreden"
  | "sessie_uitgevallen"
  | "traject_open";

export const ALERT_LABEL: Record<AlertType, string> = {
  aanmelding_geen_actie: "Aanmelding — 3 dagen geen actie",
  intake_verlopen: "Intake niet afgerond binnen 7 dagen",
  checkin_gemist: "Wekelijkse check-in gemist",
  score_laag: "Lage score op observatiedoel",
  week4_bespreking: "Week 4 — tussentijdse bespreking",
  week8_besluit: "Week 8 — GO/NO-GO besluit",
  uren_80pct: "80% van urenbudget bereikt",
  uren_overschreden: "Urenbudget overschreden",
  sessie_uitgevallen: "4 weken geen sessie geregistreerd",
  traject_open: "Traject lang open zonder activiteit",
};

export type AlertPriority = "info" | "verhoogd" | "spoed";

export type EngineAlert = {
  id: string;
  trajectId: string;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  recipientEmail?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedByName?: string;
};

/* ─────────────────────────────────────────────────────────────────────────
 * Aanmeldingfase — beslissingen & notificaties
 * ──────────────────────────────────────────────────────────────────────── */

export type AanmeldingDecision =
  | "accepteren"
  | "afwijzen_risico"
  | "verwijzen_elders"
  | "wachtlijst";

export const DECISION_LABEL: Record<AanmeldingDecision, string> = {
  accepteren: "Accepteren — uitnodiging intake",
  afwijzen_risico: "Afwijzen op risicosignalen",
  verwijzen_elders: "Verwijzen naar andere zorg",
  wachtlijst: "Op wachtlijst plaatsen",
};

/**
 * Een beslissing op de aanmelding moet altijd gedragen worden door een
 * verantwoordelijke medewerker met de juiste rol. Afwijzen op
 * risicosignalen mag alleen door een gedragswetenschapper.
 */
export type AanmeldingDecisionRecord = {
  id: string;
  decision: AanmeldingDecision;
  reason: string;
  decidedByName: string;
  decidedByEmail: string;
  decidedByRole: Medewerker["role"];
  decidedAt: string;
};

export type NotificationStatus = "klaargezet" | "verzonden" | "mislukt";

export type NotificationChannel = "email";

export type NotificationKind =
  | "intake-uitnodiging-verwijzer"
  | "intake-toewijzing-behandelaar"
  | "afwijzing-verwijzer"
  | "verwijsadvies-verwijzer"
  | "wachtlijst-verwijzer";

export const NOTIFICATION_LABEL: Record<NotificationKind, string> = {
  "intake-uitnodiging-verwijzer": "Uitnodiging intake — verwijzer",
  "intake-toewijzing-behandelaar": "Intake toegewezen — behandelaar",
  "afwijzing-verwijzer": "Afwijzing aanmelding — verwijzer",
  "verwijsadvies-verwijzer": "Verwijsadvies — verwijzer",
  "wachtlijst-verwijzer": "Wachtlijstbericht — verwijzer",
};

export type EngineNotification = {
  id: string;
  trajectId: string;
  referralId: string;
  kind: NotificationKind;
  channel: NotificationChannel;
  recipientName?: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: NotificationStatus;
  createdAt: string;
  sentAt?: string;
  failureReason?: string;
};
