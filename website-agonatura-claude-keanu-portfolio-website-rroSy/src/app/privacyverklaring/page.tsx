import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Prose } from "@/components/prose";
import { PRIVACY_POLICY_VERSION } from "@/lib/referrals/types";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description:
    "Hoe AgoNatura omgaat met persoonsgegevens, zorginformatie en aanmeldgegevens. AVG-conform, privacy by design.",
};

export default function PrivacyverklaringPage() {
  return (
    <>
      <PageHero
        eyebrow={`Versie ${PRIVACY_POLICY_VERSION}`}
        title="Privacyverklaring"
        intro="Deze website verwerkt gevoelige zorginformatie. We doen dat zorgvuldig, transparant en met respect voor uw rechten onder de AVG."
      />

      <section className="container-wide py-20 sm:py-24">
        <Prose>
          <h2>Wie zijn wij</h2>
          <p>
            AgoNatura is een specialistische jeugdhulpaanbieder. Wij zijn
            verwerkingsverantwoordelijke voor de persoonsgegevens die via
            deze website worden ingevuld.
          </p>

          <h2>Welke gegevens verwerken wij</h2>
          <ul>
            <li>NAW-gegevens en contactgegevens van ouders, verzorgers of verwijzers.</li>
            <li>Beperkte gegevens over de jeugdige: voornaam, geboortedatum, woonplaats, gemeente, schoolsituatie.</li>
            <li>Korte omschrijving van de hulpvraag en relevante problematiek.</li>
            <li>Optioneel meegezonden documenten (verwijzing, beschikking, verslagen).</li>
            <li>Toestemmingsregistratie (welke versie, wanneer gegeven, door wie).</li>
          </ul>
          <p>
            We vragen <strong>nooit meer dan strikt nodig</strong>. Klinische
            details bespreken we liever in een gesprek, niet via een webformulier.
          </p>

          <h2>Waarom verwerken wij deze gegevens</h2>
          <ul>
            <li>Om uw aanmelding inhoudelijk te kunnen beoordelen.</li>
            <li>Om contact met u op te nemen over de aanmelding.</li>
            <li>Om de juiste behandeling te kunnen starten als er een traject volgt.</li>
            <li>Om te voldoen aan wettelijke verplichtingen rondom jeugdhulp.</li>
          </ul>

          <h2>Privacy by design</h2>
          <p>
            De website is opgezet volgens het principe van dataminimalisatie:
            geen BSN-velden, geen marketingtracking op formulieren, geen
            persoonsgegevens in URL&apos;s of logs. Bestanden worden buiten de
            publieke website opgeslagen en zijn alleen toegankelijk voor
            geautoriseerde medewerkers.
          </p>

          <h2>Hoe lang bewaren we uw gegevens</h2>
          <ul>
            <li>Niet-aangenomen aanmeldingen: maximaal twaalf maanden, daarna geanonimiseerd of verwijderd.</li>
            <li>Aangenomen aanmeldingen worden overgedragen aan het zorginhoudelijke dossier en vallen vanaf dat moment onder de bewaarplicht uit de jeugdwet (in principe vijftien jaar).</li>
            <li>Auditlogs (wie deed wanneer wat) worden vijf jaar bewaard ten behoeve van verantwoording.</li>
          </ul>

          <h2>Met wie delen wij gegevens</h2>
          <p>
            Binnen het AgoNatura-team alleen met medewerkers die de informatie
            nodig hebben voor uw casus. Met externe partijen alleen wanneer u
            daar expliciet toestemming voor heeft gegeven, of wanneer dit
            wettelijk verplicht is.
          </p>

          <h2>Uw rechten</h2>
          <ul>
            <li>Recht op inzage in de gegevens die wij over u hebben.</li>
            <li>Recht op correctie of aanvulling van onjuiste gegevens.</li>
            <li>Recht op verwijdering, voor zover wettelijk toegestaan.</li>
            <li>Recht om uw toestemming op elk moment in te trekken.</li>
            <li>Recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens.</li>
          </ul>
          <p>
            Stuur uw verzoek naar <a href="mailto:privacy@agonatura.nl" className="underline underline-offset-4 hover:text-forest-700">privacy@agonatura.nl</a>.
            We reageren binnen vier weken.
          </p>

          <h2>Beveiliging</h2>
          <p>
            We werken volgens de principes van NEN 7510 en zijn in een
            ISO 27001-traject. Verkeer naar deze website is versleuteld
            (HTTPS), bestanden worden buiten de publieke webroot opgeslagen,
            en toegang tot aanmeldgegevens is rolgebaseerd en wordt
            gelogd.
          </p>

          <h2>Cookies en analytics</h2>
          <p>
            Deze website gebruikt geen marketingcookies of advertentietrackers.
            Op pagina&apos;s waar zorginformatie wordt ingevuld worden geen
            analytics-scripts geladen. Functionele cookies (zoals de
            beveiligde adminsessie) worden uitsluitend gebruikt voor het
            laten functioneren van de website.
          </p>

          <h2>Contact</h2>
          <p>
            Vragen over privacy? Mail
            {" "}
            <a href="mailto:privacy@agonatura.nl" className="underline underline-offset-4 hover:text-forest-700">privacy@agonatura.nl</a>
            {" "}
            of bel ons op werkdagen. We helpen u graag.
          </p>
        </Prose>
      </section>
    </>
  );
}
