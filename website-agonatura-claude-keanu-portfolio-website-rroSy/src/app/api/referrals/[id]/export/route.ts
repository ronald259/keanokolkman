import { NextResponse } from "next/server";
import { referralStore } from "@/lib/referrals/storage";
import { audit } from "@/lib/referrals/audit";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/referrals/:id/export
 *
 * Levert een gestructureerde JSON-export, klaar om in te lezen door de
 * AgoNatura behandelaren-app. Veldnamen volgen de TRAJECTEN-conventies
 * uit het masterplan (snake_case voor het externe contract).
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const r = await referralStore().get(params.id);
  if (!r) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }
  await audit({
    action: "referral.exported-json",
    actor: session.name,
    role: session.role,
    referralId: params.id,
  });
  const payload = {
    schema: "agonatura.referral.v1",
    exported_at: new Date().toISOString(),
    referral: {
      id: r.id,
      client_id: r.clientCode,
      fase: "aanmelding",
      status: r.status,
      spoed: r.spoed,
      route: r.route,
      assigned_behandelaar_email: r.assignedBehandelaarEmail,
      assigned_coordinator_email: r.assignedCoordinatorEmail,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      client: {
        given_name: r.client.givenName,
        family_name: r.client.familyName,
        birth_date: r.client.birthDate,
        city: r.client.city,
        municipality: r.client.municipality,
        school: r.client.school,
      },
      parents: r.parents,
      referrer: r.referrer,
      help_request: r.helpRequest,
      problem_areas: r.problemAreas,
      problem_areas_other: r.problemAreasOther,
      involved_parties: r.involvedParties,
      risk: r.risk,
      documents: r.documents.map((d) => ({
        id: d.id,
        filename: d.filename,
        size: d.size,
        mime_type: d.mimeType,
        kind: d.kind,
        uploaded_at: d.uploadedAt,
      })),
      consent: {
        data_processing: r.consent.dataProcessing,
        contact: r.consent.contact,
        share_with_professionals: r.consent.shareWithProfessionals,
        truthful: r.consent.truthful,
        privacy_policy_version: r.consent.privacyPolicyVersion,
        signed_by: r.consent.signedBy,
        given_at: r.consent.givenAt,
      },
      status_history: r.statusHistory.map((h) => ({
        status: h.status,
        author_name: h.authorName,
        author_role: h.authorRole,
        reason: h.reason,
        changed_at: h.changedAt,
      })),
    },
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="agonatura-${r.clientCode}.json"`,
    },
  });
}
