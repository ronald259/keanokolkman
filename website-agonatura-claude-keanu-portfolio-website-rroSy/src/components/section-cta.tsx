import Link from "next/link";

export function SectionCTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-moss-200/60 bg-forest-900 px-8 py-16 text-mist sm:px-16 sm:py-20">
          <div
            className="absolute inset-0 -z-10 bg-canopy opacity-95"
            aria-hidden="true"
          />
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow text-mist/70">Aanmelden of overleggen</p>
              <h2 className="display-2 mt-3 max-w-2xl text-balance text-cream">
                Twijfelt u of uw vraag bij ons past? Bel of mail vrijblijvend.
              </h2>
              <p className="lede mt-6 max-w-xl text-mist/85">
                We denken graag mee — ook als blijkt dat een andere plek beter
                bij dit kind past. Goed verwijzen vraagt om eerlijk kijken.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/aanmelden" className="btn-primary bg-cream text-forest-900 hover:bg-mist hover:shadow-none">
                Aanmelden of overleggen
              </Link>
              <Link href="/behandelvisie" className="btn-ghost border-mist/30 text-cream hover:border-cream hover:bg-cream/10">
                Lees onze behandelvisie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
