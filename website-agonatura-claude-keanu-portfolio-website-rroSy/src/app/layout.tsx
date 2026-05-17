import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const siteUrl = "https://www.agonatura.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AgoNatura — Specialistische dagbehandeling in en met de natuur",
    template: "%s · AgoNatura",
  },
  description:
    "AgoNatura biedt specialistische dagbehandeling voor kinderen en jongeren met complexe problematiek. Multidisciplinair, traumasensitief en hechtingsgericht — in en met de natuur.",
  keywords: [
    "specialistische jeugdhulp",
    "dagbehandeling jeugd",
    "jeugd GGZ",
    "natuur en GGZ",
    "traumasensitieve jeugdhulp",
    "ervaringsleren",
    "thuiszitters behandeling",
    "systeemgerichte jeugdhulp",
    "buiten behandelen GGZ",
  ],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: siteUrl,
    siteName: "AgoNatura",
    title: "AgoNatura — Specialistische dagbehandeling in en met de natuur",
    description:
      "Een behandelplek voor kinderen en jongeren die vastlopen in bestaande systemen. Multidisciplinair, evidence-informed en in de natuur.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgoNatura",
    description:
      "Specialistische dagbehandeling in en met de natuur — voor kinderen en jongeren met complexe problematiek.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-cream text-moss-950">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest-700 focus:px-4 focus:py-2 focus:text-cream"
        >
          Sla navigatie over
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
