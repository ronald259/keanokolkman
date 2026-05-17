import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { engineStore } from "@/lib/engine/storage";
import { referralStore } from "@/lib/referrals/storage";
import {
  FASE_LABEL,
  STATUS_LABEL_TRAJECT,
  DECISION_LABEL,
  NOTIFICATION_LABEL,
  ALERT_LABEL,
} from "@/lib/engine/types";
import { ROUTE_LABEL } from "@/lib/referrals/types";
import { FaseBar } from "@/components/admin/fase-bar";
import { AanmeldingDecisionPanel } from "@/components/admin/aanmelding-decision";

export const dynamic = "force-dynamic";

export default async function TrajectDetailPage({ params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) redirect("/admin/login");

  const store = engineStore();
  const t = await store.getTraject(params.id);
  if (!t) notFound();

  const referral = await referralStore().get(t.referralId);
  const medewerkers = await store.listMedewerkers();
  const notifications = await store.listNotifications({ trajectId: t.id });
  const alerts = await store.listAlerts({ trajectId: t.id, unresolvedOnly: true });

  return (
    <article className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <Link href="/admin/trajecten" className="text-sm text-moss-700 hover:text-forest-700">
          ← Terug naar trajecten
        </Link>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <h2 className="font-display text-3xl text-moss-950">{t.clientCode}</h2>
          <span className="rounded-full bg-moss-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-moss-700">
            {FASE_LABEL[t.fase]}
          </span>
          <span className="text-xs text-moss-700">{STATUS_LABEL_TRAJECT[t.status]}</span>
          {t.spoed && (
            <span className="rounded-full bg-clay-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-clay-800">
              Spoed
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-moss-700">
          Aangemaakt {new Date(t.createdAt).toLocaleString("nl-NL")} · laatst gewijzigd{" "}
          {new Date(t.updatedAt).toLocaleString("nl-NL")}
        </p>

        <div className="mt-6 rounded-3xl border border-moss-200/70 bg-cream/60 p-6">
          <p className="eyebrow">Voortgang in het traject</p>
          <div className="mt-3">
            <FaseBar current={t.fase} />
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mt-6 rounded-3xl border border-clay-200 bg-clay-50 p-6">
            <p className="eyebrow text-clay-800">Openstaande alerts</p>
            <ul className="mt-3 space-y-2 text-sm text-clay-900">
              {alerts.map((a) => (
                <li key={a.id}>
                  <strong>{ALERT_LABEL[a.type]}:</strong> {a.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Section title="Bron-aanmelding">
          {referral ? (
            <>
              <p className="text-sm text-moss-700">
                Route: {ROUTE_LABEL[referral.route]} · ontvangen{" "}
                {new Date(referral.createdAt).toLocaleString("nl-NL")}
              </p>
              <p className="mt-3 whitespace-pre-line text-moss-900">
                {referral.helpRequest.summary}
              </p>
              <Link
                href={`/admin/${referral.id}`}
                className="mt-4 inline-flex text-forest-700 underline-offset-4 hover:underline"
              >
                Volledige aanmelding bekijken →
              </Link>
            </>
          ) : (
            <p className="text-sm text-moss-700">Bron-aanmelding niet meer beschikbaar.</p>
          )}
        </Section>

        <Section title="Beslissingen">
          {t.decisions.length === 0 ? (
            <p className="text-sm text-moss-700">Nog geen beslissingen vastgelegd.</p>
          ) : (
            <ol className="space-y-3">
              {t.decisions
                .slice()
                .reverse()
                .map((d) => (
                  <li key={d.id} className="rounded-xl border border-moss-200/70 bg-cream/70 p-4 text-sm">
                    <p>
                      <strong>{DECISION_LABEL[d.decision]}</strong>
                    </p>
                    <p className="mt-1 text-moss-700">
                      {d.decidedByName} ({d.decidedByRole}) ·{" "}
                      {new Date(d.decidedAt).toLocaleString("nl-NL")}
                    </p>
                    {d.reason && <p className="mt-2 whitespace-pre-line text-moss-900">{d.reason}</p>}
                  </li>
                ))}
            </ol>
          )}
        </Section>

        <Section title="Klaargezette notificaties">
          {notifications.length === 0 ? (
            <p className="text-sm text-moss-700">
              Geen notificaties. Worden automatisch klaargezet bij een beslissing.
            </p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="rounded-xl border border-moss-200/70 bg-cream/70 p-4 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-base text-moss-950">
                      {NOTIFICATION_LABEL[n.kind]}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] ${
                        n.status === "verzonden"
                          ? "bg-forest-700 text-cream"
                          : n.status === "mislukt"
                          ? "bg-clay-100 text-clay-800"
                          : "bg-sand-200 text-sand-800"
                      }`}
                    >
                      {n.status}
                    </span>
                  </div>
                  <p className="mt-1 text-moss-700">
                    Naar: {n.recipientName ? `${n.recipientName} · ` : ""}{n.recipientEmail}
                  </p>
                  <p className="mt-2 font-medium text-moss-900">{n.subject}</p>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-3 text-xs text-moss-800">
                    {n.body}
                  </pre>
                  <p className="mt-2 text-xs text-moss-600">
                    Klaargezet {new Date(n.createdAt).toLocaleString("nl-NL")}
                    {n.sentAt ? ` · verzonden ${new Date(n.sentAt).toLocaleString("nl-NL")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Fase-geschiedenis">
          <ol className="space-y-2 text-sm">
            {t.faseHistory
              .slice()
              .reverse()
              .map((h) => (
                <li key={h.id} className="text-moss-800">
                  <strong>{FASE_LABEL[h.fase]}</strong> · {STATUS_LABEL_TRAJECT[h.status]} ·{" "}
                  {new Date(h.changedAt).toLocaleString("nl-NL")} · door {h.authorName}
                  {h.reason ? <span className="text-moss-700"> — {h.reason}</span> : null}
                </li>
              ))}
          </ol>
        </Section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        {t.fase === "aanmelding" ? (
          <AanmeldingDecisionPanel
            trajectId={t.id}
            medewerkers={medewerkers}
            defaultBehandelaarEmail={t.assignedBehandelaarEmail}
          />
        ) : (
          <div className="card-soft">
            <p className="eyebrow">Volgende fases</p>
            <p className="mt-2 text-sm text-moss-700">
              Acties voor {FASE_LABEL[t.fase]} worden in een volgende slice toegevoegd.
              Voor nu blijft het traject zichtbaar in de lijst en geschiedenis.
            </p>
          </div>
        )}

        <div className="card-soft">
          <p className="eyebrow">Toewijzing</p>
          <ul className="mt-3 space-y-1 text-sm text-moss-800">
            <li>
              Behandelaar:{" "}
              {t.assignedBehandelaarEmail ?? (
                <span className="text-moss-600">nog niet toegewezen</span>
              )}
            </li>
            <li>
              Coördinator:{" "}
              {t.assignedCoordinatorEmail ?? (
                <span className="text-moss-600">nog niet toegewezen</span>
              )}
            </li>
            <li>Startdatum: {t.startdatum ?? <span className="text-moss-600">—</span>}</li>
          </ul>
        </div>
      </aside>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-3xl border border-moss-200/70 bg-cream/60 p-6">
      <h3 className="font-display text-lg text-moss-950">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
