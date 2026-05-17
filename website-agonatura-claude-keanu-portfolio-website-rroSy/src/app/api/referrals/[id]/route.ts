import { NextResponse } from "next/server";
import { referralStore } from "@/lib/referrals/storage";
import { audit } from "@/lib/referrals/audit";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/referrals/id";
import {
  ALL_STATUSES,
  type ReferralStatus,
} from "@/lib/referrals/types";
import { sanitizeShort, sanitizeText, sanitizeEmail } from "@/lib/referrals/validation";

export const runtime = "nodejs";

/** GET /api/referrals/:id — admin only. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const referral = await referralStore().get(params.id);
  if (!referral) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ referral });
}

/**
 * PATCH /api/referrals/:id — wijzig status, toewijzing, spoed.
 * Iedere wijziging wordt opgenomen in statusHistory en in de auditlog.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const store = referralStore();
  const current = await store.get(params.id);
  if (!current) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }

  const patch: Partial<typeof current> = {};
  const history = [...current.statusHistory];

  if (typeof body.status === "string") {
    const nextStatus = body.status as ReferralStatus;
    if (!ALL_STATUSES.includes(nextStatus)) {
      return NextResponse.json({ error: "Ongeldige status." }, { status: 422 });
    }
    if (nextStatus !== current.status) {
      patch.status = nextStatus;
      history.push({
        id: generateId("his_"),
        status: nextStatus,
        authorName: session.name,
        authorRole: session.role,
        reason: sanitizeText(body.reason, 500) || undefined,
        changedAt: new Date().toISOString(),
      });
    }
  }

  if (typeof body.assignedBehandelaarEmail === "string") {
    const email = sanitizeEmail(body.assignedBehandelaarEmail);
    patch.assignedBehandelaarEmail = email || undefined;
  }
  if (typeof body.assignedCoordinatorEmail === "string") {
    const email = sanitizeEmail(body.assignedCoordinatorEmail);
    patch.assignedCoordinatorEmail = email || undefined;
  }
  if (typeof body.spoed === "boolean") {
    patch.spoed = body.spoed;
  }

  if (history.length !== current.statusHistory.length) {
    patch.statusHistory = history;
  }

  const updated = await store.update(params.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }

  await audit({
    action: "referral.status-changed",
    actor: session.name,
    role: session.role,
    referralId: params.id,
    meta: {
      status: updated.status,
      assignedTo: updated.assignedBehandelaarEmail,
      spoed: updated.spoed,
    },
  });

  // Notify webhook
  if (process.env.REFERRAL_WEBHOOK_URL && patch.status) {
    void fetch(process.env.REFERRAL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AgoNatura-Event": "referral.status-changed",
      },
      body: JSON.stringify({
        event: "referral.status-changed",
        occurredAt: new Date().toISOString(),
        referral_id: updated.id,
        client_id: updated.clientCode,
        status: updated.status,
        spoed: updated.spoed,
        assigned_behandelaar_email: updated.assignedBehandelaarEmail,
      }),
    }).catch(() => undefined);
  }

  return NextResponse.json({ referral: updated });
}
