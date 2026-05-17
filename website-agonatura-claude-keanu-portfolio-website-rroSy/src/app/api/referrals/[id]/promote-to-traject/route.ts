import { NextResponse } from "next/server";
import { referralStore } from "@/lib/referrals/storage";
import { audit } from "@/lib/referrals/audit";
import { getSession } from "@/lib/auth";
import { promoteReferralToTraject } from "@/lib/engine/promote";

export const runtime = "nodejs";

/**
 * POST /api/referrals/:id/promote-to-traject
 *
 * Promoot een binnengekomen aanmelding tot een Traject in fase 'aanmelding'.
 * Idempotent: roept dezelfde route nog eens aan, krijg je het bestaande
 * traject terug zonder duplicatie.
 *
 * Voor Lelystad-aanmeldingen gebeurt dit automatisch bij binnenkomst — deze
 * route blijft beschikbaar voor handmatige doorzet door de coordinator
 * voor Veluwe-aanmeldingen.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const referral = await referralStore().get(params.id);
  if (!referral) {
    return NextResponse.json({ error: "Aanmelding niet gevonden." }, { status: 404 });
  }

  const { traject, created } = await promoteReferralToTraject(referral, {
    authorName: session.name,
  });

  if (created) {
    await audit({
      action: "referral.status-changed",
      actor: session.name,
      role: session.role,
      referralId: referral.id,
      meta: { promotedTo: traject.id, clientCode: traject.clientCode },
    });
  }

  return NextResponse.json({ traject }, { status: created ? 201 : 200 });
}
