"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DECISION_LABEL,
  type AanmeldingDecision,
  type Medewerker,
} from "@/lib/engine/types";

const ALL_DECISIONS: AanmeldingDecision[] = [
  "accepteren",
  "afwijzen_risico",
  "verwijzen_elders",
  "wachtlijst",
];

export function AanmeldingDecisionPanel({
  trajectId,
  medewerkers,
  defaultBehandelaarEmail,
}: {
  trajectId: string;
  medewerkers: Medewerker[];
  defaultBehandelaarEmail?: string;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<AanmeldingDecision>("accepteren");
  const [decidedByEmail, setDecidedByEmail] = useState<string>(
    medewerkers.find((m) => m.role === "behaviour-scientist")?.email ?? medewerkers[0]?.email ?? "",
  );
  const [behandelaarEmail, setBehandelaarEmail] = useState<string>(
    defaultBehandelaarEmail ??
      medewerkers.find((m) => m.role === "behandelaar")?.email ??
      "",
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const decidedBy = medewerkers.find((m) => m.email === decidedByEmail);
  const requiresGd = decision === "afwijzen_risico";
  const gdMismatch = requiresGd && decidedBy?.role !== "behaviour-scientist";

  async function submit() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/trajecten/${trajectId}/decide-aanmelding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason,
          decidedByEmail,
          behandelaarEmail: decision === "accepteren" ? behandelaarEmail : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        notificationsPrepared?: number;
      };
      if (!res.ok) throw new Error(data.error ?? "Beslissing kon niet worden opgeslagen.");
      setInfo(
        `Beslissing vastgelegd. ${data.notificationsPrepared ?? 0} notificatie(s) klaargezet.`,
      );
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-soft">
      <p className="eyebrow">Beslissing aanmelding</p>
      <p className="mt-2 text-sm text-moss-700">
        Een GD beoordeelt aanmelding inhoudelijk. Bij accepteren wordt automatisch een uitnodiging
        klaargezet voor verwijzer + behandelaar.
      </p>

      <fieldset className="mt-5 space-y-2">
        <legend className="text-sm font-medium text-moss-900">Beslissing</legend>
        {ALL_DECISIONS.map((d) => (
          <label
            key={d}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${
              decision === d
                ? "border-forest-700 bg-forest-700/5"
                : "border-moss-300/70 hover:border-forest-600"
            }`}
          >
            <input
              type="radio"
              className="mt-1 accent-forest-700"
              checked={decision === d}
              onChange={() => setDecision(d)}
            />
            <span className="text-sm">
              {DECISION_LABEL[d]}
              {d === "afwijzen_risico" && (
                <span className="ml-2 rounded-full bg-clay-100 px-2 py-0.5 text-[11px] text-clay-800">
                  alleen GD
                </span>
              )}
            </span>
          </label>
        ))}
      </fieldset>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-moss-900">Beslissing door</span>
        <select
          value={decidedByEmail}
          onChange={(e) => setDecidedByEmail(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
        >
          {medewerkers.map((m) => (
            <option key={m.id} value={m.email}>
              {m.name} — {m.role}
            </option>
          ))}
        </select>
        {gdMismatch && (
          <p className="mt-2 text-xs text-clay-700">
            Afwijzen op risicosignalen vereist een gedragswetenschapper. Kies de juiste persoon.
          </p>
        )}
      </label>

      {decision === "accepteren" && (
        <label className="mt-5 block">
          <span className="text-sm font-medium text-moss-900">Toe te wijzen behandelaar</span>
          <select
            value={behandelaarEmail}
            onChange={(e) => setBehandelaarEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
          >
            <option value="">— Kies een behandelaar —</option>
            {medewerkers
              .filter((m) => m.role === "behandelaar" || m.role === "admin")
              .map((m) => (
                <option key={m.id} value={m.email}>
                  {m.name} — {m.email}
                </option>
              ))}
          </select>
        </label>
      )}

      <label className="mt-5 block">
        <span className="text-sm font-medium text-moss-900">
          Toelichting{" "}
          {decision === "afwijzen_risico" && (
            <span className="text-clay-700">(verplicht bij afwijzing)</span>
          )}
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder={
            decision === "afwijzen_risico"
              ? "Welke risicosignalen maken deze aanmelding niet passend?"
              : "Korte inhoudelijke onderbouwing."
          }
          className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
        />
      </label>

      {error && <p role="alert" className="mt-3 text-sm text-clay-700">{error}</p>}
      {info && <p className="mt-3 text-sm text-forest-700">{info}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy || gdMismatch || (decision === "accepteren" && !behandelaarEmail)}
        className="btn-primary mt-5 w-full disabled:opacity-60"
      >
        Beslissing vastleggen
      </button>
    </div>
  );
}
