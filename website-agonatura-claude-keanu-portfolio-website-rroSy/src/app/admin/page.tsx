import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { referralStore } from "@/lib/referrals/storage";
import {
  STATUS_LABEL,
  ROUTE_LABEL,
  ALL_STATUSES,
  type ReferralStatus,
  type ReferralRoute,
} from "@/lib/referrals/types";

export const dynamic = "force-dynamic";

export default async function AdminListPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const session = getSession();
  if (!session) redirect("/admin/login");

  const all = await referralStore().list();
  const filterStatus = (
    (ALL_STATUSES as string[]).includes(searchParams.status ?? "")
      ? (searchParams.status as ReferralStatus)
      : undefined
  );
  const q = (searchParams.q ?? "").trim().toLowerCase();

  const filtered = all.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (q) {
      const hay = `${r.clientCode} ${r.client.givenName} ${r.client.familyName ?? ""} ${r.client.municipality ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <div className="mb-6 rounded-3xl border border-forest-700/30 bg-forest-700/5 p-5 text-sm text-moss-900">
        <p className="font-display text-base text-forest-800">
          Pilotfase: BGGZ-aanbod gemeente Lelystad gebruikt de zorg-engine
        </p>
        <p className="mt-1">
          Aanmeldingen voor jeugdigen woonachtig in <strong>gemeente Lelystad</strong> worden direct
          als traject in de engine geplaatst — zichtbaar onder{" "}
          <Link href="/admin/trajecten" className="underline underline-offset-4 hover:text-forest-700">Trajecten</Link>.
          Aanmeldingen vanuit de Veluwe-gemeenten blijven hier en worden handmatig doorgezet
          zodra zij ook overgaan op de engine.
        </p>
      </div>

      <form className="card-soft mb-8 flex flex-wrap items-end gap-4" method="get">
        <label className="flex-1 min-w-[220px]">
          <span className="block text-sm font-medium text-moss-900">Zoek</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Naam, cliëntcode, gemeente…"
            className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3 outline-none ring-forest-600 focus:ring-2"
          />
        </label>
        <label>
          <span className="block text-sm font-medium text-moss-900">Status</span>
          <select
            name="status"
            defaultValue={filterStatus ?? ""}
            className="mt-2 rounded-2xl border border-moss-300/70 bg-cream px-4 py-3 outline-none"
          >
            <option value="">Alle statussen</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary" type="submit">Filteren</button>
        <p className="ml-auto text-sm text-moss-700">
          {filtered.length} van {all.length} aanmeldingen
        </p>
      </form>

      {filtered.length === 0 ? (
        <div className="card-soft text-center">
          <p className="font-display text-xl text-moss-950">Geen aanmeldingen</p>
          <p className="mt-2 text-sm text-moss-700">
            Zodra er via de website wordt aangemeld, verschijnt het hier.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/${r.id}`}
                className="grid gap-4 rounded-3xl border border-moss-200/70 bg-cream px-6 py-5 transition-colors hover:border-forest-600 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-display text-lg text-moss-950">
                    {r.client.givenName}{" "}
                    {r.client.familyName ? r.client.familyName[0] + "." : ""}{" "}
                    <span className="ml-2 rounded-full bg-moss-100 px-2 py-0.5 align-middle text-[11px] uppercase tracking-[0.16em] text-moss-700">
                      {r.clientCode}
                    </span>
                  </p>
                  <p className="text-sm text-moss-700">
                    {ROUTE_LABEL[r.route as ReferralRoute]}{r.client.municipality ? ` · ${r.client.municipality}` : ""}
                  </p>
                </div>
                <div>
                  <StatusBadge status={r.status} />
                  {r.spoed && (
                    <span className="ml-2 rounded-full bg-clay-100 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-clay-800">
                      Spoed
                    </span>
                  )}
                </div>
                <div className="text-sm text-moss-700">
                  Ontvangen{" "}
                  <time dateTime={r.createdAt}>
                    {new Date(r.createdAt).toLocaleDateString("nl-NL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <div className="text-forest-700">→</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  const tone =
    status === "nieuw"
      ? "bg-sand-200 text-sand-800"
      : status === "geaccepteerd" || status === "doorgezet-naar-behandelaren-app"
      ? "bg-forest-700 text-cream"
      : status === "niet-passend"
      ? "bg-clay-100 text-clay-800"
      : "bg-moss-100 text-moss-900";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
