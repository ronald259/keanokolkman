import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  if (session) redirect(params.from || "/home");

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6">
      {/* Cinematic background */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=2400&q=80')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/85 to-black" />

      <div className="fade-up w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="block w-8 h-px bg-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)] text-xs tracking-[0.4em] uppercase">
              Privé Archief
            </span>
            <span className="block w-8 h-px bg-[var(--color-accent)]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Keanu <span className="text-[var(--color-accent)]">Kolkman</span>
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Voer je wachtwoord in om door te gaan.
          </p>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <LoginForm from={params.from} initialError={params.error} />
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          © {new Date().getFullYear()} Keanu Kolkman · Alle media auteursrechtelijk beschermd
        </p>
      </div>
    </main>
  );
}
