/**
 * Promoot een referral tot een traject in de zorg-engine.
 *
 * Idempotent: als er al een traject bestaat voor deze referral, geeft de
 * functie dat bestaande traject terug zonder duplicatie.
 *
 * Wordt gebruikt vanuit twee paden:
 *  - automatisch bij aanmelding via de Lelystad-route (POST /api/referrals)
 *  - handmatig via de coördinator-knop in /admin
 *      (POST /api/referrals/[id]/promote-to-traject)
 */

import { engineStore } from "./storage";
import { referralStore } from "@/lib/referrals/storage";
import { generateId } from "@/lib/referrals/id";
import type { Referral } from "@/lib/referrals/types";
import type { Traject } from "./types";

export type PromoteContext = {
  authorName: string;
  reason?: string;
};

export async function promoteReferralToTraject(
  referral: Referral,
  ctx: PromoteContext,
): Promise<{ traject: Traject; created: boolean }> {
  const engine = engineStore();
  const existing = await engine.getTrajectByReferralId(referral.id);
  if (existing) return { traject: existing, created: false };

  const now = new Date().toISOString();
  const traject: Traject = {
    id: generateId("trj_"),
    clientCode: referral.clientCode,
    referralId: referral.id,
    fase: "aanmelding",
    status: "wacht_op_actie",
    spoed: referral.spoed,
    assignedBehandelaarEmail: referral.assignedBehandelaarEmail,
    assignedCoordinatorEmail: referral.assignedCoordinatorEmail,
    decisions: [],
    faseHistory: [
      {
        id: generateId("hst_"),
        fase: "aanmelding",
        status: "wacht_op_actie",
        reason: ctx.reason ?? "Doorgezet vanuit aanmelding.",
        authorName: ctx.authorName,
        authorEmail: undefined,
        changedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const created = await engine.createTraject(traject);

  // Markeer de referral als doorgezet — sluit de loop in de aanmelddata.
  await referralStore().update(referral.id, {
    status: "doorgezet-naar-behandelaren-app",
    statusHistory: [
      ...referral.statusHistory,
      {
        id: generateId("his_"),
        status: "doorgezet-naar-behandelaren-app",
        authorName: ctx.authorName,
        authorRole: "viewer",
        reason: `Traject ${created.clientCode} aangemaakt.`,
        changedAt: now,
      },
    ],
  });

  return { traject: created, created: true };
}
