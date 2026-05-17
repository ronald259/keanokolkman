import { NextResponse } from "next/server";
import { referralStore } from "@/lib/referrals/storage";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_FILE_BYTES,
  ValidationError,
  assertMimeAllowed,
  sanitizeDate,
  sanitizeEmail,
  sanitizeFilename,
  sanitizePhone,
  sanitizeShort,
  sanitizeText,
  toBool,
  toInvolved,
  toProblemAreas,
  toRoute,
  toUrgency,
  validateRequiredFields,
} from "@/lib/referrals/validation";
import { generateClientCode, generateId, fingerprintIp } from "@/lib/referrals/id";
import { audit } from "@/lib/referrals/audit";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  PRIVACY_POLICY_VERSION,
  type Referral,
  type UploadedDocument,
} from "@/lib/referrals/types";
import { getSession } from "@/lib/auth";
import { promoteReferralToTraject } from "@/lib/engine/promote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/referrals
 *
 * Anonieme aanmelding via het publieke intakeformulier. Verwacht
 * multipart/form-data zodat documentuploads atomair worden meegegeven.
 * Server-side validatie, sanitization, MIME/size-checks en rate-limit.
 */
export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const fingerprint = fingerprintIp(ip);
  const rl = rateLimit(`referrals:${fingerprint}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Te veel aanmeldingen vanaf dit netwerk. Probeer het later opnieuw." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json(
      { error: "Verwacht multipart/form-data." },
      { status: 415 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  // Honeypot
  if (sanitizeShort(form.get("website"))) {
    return NextResponse.json({ ok: true });
  }

  const route = toRoute(form.get("route"));
  const givenName = sanitizeShort(form.get("clientGivenName"));
  const familyName = sanitizeShort(form.get("clientFamilyName"));
  const birthDate = sanitizeDate(form.get("clientBirthDate"));
  const city = sanitizeShort(form.get("clientCity"));
  const municipalityName = sanitizeShort(form.get("municipalityName"));
  const schoolName = sanitizeShort(form.get("schoolName"));
  const schoolStatus = sanitizeShort(form.get("schoolStatus"));

  const helpSummary = sanitizeText(form.get("helpSummary"), 2000);
  const whatStuck = sanitizeText(form.get("whatStuck"), 2000);
  const triedSoFar = sanitizeText(form.get("triedSoFar"), 2000);
  const urgency = toUrgency(form.get("urgency"));
  const safetyConcerns = sanitizeText(form.get("safetyConcerns"), 1000);

  const problemAreas = toProblemAreas(form.getAll("problemAreas"));
  const problemAreasOther = sanitizeShort(form.get("problemAreasOther"));

  const involvedParties = toInvolved(form.getAll("involvedParties"));

  // Parents
  const parents = [];
  for (let i = 0; i < 2; i++) {
    const gn = sanitizeShort(form.get(`parent${i}GivenName`));
    if (!gn) continue;
    parents.push({
      id: generateId("par_"),
      givenName: gn,
      familyName: sanitizeShort(form.get(`parent${i}FamilyName`)),
      relation: (sanitizeShort(form.get(`parent${i}Relation`)) ||
        "anders") as "moeder" | "vader" | "verzorger" | "voogd" | "anders",
      email: sanitizeEmail(form.get(`parent${i}Email`)) || undefined,
      phone: sanitizePhone(form.get(`parent${i}Phone`)) || undefined,
    });
  }

  // Referrer
  const referrerType = sanitizeShort(form.get("referrerType"));
  const referrerName = sanitizeShort(form.get("referrerName"));
  const referrer = referrerName
    ? {
        id: generateId("ref_"),
        type: (referrerType || "anders") as
          | "huisarts"
          | "jeugdarts"
          | "gi-jeugdbeschermer"
          | "cjg-wijkteam"
          | "jeugdconsulent"
          | "school"
          | "andere-behandelaar"
          | "anders",
        name: referrerName,
        organisation: sanitizeShort(form.get("referrerOrganisation")) || undefined,
        email: sanitizeEmail(form.get("referrerEmail")) || undefined,
        phone: sanitizePhone(form.get("referrerPhone")) || undefined,
        agbCode: sanitizeShort(form.get("referrerAgbCode")) || undefined,
      }
    : undefined;

  // Consent
  const consentData = toBool(form.get("consentDataProcessing"));
  const consentContact = toBool(form.get("consentContact"));
  const consentShare = toBool(form.get("consentShareWithProfessionals"));
  const consentTruthful = toBool(form.get("consentTruthful"));
  const signedBy = sanitizeShort(form.get("signedBy"));

  try {
    validateRequiredFields({
      route,
      givenName,
      helpSummary,
      consentDataProcessing: consentData,
      consentContact,
      consentTruthful,
      signedBy,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.issues.join(" ") }, { status: 422 });
    }
    throw err;
  }

  // Files
  const fileEntries = form.getAll("documents");
  if (fileEntries.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Maximaal ${MAX_FILES} bijlagen toegestaan.` },
      { status: 422 },
    );
  }
  const stagedDocs: Array<{ doc: UploadedDocument; bytes: Uint8Array }> = [];
  let totalBytes = 0;
  for (const entry of fileEntries) {
    if (!(entry instanceof File)) continue;
    if (entry.size === 0) continue;
    if (entry.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Bestand '${entry.name}' is groter dan ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB.` },
        { status: 413 },
      );
    }
    totalBytes += entry.size;
    if (totalBytes > MAX_TOTAL_FILE_BYTES) {
      return NextResponse.json(
        { error: "Totale uploadgrootte overschrijdt de limiet." },
        { status: 413 },
      );
    }
    try {
      assertMimeAllowed(entry.type, entry.name);
      const cleanName = sanitizeFilename(entry.name);
      const docId = generateId("doc_");
      const bytes = new Uint8Array(await entry.arrayBuffer());
      stagedDocs.push({
        doc: {
          id: docId,
          kind: "anders",
          filename: cleanName,
          size: entry.size,
          mimeType: entry.type as (typeof ALLOWED_MIME_TYPES)[number],
          storagePath: "", // wordt na opslag gezet
          uploadedAt: new Date().toISOString(),
        },
        bytes,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        return NextResponse.json({ error: err.issues.join(" ") }, { status: 422 });
      }
      throw err;
    }
  }

  const id = generateId("ref_");
  const store = referralStore();

  // Persist documents
  const documents: UploadedDocument[] = [];
  for (const { doc, bytes } of stagedDocs) {
    const storagePath = await store.saveDocument(id, doc.id, bytes);
    documents.push({ ...doc, storagePath });
  }

  const now = new Date().toISOString();
  const referral: Referral = {
    id,
    clientCode: generateClientCode(),
    route,
    status: "nieuw",
    spoed: urgency === "verhoogd" || urgency === "crisis-overleg-gewenst",
    createdAt: now,
    updatedAt: now,
    client: {
      id: generateId("cli_"),
      givenName,
      familyName: familyName || undefined,
      birthDate,
      city: city || undefined,
      municipality: municipalityName || undefined,
      school:
        schoolName || schoolStatus
          ? {
              name: schoolName || undefined,
              status: (schoolStatus || undefined) as
                | "ingeschreven"
                | "thuiszitter"
                | "geen-school"
                | "anders"
                | undefined,
            }
          : undefined,
    },
    parents,
    referrer,
    municipality: municipalityName ? { name: municipalityName } : undefined,
    helpRequest: {
      summary: helpSummary,
      whatStuck: whatStuck || undefined,
      triedSoFar: triedSoFar || undefined,
    },
    problemAreas,
    problemAreasOther: problemAreasOther || undefined,
    risk: {
      urgency,
      safetyConcerns: safetyConcerns || undefined,
      selfHarm: toBool(form.get("selfHarm")),
      suicidality: toBool(form.get("suicidality")),
      unsafeAtHome: toBool(form.get("unsafeAtHome")),
      policeInvolvement: toBool(form.get("policeInvolvement")),
    },
    involvedParties,
    documents,
    consent: {
      dataProcessing: consentData,
      contact: consentContact,
      shareWithProfessionals: consentShare,
      truthful: consentTruthful,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      givenAt: now,
      signedBy,
    },
    notes: [],
    statusHistory: [
      {
        id: generateId("his_"),
        status: "nieuw",
        authorName: signedBy,
        authorRole: "viewer",
        changedAt: now,
        reason: "Aanmelding via website.",
      },
    ],
    submissionFingerprint: fingerprint,
  };

  await store.create(referral);
  await audit({
    action: "referral.created",
    actor: "anonymous",
    referralId: id,
    meta: { route, urgency, documents: documents.length },
  });

  // Optionele webhook naar de behandelaren-app (Glide / Google Apps Script / n8n).
  if (process.env.REFERRAL_WEBHOOK_URL) {
    void notifyWebhook(referral).catch(() => {
      // Stille catch — webhook-falen mag de gebruiker nooit blokkeren.
    });
  }

  /**
   * Pilotfase: Lelystad-aanmeldingen worden direct in de zorg-engine
   * gezet zodat de GD/coordinator daar werkt. Veluwe-aanmeldingen blijven
   * voorlopig in /admin tot de coordinator ze handmatig doorzet.
   */
  let trajectId: string | undefined;
  if (referral.route === "lelystad") {
    try {
      const { traject } = await promoteReferralToTraject(referral, {
        authorName: "Aanmeldsysteem (Lelystad-route)",
        reason: "Automatisch aangemaakt vanuit Lelystad-aanmeldroute (pilotfase).",
      });
      trajectId = traject.id;
      await audit({
        action: "referral.status-changed",
        actor: "system",
        referralId: id,
        meta: { autoPromoted: true, trajectId: traject.id, route: "lelystad" },
      });
    } catch (err) {
      // Falen mag de aanmelding niet blokkeren — coördinator kan altijd
      // handmatig alsnog doorzetten via /admin.
      await audit({
        action: "referral.status-changed",
        actor: "system",
        referralId: id,
        meta: {
          autoPromoteFailed: true,
          reason: err instanceof Error ? err.message : "unknown",
        },
      });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      id,
      clientCode: referral.clientCode,
      status: referral.status,
      trajectId,
      route: referral.route,
    },
    { status: 201 },
  );
}

/**
 * GET /api/referrals — adminroute. Vereist sessie.
 */
export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const all = await referralStore().list();
  return NextResponse.json({
    referrals: all.map((r) => ({
      id: r.id,
      clientCode: r.clientCode,
      route: r.route,
      status: r.status,
      spoed: r.spoed,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      clientGivenName: r.client.givenName,
      clientFamilyName: r.client.familyName,
      municipality: r.client.municipality,
      assignedBehandelaarEmail: r.assignedBehandelaarEmail,
    })),
  });
}

async function notifyWebhook(referral: Referral): Promise<void> {
  const payload = buildWebhookPayload(referral);
  await fetch(process.env.REFERRAL_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AgoNatura-Event": "referral.created",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Payload-vorm afgestemd op TRAJECTEN / Formulierreacties 1 in de
 * AgoNatura behandelaren-app (Glide + Google Sheets). Houd dit veld-
 * mapping consistent — de receiver verwacht deze keys.
 */
function buildWebhookPayload(r: Referral) {
  return {
    event: "referral.created",
    occurredAt: new Date().toISOString(),
    referral: {
      id: r.id,
      client_id: r.clientCode,
      route: r.route,
      status: r.status,
      fase: "aanmelding",
      spoed: r.spoed,
      urgency: r.risk.urgency,
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
      consent: {
        data_processing: r.consent.dataProcessing,
        contact: r.consent.contact,
        share_with_professionals: r.consent.shareWithProfessionals,
        truthful: r.consent.truthful,
        privacy_policy_version: r.consent.privacyPolicyVersion,
        signed_by: r.consent.signedBy,
        given_at: r.consent.givenAt,
      },
      documents: r.documents.map((d) => ({
        id: d.id,
        kind: d.kind,
        filename: d.filename,
        size: d.size,
        mime_type: d.mimeType,
      })),
      created_at: r.createdAt,
    },
  };
}
