/**
 * Beeld-configuratie voor de test-/feedbackversie.
 *
 * Voor de definitieve versie vervangt de webbeheerder deze door eigen,
 * documentaire fotografie van het terrein en de behandelaars. Plaats de
 * bestanden in `/public/images/` en pas de paden hieronder aan
 * (bijvoorbeeld `"/images/hero-meadow.jpg"`).
 *
 * Velden:
 *  - `src` — absolute URL (test) of pad onder /public (productie)
 *  - `alt` — alternatieve tekst voor toegankelijkheid
 *  - `width` / `height` — intrinsieke afmetingen voor layout-shift preventie
 */
export type SiteImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3DfO3oJ235zNoZvSzzkyhxtgyV2";

export const heroMeadow: SiteImage = {
  src: `${CDN}/hf_20260516_205834_e879c90a-9775-463e-9f41-3240e8821f08.png`,
  alt: "Brede luchtopname van een rustig bospad in een open Nederlands natuurgebied, ochtendmist tussen de bomen.",
  width: 3168,
  height: 1344,
};

export const oudersPad: SiteImage = {
  src: `${CDN}/hf_20260516_205856_f86ae5b4-b3ee-4865-b515-849e7a6c63bb.png`,
  alt: "Twee kinderen wandelen van de camera af over een zandpad in een rustig bos.",
  width: 1856,
  height: 2304,
};

export const vuurplaats: SiteImage = {
  src: `${CDN}/hf_20260516_205903_b9668d8d-7071-4195-9189-a066f762a0cb.png`,
  alt: "Klein kampvuur in een stenen ring op de bosbodem in de schemering, warm gloeiend.",
  width: 2752,
  height: 1536,
};

export const picknicktafel: SiteImage = {
  src: `${CDN}/hf_20260516_205912_f4d41de5-f6e6-471d-96f5-939e69ea45fa.png`,
  alt: "Een rustieke houten picknicktafel in een zonnige open plek met notitieboeken en een thermoskan.",
  width: 2752,
  height: 1536,
};

export const bospad: SiteImage = {
  src: `${CDN}/hf_20260516_205919_9352d6db-2807-4c80-8c65-fe59f22d854a.png`,
  alt: "Een rustig zandpad slingert door berken- en dennenbomen met zacht ochtendlicht.",
  width: 2752,
  height: 1536,
};
