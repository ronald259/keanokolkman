import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md fade-up">
        <div className="text-[var(--color-accent)] text-xs tracking-[0.4em] uppercase">404</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">Niet gevonden</h1>
        <p className="text-[var(--color-muted)] mt-3">Dit item bestaat niet (meer), of is verborgen.</p>
        <Link href="/home" className="btn btn-primary mt-6">Terug naar home</Link>
      </div>
    </main>
  );
}
