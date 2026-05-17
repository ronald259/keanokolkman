import { Hero } from "@/components/hero";
import { SectionAnders } from "@/components/section-anders";
import { SectionMeedenken } from "@/components/section-meedenken";
import { SectionVisie } from "@/components/section-visie";
import { SectionSpecialistisch } from "@/components/section-specialistisch";
import { SectionLocaties } from "@/components/section-locaties";
import { SectionTraject } from "@/components/section-traject";
import { SectionVoorOuders } from "@/components/section-voor-ouders";
import { SectionVoorGemeenten } from "@/components/section-voor-gemeenten";
import { SectionCTA } from "@/components/section-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionAnders />
      <SectionMeedenken />
      <SectionVisie />
      <SectionSpecialistisch />
      <SectionLocaties />
      <SectionTraject />
      <SectionVoorOuders />
      <SectionVoorGemeenten />
      <SectionCTA />
    </>
  );
}
