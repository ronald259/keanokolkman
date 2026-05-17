import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { engineStore } from "@/lib/engine/storage";
import { evaluateAlertsFor } from "@/lib/engine/alerts";
import {
  FASE_LABEL,
  FASE_ORDER,
  STATUS_LABEL_TRAJECT,
  type TrajectFase,
} from "@/lib/engine/types";

export const dynamic = "force-dynamic";

export default async function TrajectenListPage({
  searchParams,
}: {
  searchParams: { fase?: string; q?: string };
}) {
  const session = getSession();
  if (!session) redirect("/admin/login");

  const store = engineStore();
  const all = await store.listTrajecten();
  await evaluateAlertsFor(all);
  const alerts = await store.listAlerts({ unresolvedOnly: true });

  const filterFase = (FASE_ORDER as string[]).includes(searchParams.fase ?? "")
    ? (searchParams.fase as TrajectFase)
    : undefined;
  const q = (searchParams.q ?? "").trim().toLowerCase();

  const filtered = all.filter((t) => {
    if (filterFase && t.fase !== filterFase) return false;
    if (q) {
      const hay = `${t.clientCode} ${t.assignedBehandelaarEmail ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts: Partial<Record<TrajectFase, number>> = {};
  for (const t of all) counts[t.fase] = (counts[t.fase] ?? 0) + 1;
  const alertCount = alerts.length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
        {FASE_ORDER.map((f) => {
          const active = filterFase === f;
          const n = counts[f] ?? 0;
          return (
            <Link
              key={f}
              href={`/admin/trajecten?fase=${f}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                active
                  ? "border-forest-700 bg-forest-700 text-cream"
                  : "border-moss-300/70 text-moss-900 hover:border-forest-600"
              }`}
            >
              <span>{FASE_LABEL[f]}</span>
              <span className={`rounded-full px-1.5 ${active ? "bg-cream/20 text-cream" : "bg-moss-100 text-moss-700"}`}>
                {n}
              </span>
            </Link>
          );
        })}
        {filterFase && (
          <Link href="/admin/trajecten" className="text-moss-700 underline-offset-4 hover:underline">
            wis filter
          </Link>
        )}
        <span className="ml-auto rounded-full bg-clay-100 px-3 py-1 text-clay-800">
          {alertCount} openstaande alert{alertCount === 1 ? "" : "s"}
        </span>
      </div>

      <form className="card-soft mb-6 flex flex-wrap items-end gap-4" method="get">
        <label className="flex-1 min-w-[220px]">
          <span className="block text-sm font-medium text-moss-900">Zoek</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cliëntcode of behandelaar"
            className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3 outline-none ring-forest-600 focus:ring-2"
          />
        </label>
        {filterFase && <input type="hidden" name="fase" value={filterFase} />}
        <button className="btn-primary" type="submit">Filteren</button>
      </form>

      {filtered.length === 0 ? (
        <div className="card-soft text-center">
          <p className="font-display text-xl text-moss-950">Geen trajecten</p>
          <p className="mt-2 text-sm text-moss-700">
            Trajecten ontstaan zodra een aanmelding wordt doorgezet vanuit
            <Link href="/admin" className="ml-1 underline">het aanmeldingenoverzicht</Link>.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => {
            const trajectAlerts = alerts.filter((a) => a.trajectId === t.id);
            return (
              <li key={t.id}>
                <Link
                  href={`/admin/trajecten/${t.id}`}
                  className="grid gap-4 rounded-3xl border border-moss-200/70 bg-cream px-6 py-5 transition-colors hover:border-forest-600 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-display text-lg text-moss-950">
                      {t.clientCode}
                      {t.spoed && (
                        <span className="ml-2 rounded-full bg-clay-100 px-2 py-0.5 align-middle text-[11px] uppercase tracking-[0.14em] text-clay-800">
                          Spoed
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-moss-700">
                      {t.assignedBehandelaarEmail ? `Behandelaar: ${t.assignedBehandelaarEmail}` : "Nog niet toegewezen"}
                    </p>
                  </div>
                  <div>
                    <span className="rounded-full bg-moss-100 px-3 py-1 text-xs text-moss-900">
                      {FASE_LABEL[t.fase]}
                    </span>
                    <span className="ml-2 text-xs text-moss-700">{STATUS_LABEL_TRAJECT[t.status]}</span>
                  </div>
                  <div className="text-sm text-moss-700">
                    {trajectAlerts.length > 0 ? (
                      <span className="rounded-full bg-sand-200 px-2 py-0.5 text-sand-800">
                        {trajectAlerts.length} alert{trajectAlerts.length === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-moss-600">geen alerts</span>
                    )}
                  </div>
                  <div className="text-forest-700">→</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
