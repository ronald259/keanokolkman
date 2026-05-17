"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PromoteToTrajectButton({
  referralId,
  existingTrajectId,
}: {
  referralId: string;
  existingTrajectId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existingTrajectId) {
    return (
      <a
        href={`/admin/trajecten/${existingTrajectId}`}
        className="btn-primary mt-4 w-full"
      >
        Open traject →
      </a>
    );
  }

  async function promote() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/referrals/${referralId}/promote-to-traject`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        traject?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.traject) {
        throw new Error(data.error ?? "Kon traject niet aanmaken.");
      }
      router.push(`/admin/trajecten/${data.traject.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={promote}
        disabled={busy}
        className="btn-primary mt-4 w-full disabled:opacity-60"
      >
        {busy ? "Doorzetten…" : "Doorzetten naar traject"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-clay-700">{error}</p>}
      <p className="mt-2 text-xs text-moss-700">
        Maakt een nieuw traject aan in de zorg-engine. Een GD legt daarna de beslissing
        op de aanmelding vast.
      </p>
    </div>
  );
}
