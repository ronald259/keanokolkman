import { ReactNode } from "react";
import Image from "next/image";
import { bospad, type SiteImage } from "@/lib/images";

export function PageHero({
  eyebrow,
  title,
  intro,
  image = bospad,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: SiteImage;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden text-mist">
      <div className="absolute inset-0 -z-10">
        <Image
          src={image.src}
          alt={image.alt}
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
              "linear-gradient(180deg, rgba(14,28,21,0.65) 0%, rgba(14,28,21,0.55) 60%, rgba(14,28,21,0.95) 100%)",
          }}
        />
        <div className="absolute inset-0 grain opacity-[0.15] mix-blend-overlay" aria-hidden="true" />
      </div>
      <div className="container-wide pt-36 pb-20 sm:pt-44 sm:pb-28">
        <p className="eyebrow text-mist/70">{eyebrow}</p>
        <h1 className="display-1 mt-5 max-w-4xl text-balance text-cream">
          {title}
        </h1>
        {intro && (
          <p className="lede mt-6 max-w-2xl text-mist/85">{intro}</p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(249,245,236,0.0) 60%, rgba(249,245,236,1) 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
