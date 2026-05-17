import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { IntakeWizard } from "@/components/wizard/intake-wizard";
import type { ReferralRoute } from "@/lib/referrals/types";

export const metadata: Metadata = {
  title: "Aanmelding starten",
  description: "Stapsgewijze, AVG-zorgvuldige intake voor AgoNatura.",
  robots: { index: false, follow: false },
};

const VALID: ReferralRoute[] = ["ouder", "verwijzer", "gemeente", "casusoverleg", "lelystad", "anders"];

export default function StartPage({
  searchParams,
}: {
  searchParams: { route?: string };
}) {
  const initial = (VALID as string[]).includes(searchParams.route ?? "")
    ? (searchParams.route as ReferralRoute)
    : "ouder";

  return (
    <>
      <PageHero
        eyebrow="Aanmelding"
        title="Acht rustige stappen. U kunt op elk moment terug."
        intro="Vul alleen in wat nu nodig is. Diepere details bespreken we liever in een gesprek. Uw bericht wordt versleuteld verzonden."
      />
      <section className="container-wide py-16 sm:py-20">
        <IntakeWizard initialRoute={initial} />
      </section>
    </>
  );
}
