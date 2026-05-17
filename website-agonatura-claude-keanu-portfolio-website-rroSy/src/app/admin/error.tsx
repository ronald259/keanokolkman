"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("admin error", error);
  }, [error]);

  return (
    <div className="card-soft mx-auto max-w-2xl">
      <p className="eyebrow text-clay-700">Er ging iets mis</p>
      <h2 className="display-3 mt-3 text-moss-950">
        Het beheerscherm kon niet geladen worden.
      </h2>
      <p className="mt-4 text-moss-800">
        Meest waarschijnlijke oorzaken: een onverwachte serverfout of een
        configuratieprobleem. Open{" "}
        <Link href="/api/admin/health" className="underline underline-offset-4 hover:text-forest-700">
          /api/admin/health
        </Link>{" "}
        om de serverconfiguratie te controleren.
      </p>
      {error.digest && (
        <p className="mt-4 text-xs text-moss-700">
          Foutreferentie: <code className="rounded bg-moss-100 px-1.5 py-0.5">{error.digest}</code>
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Opnieuw proberen
        </button>
        <Link href="/admin/login" className="btn-ghost">
          Terug naar login
        </Link>
      </div>
    </div>
  );
}
