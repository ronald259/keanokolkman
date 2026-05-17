"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { heroMeadow } from "@/lib/images";

const audiences = [
  { href: "/voor-ouders", label: "Ik ben ouder" },
  { href: "/voor-verwijzers", label: "Ik ben verwijzer" },
  { href: "/voor-gemeenten", label: "Ik werk bij een gemeente" },
  { href: "/aanmelden", label: "Aanmelden of overleggen" },
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden">
      {/* Cinematische achtergrond — fotobeeld + warme gradient + grain */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroMeadow.src}
          alt={heroMeadow.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,28,21,0.55) 0%, rgba(14,28,21,0.35) 35%, rgba(14,28,21,0.65) 80%, rgba(14,28,21,0.92) 100%)",
          }}
        />
        <div className="absolute inset-0 grain opacity-[0.18] mix-blend-overlay" aria-hidden="true" />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(900px 700px at 80% 0%, rgba(243,236,218,0.18), transparent 60%)",
          }}
        />
      </div>

      <div className="relative">
        <div className="container-wide pt-36 pb-28 sm:pt-44 sm:pb-36 lg:pt-56 lg:pb-44">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="eyebrow text-cream/80"
          >
            Specialistische dagbehandeling — in en met de natuur
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.05 }}
            className="display-1 mt-6 max-w-4xl text-balance text-cream"
          >
            Niet ieder kind herstelt tussen vier muren.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.18 }}
            className="lede mt-6 max-w-2xl text-mist/90"
          >
            AgoNatura biedt specialistische dagbehandeling voor kinderen en
            jongeren met complexe problematiek. Multidisciplinair, traumasensitief
            en hechtingsgericht. De natuur is bij ons geen decor, maar onderdeel
            van de behandeling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.35 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            {audiences.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  i === audiences.length - 1
                    ? "btn-primary"
                    : "btn-ghost border-cream/30 bg-cream/5 text-cream hover:border-cream hover:bg-cream/15"
                }
              >
                {item.label}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.7 }}
            className="mt-20 hidden max-w-xl items-center gap-6 text-cream/80 md:flex"
          >
            <div className="h-px flex-1 bg-cream/30" />
            <span className="text-xs uppercase tracking-[0.24em] text-cream/70">
              Volg het pad omlaag
            </span>
            <motion.span
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-cream/70"
              aria-hidden="true"
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
