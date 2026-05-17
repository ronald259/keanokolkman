/**
 * Notificatie-rendering en bezorgingsprotocol voor de zorg-engine.
 *
 * Voor de feedbackversie worden notificaties klaargezet (status =
 * 'klaargezet') en optioneel verstuurd naar een webhook (NOTIFICATION_WEBHOOK_URL).
 * De webbeheerder koppelt later een transactionele mailprovider (Postmark,
 * SendGrid, AWS SES) door het webhook-endpoint te implementeren.
 *
 * Privacy:
 *  - Berichten bevatten alleen cliëntcode (AGN-YYYY-XXX) en de
 *    contactgegevens van de geadresseerde. Geen voor- of achternaam van de
 *    jeugdige in de e-mailtekst.
 */

import { generateId } from "@/lib/referrals/id";
import type { Referral } from "@/lib/referrals/types";
import type {
  AanmeldingDecision,
  EngineNotification,
  Medewerker,
  NotificationKind,
  Traject,
} from "./types";

export type PreparedNotification = Omit<EngineNotification, "id" | "createdAt" | "status">;

const SIGNATURE = `\n\nMet vriendelijke groet,\nTeam AgoNatura\nhttps://www.agonatura.nl`;

const URGENCY_LABELS: Record<string, string> = {
  laag: "Laag",
  regulier: "Regulier",
  verhoogd: "Verhoogd",
  "crisis-overleg-gewenst": "Crisis-overleg gewenst",
};

function clientLine(t: Traject): string {
  return `Cliëntcode: ${t.clientCode}`;
}

function urgencyLine(r: Referral): string {
  return `Urgentie bij aanmelding: ${URGENCY_LABELS[r.risk.urgency] ?? r.risk.urgency}`;
}

export function notificationsForDecision({
  decision,
  reason,
  traject,
  referral,
  behandelaar,
  decisionBy,
}: {
  decision: AanmeldingDecision;
  reason: string;
  traject: Traject;
  referral: Referral;
  behandelaar?: Medewerker;
  decisionBy: Medewerker;
}): PreparedNotification[] {
  const out: PreparedNotification[] = [];
  const verwijzerEmail = referral.referrer?.email;
  const verwijzerName = referral.referrer?.name;

  const meta = (kind: NotificationKind, email: string, name?: string): Omit<PreparedNotification, "subject" | "body"> => ({
    trajectId: traject.id,
    referralId: referral.id,
    kind,
    channel: "email",
    recipientName: name,
    recipientEmail: email,
  });

  switch (decision) {
    case "accepteren": {
      if (verwijzerEmail) {
        out.push({
          ...meta("intake-uitnodiging-verwijzer", verwijzerEmail, verwijzerName),
          subject: `AgoNatura — Uitnodiging intake voor ${traject.clientCode}`,
          body:
            `Beste ${verwijzerName ?? "verwijzer"},\n\n` +
            `De aanmelding voor ${traject.clientCode} is inhoudelijk beoordeeld door ${decisionBy.name} (${decisionBy.role}).\n\n` +
            `We willen graag een intakegesprek inplannen. ${behandelaar ? `De toegewezen behandelaar is ${behandelaar.name} (${behandelaar.email}).` : "Toewijzing van een behandelaar volgt op korte termijn."}\n\n` +
            `Vervolgstap: we nemen binnen vijf werkdagen contact op met ouders/verzorgers voor het inplannen van de intake.\n\n` +
            `Overweging bij beoordeling:\n${reason || "—"}` +
            SIGNATURE,
        });
      }
      if (behandelaar?.email) {
        out.push({
          ...meta("intake-toewijzing-behandelaar", behandelaar.email, behandelaar.name),
          subject: `Nieuwe intake toegewezen — ${traject.clientCode}`,
          body:
            `Hoi ${behandelaar.name.split(" ")[0]},\n\n` +
            `Je bent toegewezen als behandelaar voor traject ${traject.clientCode}.\n\n` +
            `${urgencyLine(referral)}\n` +
            `${referral.spoed ? "Let op: aanmelding gemarkeerd als SPOED.\n" : ""}` +
            `\nDe volledige aanmelding staat in de admin onder dit traject. ` +
            `Plan binnen 2 weken een intake in en registreer dit in het systeem.\n\n` +
            `Beoordelingsnotitie ${decisionBy.name}:\n${reason || "—"}` +
            SIGNATURE,
        });
      }
      break;
    }

    case "afwijzen_risico": {
      if (verwijzerEmail) {
        out.push({
          ...meta("afwijzing-verwijzer", verwijzerEmail, verwijzerName),
          subject: `AgoNatura — Aanmelding ${traject.clientCode} niet passend`,
          body:
            `Beste ${verwijzerName ?? "verwijzer"},\n\n` +
            `Na inhoudelijke beoordeling door ${decisionBy.name} (gedragswetenschapper) ` +
            `is besloten dat AgoNatura voor deze jeugdige op dit moment niet de passende plek is.\n\n` +
            `Deze beoordeling is gebaseerd op risicosignalen die zwaardere of acute zorg indiceren. ` +
            `Onze setting is niet ingericht op crisis- of stabilisatie-zorg en zou daarmee onvoldoende veiligheid bieden.\n\n` +
            `Onderbouwing:\n${reason}\n\n` +
            `We adviseren een aanvraag bij specialistische GGZ of crisisdienst. ` +
            `Overleg over een passende vervolgroute is mogelijk — bel of mail ons.\n\n` +
            `${clientLine(traject)}` +
            SIGNATURE,
        });
      }
      break;
    }

    case "verwijzen_elders": {
      if (verwijzerEmail) {
        out.push({
          ...meta("verwijsadvies-verwijzer", verwijzerEmail, verwijzerName),
          subject: `AgoNatura — Verwijsadvies voor ${traject.clientCode}`,
          body:
            `Beste ${verwijzerName ?? "verwijzer"},\n\n` +
            `De aanmelding voor ${traject.clientCode} is door ${decisionBy.name} beoordeeld. ` +
            `Op basis daarvan zien wij meer passende routes elders.\n\n` +
            `Toelichting:\n${reason || "—"}\n\n` +
            `We denken graag mee bij het bepalen van een passend vervolg.` +
            SIGNATURE,
        });
      }
      break;
    }

    case "wachtlijst": {
      if (verwijzerEmail) {
        out.push({
          ...meta("wachtlijst-verwijzer", verwijzerEmail, verwijzerName),
          subject: `AgoNatura — Wachtlijstbericht ${traject.clientCode}`,
          body:
            `Beste ${verwijzerName ?? "verwijzer"},\n\n` +
            `De aanmelding voor ${traject.clientCode} past inhoudelijk. ` +
            `Op dit moment is er echter geen plek beschikbaar. We hebben de aanmelding op de wachtlijst gezet.\n\n` +
            `Toelichting:\n${reason || "—"}\n\n` +
            `Zodra er ruimte vrijkomt nemen we contact op. Bij tussentijdse veranderingen in de situatie graag een seintje.` +
            SIGNATURE,
        });
      }
      break;
    }
  }
  return out;
}

export function buildNotification(prepared: PreparedNotification): EngineNotification {
  return {
    ...prepared,
    id: generateId("ntf_"),
    status: "klaargezet",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Verstuurt een notificatie via de webhook indien geconfigureerd. Geen
 * webhook = berichten blijven status 'klaargezet' (zichtbaar in admin).
 * Werkt als best-effort: failures worden vastgelegd, blokkeren de gebruiker
 * nooit.
 */
export async function dispatchViaWebhook(notification: EngineNotification): Promise<{
  delivered: boolean;
  reason?: string;
}> {
  const url = process.env.NOTIFICATION_WEBHOOK_URL;
  if (!url) return { delivered: false, reason: "Geen NOTIFICATION_WEBHOOK_URL geconfigureerd." };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AgoNatura-Event": "notification.dispatch",
      },
      body: JSON.stringify({
        id: notification.id,
        kind: notification.kind,
        channel: notification.channel,
        recipient_email: notification.recipientEmail,
        recipient_name: notification.recipientName,
        subject: notification.subject,
        body: notification.body,
        traject_id: notification.trajectId,
        referral_id: notification.referralId,
        created_at: notification.createdAt,
      }),
    });
    if (!res.ok) return { delivered: false, reason: `HTTP ${res.status}` };
    return { delivered: true };
  } catch (err) {
    return { delivered: false, reason: err instanceof Error ? err.message : "Onbekende fout" };
  }
}
