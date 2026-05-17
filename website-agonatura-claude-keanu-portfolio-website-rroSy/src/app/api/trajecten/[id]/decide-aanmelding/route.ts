import { NextResponse } from "next/server";
import { engineStore } from "@/lib/engine/storage";
import { referralStore } from "@/lib/referrals/storage";
import { audit } from "@/lib/referrals/audit";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/referrals/id";
import {
  type AanmeldingDecision,
  type AanmeldingDecisionRecord,
  type TrajectFase,
  type TrajectStatus,
} from "@/lib/engine/types";
import {
  buildNotification,
  dispatchViaWebhook,
  notificationsForDecision,
} from "@/lib/engine/notifications";
import { sanitizeEmail, sanitizeShort, sanitizeText } from "@/lib/referrals/validation";

export const runtime = "nodejs";

const VALID_DECISIONS: AanmeldingDecision[] = [
  "accepteren",
  "afwijzen_risico",
  "verwijzen_elders",
  "wachtlijst",
];

/**
 * POST /api/trajecten/:id/decide-aanmelding
 *
 * Legt de beslissing op de aanmelding vast en initieert vervolgstappen:
 *  - 'accepteren'      → fase → intake, uitnodiging naar verwijzer + behandelaar
 *  - 'afwijzen_risico' → fase → gesloten, afwijsbericht (alleen GD mag dit)
 *  - 'verwijzen_elders'→ fase → gesloten, verwijsadvies naar verwijzer
 *  - 'wachtlijst'      → fase blijft aanmelding, status in_afwachting
 *
 * Notificaties worden 'klaargezet' opgeslagen en — indien NOTIFICATION_WEBHOOK_URL
 * geconfigureerd is — direct verstuurd. Webbeheerder ziet altijd het volledige
 * bericht in de admin.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const decision = String(body.decision ?? "") as AanmeldingDecision;
  if (!VALID_DECISIONS.includes(decision)) {
    return NextResponse.json({ error: "Ongeldige beslissing." }, { status: 422 });
  }

  const reason = sanitizeText(body.reason, 2000);
  const decidedByEmail = sanitizeEmail(body.decidedByEmail);
  const behandelaarEmail = sanitizeEmail(body.behandelaarEmail);

  if (decision === "afwijzen_risico" && reason.trim().length < 10) {
    return NextResponse.json(
      { error: "Bij afwijzing op risicosignalen is een onderbouwing (≥10 tekens) verplicht." },
      { status: 422 },
    );
  }
  if (!decidedByEmail) {
    return NextResponse.json(
      { error: "Geef aan wie het besluit neemt (medewerker-emailadres)." },
      { status: 422 },
    );
  }

  const store = engineStore();
  const traject = await store.getTraject(params.id);
  if (!traject) {
    return NextResponse.json({ error: "Traject niet gevonden." }, { status: 404 });
  }
  if (traject.fase !== "aanmelding") {
    return NextResponse.json(
      { error: "Dit traject staat niet meer in de aanmeldingfase." },
      { status: 409 },
    );
  }

  const medewerkers = await store.listMedewerkers();
  const decisionBy = medewerkers.find((m) => m.email === decidedByEmail && m.active);
  if (!decisionBy) {
    return NextResponse.json({ error: "Beslissingnemer niet gevonden in team." }, { status: 422 });
  }
  if (decision === "afwijzen_risico" && decisionBy.role !== "behaviour-scientist") {
    return NextResponse.json(
      { error: "Afwijzen op risicosignalen mag alleen door een gedragswetenschapper." },
      { status: 403 },
    );
  }
  const behandelaar = behandelaarEmail
    ? medewerkers.find((m) => m.email === behandelaarEmail && m.active)
    : undefined;
  if (decision === "accepteren" && !behandelaar) {
    return NextResponse.json(
      { error: "Wijs bij acceptatie een behandelaar toe." },
      { status: 422 },
    );
  }

  const referral = await referralStore().get(traject.referralId);
  if (!referral) {
    return NextResponse.json({ error: "Bron-aanmelding niet meer beschikbaar." }, { status: 409 });
  }

  // Bepaal nieuwe fase + status
  let nextFase: TrajectFase = traject.fase;
  let nextStatus: TrajectStatus = traject.status;
  switch (decision) {
    case "accepteren":
      nextFase = "intake";
      nextStatus = "actief";
      break;
    case "afwijzen_risico":
      nextFase = "gesloten";
      nextStatus = "niet_geplaatst";
      break;
    case "verwijzen_elders":
      nextFase = "gesloten";
      nextStatus = "no_go_verwijzen";
      break;
    case "wachtlijst":
      nextFase = "aanmelding";
      nextStatus = "in_afwachting";
      break;
  }

  const now = new Date().toISOString();
  const decisionRecord: AanmeldingDecisionRecord = {
    id: generateId("dec_"),
    decision,
    reason,
    decidedByName: decisionBy.name,
    decidedByEmail: decisionBy.email,
    decidedByRole: decisionBy.role,
    decidedAt: now,
  };

  const updated = await store.updateTraject(traject.id, {
    fase: nextFase,
    status: nextStatus,
    assignedBehandelaarEmail: behandelaar?.email ?? traject.assignedBehandelaarEmail,
    startdatum:
      decision === "accepteren" && !traject.startdatum
        ? now.slice(0, 10)
        : traject.startdatum,
    afsluitreden: nextFase === "gesloten" ? sanitizeShort(reason) || decision : traject.afsluitreden,
    decisions: [...traject.decisions, decisionRecord],
    faseHistory: [
      ...traject.faseHistory,
      {
        id: generateId("hst_"),
        fase: nextFase,
        status: nextStatus,
        reason: `Beslissing: ${decision}. ${reason ? `Toelichting: ${reason}` : ""}`.trim(),
        authorName: decisionBy.name,
        authorEmail: decisionBy.email,
        changedAt: now,
      },
    ],
  });

  // Notificaties opbouwen + opslaan + (best-effort) versturen
  const prepared = notificationsForDecision({
    decision,
    reason,
    traject: updated!,
    referral,
    behandelaar,
    decisionBy,
  });

  for (const p of prepared) {
    const notification = await store.createNotification(buildNotification(p));
    const result = await dispatchViaWebhook(notification);
    if (result.delivered) {
      await store.markNotificationSent(notification.id);
    } else if (result.reason && !result.reason.startsWith("Geen NOTIFICATION_WEBHOOK_URL")) {
      // Webhook geconfigureerd maar gefaald — leg vast voor handmatige opvolging.
      await store.createAlert({
        id: generateId("alr_"),
        trajectId: traject.id,
        type: "traject_open",
        priority: "verhoogd",
        message: `Notificatie '${notification.kind}' kon niet verzonden worden: ${result.reason}.`,
        recipientEmail: decisionBy.email,
        createdAt: now,
      });
    }
  }

  await audit({
    action: "referral.status-changed",
    actor: session.name,
    role: session.role,
    referralId: traject.referralId,
    meta: {
      decision,
      decidedBy: decisionBy.email,
      decidedByRole: decisionBy.role,
      newFase: nextFase,
      newStatus: nextStatus,
      notificationsPrepared: prepared.length,
    },
  });

  return NextResponse.json({ traject: updated, notificationsPrepared: prepared.length });
}
