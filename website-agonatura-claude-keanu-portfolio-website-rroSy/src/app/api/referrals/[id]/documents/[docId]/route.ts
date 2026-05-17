import { NextResponse } from "next/server";
import { referralStore } from "@/lib/referrals/storage";
import { audit } from "@/lib/referrals/audit";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; docId: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const store = referralStore();
  const referral = await store.get(params.id);
  if (!referral) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }
  const doc = referral.documents.find((d) => d.id === params.docId);
  if (!doc) {
    return NextResponse.json({ error: "Document niet gevonden." }, { status: 404 });
  }

  try {
    const bytes = await store.readDocument(doc.storagePath);
    await audit({
      action: "referral.document-downloaded",
      actor: session.name,
      role: session.role,
      referralId: params.id,
      meta: { docId: doc.id },
    });
    const body = new Blob([new Uint8Array(bytes)], { type: doc.mimeType });
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${doc.filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Document kon niet worden geladen." },
      { status: 500 },
    );
  }
}
