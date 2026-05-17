/**
 * Alert-logica voor de zorg-engine.
 *
 * Wordt aangeroepen vanuit de admin lijst-pagina (lazy evaluation): bij elk
 * bezoek aan /admin/trajecten worden de actieve trajecten gescand op
 * voorwaardes die een nieuwe alert opleveren. Bestaande, onopgeloste alerts
 * van hetzelfde type worden niet gedupliceerd.
 *
 * Voor productie kan dit worden vervangen door een echte cron / scheduled
 * task in plaats van bij elke pageview. De logica blijft dezelfde.
 */

import { engineStore } from "./storage";
import { generateId } from "@/lib/referrals/id";
import type { Traject, AlertType, EngineAlert } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

/**
 * Loopt alle openstaande trajecten af en maakt waar nodig nieuwe alerts aan.
 * Idempotent: een alert van hetzelfde type op hetzelfde traject wordt niet
 * dubbel aangemaakt zolang de vorige nog niet is opgelost.
 */
export async function evaluateAlertsFor(trajecten: Traject[]): Promise<EngineAlert[]> {
  const store = engineStore();
  const existing = await store.listAlerts({ unresolvedOnly: true });
  const created: EngineAlert[] = [];

  for (const t of trajecten) {
    const issuesForTraject = await detectIssues(t, existing);
    for (const issue of issuesForTraject) {
      const dupe = existing.some(
        (a) => a.trajectId === t.id && a.type === issue.type,
      );
      if (dupe) continue;
      const alert: EngineAlert = {
        id: generateId("alr_"),
        trajectId: t.id,
        type: issue.type,
        priority: issue.priority,
        message: issue.message,
        recipientEmail: issue.recipientEmail,
        createdAt: new Date().toISOString(),
      };
      created.push(await store.createAlert(alert));
    }
  }

  return created;
}

type DetectedIssue = {
  type: AlertType;
  priority: EngineAlert["priority"];
  message: string;
  recipientEmail?: string;
};

async function detectIssues(t: Traject, _existing: EngineAlert[]): Promise<DetectedIssue[]> {
  const issues: DetectedIssue[] = [];

  // Fase 1 — aanmelding: 3 dagen geen actie + status wacht op actie.
  if (t.fase === "aanmelding" && t.status === "wacht_op_actie") {
    if (daysSince(t.createdAt) >= 3) {
      issues.push({
        type: "aanmelding_geen_actie",
        priority: "verhoogd",
        message:
          "Deze aanmelding staat al 3+ dagen op 'wacht op actie'. Wijs een behandelaar toe of leg het besluit vast.",
        recipientEmail: t.assignedCoordinatorEmail,
      });
    }
  }

  // Fase 2 — intake: niet afgerond na 7 dagen.
  if (t.fase === "intake" && daysSince(t.updatedAt) >= 7) {
    issues.push({
      type: "intake_verlopen",
      priority: "verhoogd",
      message: "Intake-fase loopt al 7+ dagen. Status updaten of overgaan naar observatie.",
      recipientEmail: t.assignedBehandelaarEmail ?? t.assignedCoordinatorEmail,
    });
  }

  return issues;
}
