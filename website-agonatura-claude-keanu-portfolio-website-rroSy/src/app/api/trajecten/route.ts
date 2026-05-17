import { NextResponse } from "next/server";
import { engineStore } from "@/lib/engine/storage";
import { evaluateAlertsFor } from "@/lib/engine/alerts";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const store = engineStore();
  const trajecten = await store.listTrajecten();
  // Lazy alert-evaluatie. Voor productie: vervang door scheduled job.
  await evaluateAlertsFor(trajecten);
  const alerts = await store.listAlerts({ unresolvedOnly: true });
  return NextResponse.json({ trajecten, alerts });
}
