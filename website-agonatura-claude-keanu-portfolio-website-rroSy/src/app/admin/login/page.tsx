import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (getSession()) redirect("/admin");

  return (
    <div className="min-h-screen bg-mist pt-32">
      <div className="container-narrow">
        <p className="eyebrow">Beheer</p>
        <h1 className="font-display text-3xl text-moss-950">Inloggen</h1>
        <p className="mt-3 text-moss-800">
          Toegang voor AgoNatura-medewerkers met een geldige beheerderscode.
        </p>
        <form
          action="/api/admin/login"
          method="post"
          className="card-soft mt-8 space-y-5"
        >
          <label className="block">
            <span className="text-sm font-medium text-moss-900">Beheerderscode</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-moss-300/70 bg-cream/80 px-4 py-3 text-base outline-none ring-forest-600 focus:ring-2"
            />
          </label>
          {searchParams.error === "no_password" && (
            <p role="alert" className="text-sm text-clay-700">
              ADMIN_PASSWORD is niet ingesteld op de server. Zet deze
              environment variable in Vercel en redeploy.
            </p>
          )}
          {searchParams.error === "secret" && (
            <p role="alert" className="text-sm text-clay-700">
              Wachtwoord klopt, maar ADMIN_SECRET ontbreekt of is te kort
              (minimaal 16 tekens). Stel deze in en redeploy.
            </p>
          )}
          {searchParams.error === "ratelimit" && (
            <p role="alert" className="text-sm text-clay-700">
              Te veel inlogpogingen. Wacht 15 minuten of redeploy om de
              teller te resetten.
            </p>
          )}
          {searchParams.error === "invalid" && (
            <p role="alert" className="text-sm text-clay-700">
              Wachtwoord onjuist. Controleer of er geen spatie meegekopieerd
              is en of je na een env-wijziging hebt geredeployd.
            </p>
          )}
          {searchParams.error && !["no_password","secret","ratelimit","invalid"].includes(searchParams.error) && (
            <p role="alert" className="text-sm text-clay-700">
              Inloggen mislukt. Controleer de code en probeer het opnieuw.
            </p>
          )}
          <p className="text-xs text-moss-700">
            Komt er niets door? Open{" "}
            <a href="/api/admin/health" className="underline underline-offset-4 hover:text-forest-700">
              /api/admin/health
            </a>{" "}
            voor een diagnose van de server-configuratie.
          </p>
          <button type="submit" className="btn-primary w-full">Inloggen</button>
          <p className="text-xs text-moss-700">
            Iedere inlogpoging — gelukt of niet — wordt vastgelegd in de auditlog.
          </p>
        </form>
      </div>
    </div>
  );
}
