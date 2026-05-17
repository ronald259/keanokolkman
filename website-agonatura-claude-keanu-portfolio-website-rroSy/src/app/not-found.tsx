import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-wide pt-40 pb-32">
      <p className="eyebrow">Pagina niet gevonden</p>
      <h1 className="display-1 mt-3 max-w-2xl text-balance">
        Een afslag te vroeg genomen. Geen probleem.
      </h1>
      <p className="lede mt-6 max-w-xl">
        De pagina die u zocht bestaat niet meer of is verplaatst. Loop terug
        naar het terrein.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">Terug naar de homepage</Link>
        <Link href="/aanmelden" className="btn-ghost">Direct contact</Link>
      </div>
    </section>
  );
}
