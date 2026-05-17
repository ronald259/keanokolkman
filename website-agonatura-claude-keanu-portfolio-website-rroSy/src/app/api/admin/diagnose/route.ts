import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { referralStore, referralStorageBackend } from "@/lib/referrals/storage";
import { engineStore, engineStorageBackend } from "@/lib/engine/storage";
import { readAudit } from "@/lib/referrals/audit";
import { kvAvailable } from "@/lib/storage/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/diagnose
 *
 * Admin-only. Geeft een snelle systeemstatus zonder gevoelige inhoud:
 *  - aantallen referrals (totaal + per route)
 *  - aantallen trajecten (totaal + per fase)
 *  - per Lelystad-referral: heeft die een gekoppeld traject?
 *  - laatste 25 auditregels (alleen actie, actor, referenties — geen inhoud)
 *
 * Bedoeld om snel te kunnen valideren dat de auto-promote naar de zorg-
 * engine werkt na een testaanmelding op Vercel.
 */
export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const referrals = await referralStore().list();
  const trajecten = await engineStore().listTrajecten();
  const audit = await readAudit(25);

  const referralsByRoute: Record<string, number> = {};
  for (const r of referrals) {
    referralsByRoute[r.route] = (referralsByRoute[r.route] ?? 0) + 1;
  }
  const trajectenByFase: Record<string, number> = {};
  for (const t of trajecten) {
    trajectenByFase[t.fase] = (trajectenByFase[t.fase] ?? 0) + 1;
  }

  // Per Lelystad-referral: gekoppeld traject?
  const lelystadStatus = referrals
    .filter((r) => r.route === "lelystad")
    .map((r) => {
      const traject = trajecten.find((t) => t.referralId === r.id);
      return {
        clientCode: r.clientCode,
        createdAt: r.createdAt,
        referralStatus: r.status,
        hasTraject: !!traject,
        trajectId: traject?.id,
        trajectFase: traject?.fase,
        trajectStatus: traject?.status,
      };
    });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    counts: {
      referrals: referrals.length,
      referralsByRoute,
      trajecten: trajecten.length,
      trajectenByFase,
    },
    lelystadStatus,
    recentAudit: audit.map((a) => ({
      ts: a.ts,
      action: a.action,
      actor: a.actor,
      referralId: a.referralId,
      meta: a.meta,
    })),
    storage: {
      kvAvailable: kvAvailable(),
      referralBackend: referralStorageBackend(),
      engineBackend: engineStorageBackend(),
      dataDir: process.env.AGONATURA_DATA_DIR
        ? "AGONATURA_DATA_DIR (custom)"
        : process.env.VERCEL
        ? "/tmp/agonatura-data (Vercel — ephemeral!)"
        : ".data (lokaal)",
      note: kvAvailable()
        ? "Upstash KV actief — data persistent over function instances en deploys."
        : process.env.VERCEL
        ? "GEEN KV gekoppeld. Op Vercel is /tmp ephemeral: data is per-instance en kan verloren gaan. Activeer Vercel Storage > Upstash voor productie."
        : undefined,
    },
  });
}
