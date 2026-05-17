"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  STATUS_LABEL,
  type InternalNote,
  type ReferralStatus,
} from "@/lib/referrals/types";

export function AdminActions({
  referralId,
  currentStatus,
  spoed,
  assignedBehandelaarEmail,
  notes,
  statuses,
}: {
  referralId: string;
  currentStatus: ReferralStatus;
  spoed: boolean;
  assignedBehandelaarEmail?: string;
  notes: InternalNote[];
  statuses: ReferralStatus[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ReferralStatus>(currentStatus);
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState(assignedBehandelaarEmail ?? "");
  const [spoedState, setSpoedState] = useState(spoed);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveStatus() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/referrals/${referralId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          assignedBehandelaarEmail: assignee || undefined,
          spoed: spoedState,
          reason,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Wijziging mislukt.");
      }
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/referrals/${referralId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Notitie kon niet worden opgeslagen.");
      }
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-soft">
        <p className="eyebrow">Status & toewijzing</p>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-moss-900">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReferralStatus)}
            className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-moss-900">Toewijzen aan behandelaar (e-mail)</span>
          <input
            type="email"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="behandelaar@agonatura.nl"
            className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
          />
        </label>

        <label className="mt-4 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-forest-700"
            checked={spoedState}
            onChange={(e) => setSpoedState(e.target.checked)}
          />
          Markeer als spoed
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-moss-900">Toelichting (optioneel)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
          />
        </label>

        {error && <p role="alert" className="mt-3 text-sm text-clay-700">{error}</p>}

        <button
          type="button"
          onClick={saveStatus}
          disabled={busy}
          className="btn-primary mt-4 w-full disabled:opacity-60"
        >
          Opslaan
        </button>
      </div>

      <div className="card-soft">
        <p className="eyebrow">Interne notitie</p>
        <p className="mt-2 text-xs text-moss-700">
          Procesmatige signalering — geen diagnostische inhoud.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Bijv. 'Belafspraak ingepland met ouders op…'"
          className="mt-3 w-full rounded-2xl border border-moss-300/70 bg-cream px-4 py-3"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={busy || !note.trim()}
          className="btn-primary mt-3 w-full disabled:opacity-60"
        >
          Notitie toevoegen
        </button>

        {notes.length > 0 && (
          <ul className="mt-5 space-y-3">
            {notes
              .slice()
              .reverse()
              .map((n) => (
                <li key={n.id} className="rounded-xl border border-moss-200/70 bg-cream/70 p-3 text-sm">
                  <p className="whitespace-pre-line text-moss-900">{n.content}</p>
                  <p className="mt-2 text-xs text-moss-700">
                    {n.authorName} · {new Date(n.createdAt).toLocaleString("nl-NL")}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
