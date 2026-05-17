import { NextResponse } from "next/server";
import { referralStore } from "@/lib/referrals/storage";
import { audit } from "@/lib/referrals/audit";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/referrals/id";
import { sanitizeText } from "@/lib/referrals/validation";
import type { InternalNote } from "@/lib/referrals/types";

export const runtime = "nodejs";

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
  const content = sanitizeText(body.content, 4000);
  if (!content) {
    return NextResponse.json({ error: "Lege notitie." }, { status: 422 });
  }
  const store = referralStore();
  const current = await store.get(params.id);
  if (!current) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }
  const note: InternalNote = {
    id: generateId("not_"),
    authorName: session.name,
    authorRole: session.role,
    content,
    createdAt: new Date().toISOString(),
  };
  const updated = await store.update(params.id, { notes: [...current.notes, note] });

  await audit({
    action: "referral.note-added",
    actor: session.name,
    role: session.role,
    referralId: params.id,
  });

  return NextResponse.json({ note, referral: updated });
}
