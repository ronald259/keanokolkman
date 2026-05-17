import Link from "next/link";
import Image from "next/image";
import { oudersPad } from "@/lib/images";

export function SectionVoorOuders() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="ouders-heading">
      <div className="container-wide grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-moss-200/70 bg-paper">
            <Image
              src={oudersPad.src}
              alt={oudersPad.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden max-w-[18rem] rounded-2xl border border-moss-200/70 bg-cream p-5 shadow-lg shadow-moss-900/5 md:block">
            <p className="font-display text-base leading-snug text-moss-950">
              &ldquo;Voor het eerst voelde ik dat mijn kind ergens niet hoefde aan te passen
              om gezien te worden.&rdquo;
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-moss-700">— Moeder van een cliënt</p>
          </div>
        </div>

        <div>
          <p className="eyebrow">Voor ouders</p>
          <h2 id="ouders-heading" className="display-2 mt-3 text-balance text-moss-950">
            Misschien herkent u dit. We horen het vaker.
          </h2>
          <ul className="mt-8 space-y-4 text-moss-900">
            {[
              "Uw kind loopt vast op school of in bestaande zorg.",
              "Diagnoses stapelen zich op, maar er ontstaat geen ruimte.",
              "Gesprekken in een spreekkamer leveren te weinig op.",
              "U zoekt een plek waar uw kind niet alweer opnieuw moet bewijzen wie hij of zij is.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-moss-800">
            U hoeft niet alles uit te leggen. We luisteren eerst. Daarna kijken
            we samen of AgoNatura inhoudelijk de juiste plek is.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/voor-ouders" className="btn-primary">Lees meer voor ouders</Link>
            <Link href="/aanmelden" className="btn-ghost">Vrijblijvend overleggen</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
