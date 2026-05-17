import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { referralStore } from "@/lib/referrals/storage";
import {
  STATUS_LABEL,
  ROUTE_LABEL,
  PROBLEM_LABEL,
  INVOLVED_LABEL,
  ALL_STATUSES,
} from "@/lib/referrals/types";
import { AdminActions } from "@/components/admin/admin-actions";
import { PromoteToTrajectButton } from "@/components/admin/promote-button";
import { engineStore } from "@/lib/engine/storage";

export const dynamic = "force-dynamic";

export default async function AdminDetailPage({ params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) redirect("/admin/login");

  const referral = await referralStore().get(params.id);
  if (!referral) notFound();

  const linkedTraject = await engineStore().getTrajectByReferralId(referral.id);

  return (
    <article className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <Link href="/admin" className="text-sm text-moss-700 hover:text-forest-700">
          ← Terug naar overzicht
        </Link>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <h2 className="font-display text-3xl text-moss-950">
            {referral.client.givenName} {referral.client.familyName}
          </h2>
          <span className="rounded-full bg-moss-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-moss-700">
            {referral.clientCode}
          </span>
          {referral.spoed && (
            <span className="rounded-full bg-clay-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-clay-800">
              Spoed
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-moss-700">
          {ROUTE_LABEL[referral.route]} · ontvangen{" "}
          {new Date(referral.createdAt).toLocaleString("nl-NL")}
        </p>

        <Section title="Cliënt">
          <KV k="Voornaam" v={referral.client.givenName} />
          <KV k="Achternaam" v={referral.client.familyName ?? "—"} />
          <KV k="Geboortedatum" v={referral.client.birthDate ?? "—"} />
          <KV k="Woonplaats" v={referral.client.city ?? "—"} />
          <KV k="Gemeente" v={referral.client.municipality ?? "—"} />
          <KV k="School" v={referral.client.school?.name ?? "—"} />
          <KV k="Schoolsituatie" v={referral.client.school?.status ?? "—"} />
        </Section>

        <Section title="Ouders / verzorgers">
          {referral.parents.length === 0 ? (
            <p className="text-sm text-moss-700">Geen contactpersonen opgegeven.</p>
          ) : (
            <ul className="space-y-3">
              {referral.parents.map((p) => (
                <li key={p.id} className="rounded-xl border border-moss-200/70 bg-cream/60 p-4">
                  <p className="font-display text-base text-moss-950">
                    {p.givenName} {p.familyName} · {p.relation}
                  </p>
                  <p className="text-sm text-moss-700">
                    {p.email ?? "geen e-mail"} · {p.phone ?? "geen telefoon"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {referral.referrer && (
          <Section title="Verwijzer / aanmelder">
            <KV k="Type" v={referral.referrer.type} />
            <KV k="Naam" v={referral.referrer.name} />
            <KV k="Organisatie" v={referral.referrer.organisation ?? "—"} />
            <KV k="E-mail" v={referral.referrer.email ?? "—"} />
            <KV k="Telefoon" v={referral.referrer.phone ?? "—"} />
            <KV k="AGB-code" v={referral.referrer.agbCode ?? "—"} />
          </Section>
        )}

        <Section title="Hulpvraag">
          <p className="whitespace-pre-line text-moss-900">{referral.helpRequest.summary}</p>
          {referral.helpRequest.whatStuck && (
            <>
              <p className="mt-4 eyebrow">Wat loopt vast</p>
              <p className="whitespace-pre-line text-moss-900">{referral.helpRequest.whatStuck}</p>
            </>
          )}
          {referral.helpRequest.triedSoFar && (
            <>
              <p className="mt-4 eyebrow">Wat is al geprobeerd</p>
              <p className="whitespace-pre-line text-moss-900">{referral.helpRequest.triedSoFar}</p>
            </>
          )}
        </Section>

        <Section title="Problematiek">
          <p className="text-moss-900">
            {referral.problemAreas.map((p) => PROBLEM_LABEL[p]).join(", ") || "—"}
            {referral.problemAreasOther ? ` · Anders: ${referral.problemAreasOther}` : ""}
          </p>
        </Section>

        <Section title="Risico- en veiligheidssignalen">
          <KV k="Urgentie" v={referral.risk.urgency} />
          <KV k="Toelichting" v={referral.risk.safetyConcerns ?? "—"} />
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
            <li>Zelfbeschadiging: {referral.risk.selfHarm ? "ja" : "nee"}</li>
            <li>Suïcidaliteit: {referral.risk.suicidality ? "ja" : "nee"}</li>
            <li>Onveiligheid thuis: {referral.risk.unsafeAtHome ? "ja" : "nee"}</li>
            <li>Politie betrokken: {referral.risk.policeInvolvement ? "ja" : "nee"}</li>
          </ul>
        </Section>

        <Section title="Betrokken partijen">
          <p className="text-moss-900">
            {referral.involvedParties.map((p) => INVOLVED_LABEL[p]).join(", ") || "—"}
          </p>
        </Section>

        <Section title="Bijlagen">
          {referral.documents.length === 0 ? (
            <p className="text-sm text-moss-700">Geen bijlagen.</p>
          ) : (
            <ul className="space-y-2">
              {referral.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-moss-200/70 bg-cream/60 px-4 py-3 text-sm"
                >
                  <span>
                    {d.filename}{" "}
                    <span className="text-moss-600">({Math.round(d.size / 1024)} KB)</span>
                  </span>
                  <a
                    href={`/api/referrals/${referral.id}/documents/${d.id}`}
                    className="text-forest-700 hover:underline"
                  >
                    Downloaden
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Toestemming">
          <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
            <li>Verwerking persoonsgegevens: {referral.consent.dataProcessing ? "ja" : "nee"}</li>
            <li>Contact opname: {referral.consent.contact ? "ja" : "nee"}</li>
            <li>Delen binnen behandelteam: {referral.consent.shareWithProfessionals ? "ja" : "nee"}</li>
            <li>Naar waarheid ingevuld: {referral.consent.truthful ? "ja" : "nee"}</li>
          </ul>
          <p className="mt-3 text-sm text-moss-700">
            Ondertekend door <strong>{referral.consent.signedBy}</strong> op{" "}
            {new Date(referral.consent.givenAt).toLocaleString("nl-NL")} ·
            privacyverklaring v{referral.consent.privacyPolicyVersion}
          </p>
        </Section>

        <Section title="Statusgeschiedenis">
          <ol className="space-y-2">
            {referral.statusHistory
              .slice()
              .reverse()
              .map((h) => (
                <li key={h.id} className="text-sm text-moss-800">
                  <strong>{STATUS_LABEL[h.status]}</strong> ·{" "}
                  {new Date(h.changedAt).toLocaleString("nl-NL")} · door {h.authorName}
                  {h.reason ? ` — ${h.reason}` : ""}
                </li>
              ))}
          </ol>
        </Section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <AdminActions
          referralId={referral.id}
          currentStatus={referral.status}
          spoed={referral.spoed}
          assignedBehandelaarEmail={referral.assignedBehandelaarEmail}
          notes={referral.notes}
          statuses={ALL_STATUSES}
        />
        <div className="card-soft">
          <p className="eyebrow">Zorg-engine</p>
          <p className="mt-2 text-sm text-moss-700">
            {linkedTraject
              ? `Traject ${linkedTraject.clientCode} is al aangemaakt in de zorg-engine.`
              : "Maak een traject aan in de engine zodat een GD de aanmelding kan beoordelen en notificaties worden klaargezet."}
          </p>
          <PromoteToTrajectButton
            referralId={referral.id}
            existingTrajectId={linkedTraject?.id}
          />
        </div>

        <div className="card-soft">
          <p className="eyebrow">Export</p>
          <p className="mt-2 text-sm text-moss-700">
            Klaar voor overdracht naar de behandelaren-app.
          </p>
          <a
            href={`/api/referrals/${referral.id}/export`}
            className="btn-primary mt-4 w-full"
          >
            Download JSON-export
          </a>
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

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 py-1 text-sm">
      <dt className="text-moss-700">{k}</dt>
      <dd className="text-moss-900">{v}</dd>
    </div>
  );
}
