# AgoNatura — Digital Experience Platform

Een premium, cinematische website **én** AVG-zorgvuldig aanmeldplatform voor
**AgoNatura**: specialistische dagbehandeling in en met de natuur voor
kinderen en jongeren met complexe problematiek.

De website is opgezet als fase 1 van een groter digitaal zorgplatform. Fase 2
— de behandelaren-app met screening, intake, observatie (8 weken),
GO/NO-GO, behandelplan, sessies en evaluatie — is voorbereid op data-
overdracht via een webhook en JSON-export.

---

## Inhoud

1. [Stack](#stack)
2. [Quickstart](#quickstart)
3. [Projectstructuur](#projectstructuur)
4. [Designprincipes](#designprincipes)
5. [Het terrein (10 zones)](#het-terrein-10-zones)
6. [Het aanmeldplatform](#het-aanmeldplatform)
7. [Adminomgeving](#adminomgeving)
8. [API-overzicht](#api-overzicht)
9. [Datamodel](#datamodel)
10. [Privacy & informatieveiligheid](#privacy--informatieveiligheid)
11. [Koppeling met de behandelaren-app](#koppeling-met-de-behandelaren-app)
12. [SEO](#seo)
13. [TODO](#todo)
14. [Deployment](#deployment)

---

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript 5**
- **Tailwind CSS** met op natuur geënt eigen palet (moss / forest / sand / clay)
- **Framer Motion** voor subtiele, premium animaties
- **Google Fonts** Inter + Fraunces (display)
- Volledig SVG-gebaseerde landschapsillustraties en interactieve terreinkaart
- Zero externe runtime dependencies voor het aanmeldplatform — bewust
  controleerbaar voor AVG-doeleinden

## Quickstart

```bash
cp .env.example .env.local      # vul minimaal ADMIN_PASSWORD, ADMIN_SECRET, IP_HASH_SALT
npm install
npm run dev                     # http://localhost:3000
npm run build && npm run start
npm run typecheck
npm run lint
```

## Projectstructuur

```
src/
├── app/
│   ├── layout.tsx                 # Root layout, header & footer, fonts, SEO
│   ├── page.tsx                   # Homepage — hero, terreinkaart, secties
│   ├── globals.css                # Tailwind + design tokens
│   ├── sitemap.ts / robots.ts     # SEO
│   ├── privacyverklaring/         # AVG-pagina (versie-gemarkeerd)
│   ├── aanmelden/
│   │   ├── page.tsx               # Landing met 4 routes
│   │   └── start/page.tsx         # Multi-step intake wizard
│   ├── admin/
│   │   ├── layout.tsx             # Adminframe (alleen ingelogd)
│   │   ├── login/page.tsx         # Login-scherm
│   │   ├── page.tsx               # Aanmeldingen overzicht + filters
│   │   └── [id]/page.tsx          # Aanmelding-detail + acties + export
│   ├── api/
│   │   ├── admin/login/           # POST: sessie aanmaken
│   │   ├── admin/logout/          # POST: sessie wissen
│   │   ├── referrals/route.ts     # POST: aanmelding · GET: lijst (admin)
│   │   ├── referrals/[id]/route.ts # GET/PATCH detail (admin)
│   │   ├── referrals/[id]/notes/  # POST: interne notitie
│   │   ├── referrals/[id]/export/ # GET: gestructureerde JSON-export
│   │   └── referrals/[id]/documents/[docId]/ # GET: download bijlage
│   └── [content pages]            # behandelvisie, behandelvormen, voor-*, etc.
├── components/
│   ├── site-header.tsx · site-footer.tsx · logo.tsx
│   ├── hero.tsx · landscape-sky.tsx
│   ├── terrain-map.tsx            # Interactieve terreinkaart (10 zones)
│   ├── section-*.tsx              # Homepage-secties
│   ├── page-hero.tsx · prose.tsx
│   ├── wizard/intake-wizard.tsx   # 8-stappen intake (client-side)
│   └── admin/admin-actions.tsx    # Status / toewijzing / notitie
├── lib/
│   ├── auth.ts                    # HMAC-getekende sessie (httpOnly cookie)
│   ├── rate-limit.ts              # In-memory token bucket
│   ├── terrain.ts                 # 10 zones definities
│   └── referrals/
│       ├── types.ts               # Datamodel — fase 1 + 2 alignment
│       ├── storage.ts             # Storage-abstractie (file-backed adapter)
│       ├── validation.ts          # Sanitization & validatie
│       ├── audit.ts               # Append-only auditlog
│       └── id.ts                  # ID + clientCode generators
└── middleware.ts                  # Security headers (CSP, HSTS, etc.)
```

## Designprincipes

- **Geen klinische zorgsite.** Geen blauwe corporate blokken, geen stock-iconen.
- Palet: mosgroen, donkergroen, zand, klei, warm wit. Editorial typografie
  (Fraunces voor display, Inter voor body).
- Animaties zijn **rustig en filmisch** — hellingen, drijvende mist, langzaam
  pulserende markeringen. Alles respecteert `prefers-reduced-motion`.
- Toegankelijkheid: skip-link, semantische landmarks, focus rings, ARIA-labels
  op SVG, leesbare contrastverhoudingen, mobielvriendelijke navigatie.

## Het terrein (10 zones)

| Zone               | Functie                                               |
| ------------------ | ----------------------------------------------------- |
| Welkomplein        | Entree en oriëntatie                                  |
| Vuurplaats         | Verbinding, veiligheid, behandelvisie                 |
| Hoofdgebouw        | Multidisciplinair team & kwaliteit                    |
| Therapieruimtes    | PMT, EMDR, ACT, muziektherapie                        |
| Activiteitenveld   | Ervaringsleren                                         |
| Bospad             | Het behandeltraject                                    |
| Reflectieplek      | Voor ouders                                            |
| Observatiepunt     | Voor verwijzers — screening, intake, observatie        |
| Picknicktafel      | Voor gemeenten — samenwerking                          |
| Moestuin           | Groei en eigen regie                                   |

Definities staan in [`src/lib/terrain.ts`](./src/lib/terrain.ts).

## Het aanmeldplatform

Op `/aanmelden` kiest de bezoeker een van vier routes (ouder, verwijzer,
casusoverleg, gemeente). Vanaf daar start de wizard op `/aanmelden/start`:

| Stap | Onderwerp                                                   |
| ---- | ----------------------------------------------------------- |
| 1    | Wie meldt zich (rol)                                         |
| 2    | Voor wie (kind, ouders, school)                              |
| 3    | Hulpvraag + urgentie + veiligheidssignalen                   |
| 4    | Problematiek (multi-select)                                  |
| 5    | Betrokken partijen                                           |
| 6    | Bijlagen (PDF/DOCX/JPG/PNG, max 8 MB × 8 bestanden)          |
| 7    | Toestemming en privacy (vier expliciete consents)            |
| 8    | Samenvatting controleren en versturen                        |

Bij verzenden:

1. De server valideert, saneert en MIME-checkt alles.
2. Een **cliëntcode** in formaat `AGN-YYYY-XXX` wordt gegenereerd (zelfde
   formaat als de behandelaren-app verwacht in `TRAJECTEN.client_id`).
3. Bijlagen worden buiten de public webroot opgeslagen
   (`<dataRoot>/uploads/<referralId>/<docId>`).
4. De aanmelding wordt opgeslagen, een `referral.created` event geaudit, en
   — indien geconfigureerd — naar de behandelaren-app gepushed via webhook.
5. De gebruiker krijgt de cliëntcode te zien voor latere correspondentie.

## Adminomgeving

`/admin/login` → HMAC-getekende sessiecookie (httpOnly, 8 uur). Rollen
(admin / coördinator / gedragswetenschapper / viewer) zitten in het
datamodel — voor fase 1 is er één gedeelde admin-credential. Voor fase 2
sluit dit aan op een per-medewerker login.

Op `/admin`:

- Lijst van aanmeldingen met **filter op status** en **zoek op naam /
  cliëntcode / gemeente**.
- Spoed-badges; statuskleur per fase uit het masterplan.

Op `/admin/[id]`:

- Volledige weergave: cliënt, ouders, verwijzer, hulpvraag, problematiek,
  risico, bijlagen (downloadbaar), toestemming, statusgeschiedenis.
- **Acties**: status wijzigen (incl. toelichting), behandelaar toewijzen,
  spoed-vlag zetten, interne notitie toevoegen.
- **JSON-export** in het schema dat de behandelaren-app verwacht.

Iedere actie wordt vastgelegd in de auditlog (`<dataRoot>/audit.log`).

## API-overzicht

Alle endpoints draaien op de Node-runtime (geen edge).

| Methode | Route                                          | Toegang  | Doel                                |
| ------- | ---------------------------------------------- | -------- | ----------------------------------- |
| POST    | `/api/referrals`                               | publiek  | Aanmelding aanmaken (multipart)     |
| GET     | `/api/referrals`                               | admin    | Lijst van aanmeldingen              |
| GET     | `/api/referrals/:id`                           | admin    | Volledig record                     |
| PATCH   | `/api/referrals/:id`                           | admin    | Status / toewijzing / spoed         |
| POST    | `/api/referrals/:id/notes`                     | admin    | Interne notitie                     |
| GET     | `/api/referrals/:id/export`                    | admin    | JSON-export voor behandelaren-app   |
| GET     | `/api/referrals/:id/documents/:docId`          | admin    | Bijlage downloaden                  |
| POST    | `/api/admin/login`                             | publiek  | Sessie aanmaken                     |
| POST    | `/api/admin/logout`                            | session  | Sessie wissen                       |

POST `/api/referrals` is gerate-limit (5 per IP-fingerprint per uur).
`/api/admin/login` is gerate-limit (8 pogingen per 15 minuten).

## Datamodel

`src/lib/referrals/types.ts` bevat het volledige model. Top-level entiteiten:

- `Referral` — primaire aggregate
- `Client` — minimale jeugdige-informatie
- `ParentGuardian[]` — één of twee contactpersonen
- `Referrer` — verwijzer (huisarts / GI / school / etc.)
- `Municipality`, `School`
- `RiskSignals` — urgentie, suïcidaliteit-aanwezigheid, veiligheidssignalen
- `UploadedDocument[]` — metadata + storagePath (bestand zelf staat buiten webroot)
- `Consent` — vier expliciete toestemmingen + versie van privacyverklaring
- `InternalNote[]`, `StatusHistoryEntry[]`

De status-enum komt overeen met de fase-flow uit het masterplan:

```
nieuw → in-beoordeling → screening-gepland → geaccepteerd
                       → aanvullende-informatie-gevraagd
                       → niet-passend
                       → doorgezet-naar-behandelaren-app
```

## Privacy & informatieveiligheid

**Privacy by design** is verwerkt in elk laagje:

- Geen BSN-veld in het model. Geen volledige IP-opslag (alleen gesalt-en-gehashte
  fingerprint). Geen marketingtrackers, geen analytics op intakeflows.
- Dataminimalisatie: alleen wat in dit moment nodig is. Diepe klinische
  informatie hoort thuis in de behandelaren-app, niet op een webformulier.
- **Server-side validatie & sanitization** op alle inputs (`validation.ts`).
- **MIME-, extensie- en groottecontrole** voor bestandsuploads. Alleen PDF,
  DOCX, JPG en PNG. Max 8 MB per bestand, 25 MB totaal, 8 bestanden per aanmelding.
- **Bestanden buiten de public webroot**. Toegang loopt alleen via een
  authenticatie-gevalideerde route die path-traversal blokkeert.
- **Security headers** op alle responses (`src/middleware.ts`): CSP,
  X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy
  strict-origin, Permissions-Policy, Cross-Origin-* policies, en HSTS in
  productie.
- **HMAC-getekende sessiecookies** (httpOnly, sameSite=lax, secure in
  productie, 8 uur max).
- **Rate limiting** op POST `/api/referrals` en `/api/admin/login`.
- **Auditlog** voor: aanmaak, statuswijziging, notitie, document-download,
  export en admin-login. Geen inhoud van gevoelige velden in de logs.
- **Honeypot** veld + JSON-only API als anti-bot maatregel.
- **Toestemmingsregistratie** vermeldt versie van de privacyverklaring,
  tijdstip en digitale handtekening — traceerbaar en herroepbaar.
- **CSP** sluit alle third-party scripts uit; alleen Google Fonts (CSS) is
  toegestaan.
- **Geen gevoelige data in URL's**, frontend logs of analytics.

Bewaartermijnen, inzage- en verwijderprocedures staan op
[`/privacyverklaring`](./src/app/privacyverklaring/page.tsx) (versie
geregistreerd via `PRIVACY_POLICY_VERSION`).

## Koppeling met de behandelaren-app

De Phase 2 behandelaren-app (Glide Maker + Google Sheets, of een
opvolger) krijgt aanmeldingen via twee kanalen:

1. **Webhook** (`REFERRAL_WEBHOOK_URL`). Payload:
   ```
   { event: "referral.created" | "referral.status-changed",
     occurredAt, referral: { client_id, fase, status, spoed, urgency,
       client, parents, referrer, help_request, problem_areas, risk,
       consent, documents, ... } }
   ```
   Veldnamen volgen de masterplan-conventies (`client_id`, `fase`, snake_case
   in het externe contract).
2. **JSON-export** per aanmelding via `/api/referrals/:id/export`. Schema
   `agonatura.referral.v1` — bedoeld om in te lezen door de Glide app
   (via een Apps Script ingest) of door een vervangende backend.

De cliëntcode `AGN-YYYY-XXX` matcht `TRAJECTEN.client_id` uit het masterplan.
Statussen en spoed-vlag mappen één-op-één.

## SEO

- `metadataBase`, OG, Twitter cards en NL-locale staan in `layout.tsx`.
- Per-pagina `metadata` in elke `page.tsx`.
- Sitemap op `/sitemap.xml`, robots op `/robots.txt` (admin en intakeflow
  zijn `noindex`).
- Trefwoorden: specialistische jeugdhulp, dagbehandeling jeugd, jeugd GGZ,
  natuur en GGZ, traumasensitieve jeugdhulp, ervaringsleren, thuiszitters
  behandeling, systeemgerichte jeugdhulp, buiten behandelen GGZ.

## TODO

Voor go-live nog aan te leveren door AgoNatura:

1. **Definitieve teksten** — kernverhalen en (anonieme, met toestemming)
   testimonials voor `/voor-ouders` en de homepage.
2. **Echte teamprofielen** — namen, functies, foto's, BIG-/SKJ-nummers.
3. **Beeldmateriaal** — documentaire fotografie van het terrein, behandelaars
   en activiteiten.
4. **Praktische gegevens** — adres, telefoonnummer, KvK, AGB-code,
   klachtenregeling, definitieve privacyverklaring-inhoud.
5. **Productie-storage** — vervang `FileReferralStore` door een managed
   database-adapter (Postgres / Supabase) en upload-storage door object
   store (S3 / R2 / Vercel Blob). Interface `ReferralStore` is stabiel.
6. **Per-medewerker auth** — vervang `ADMIN_PASSWORD` door een echte
   identity provider (NextAuth / WorkOS / Microsoft Entra). De
   `Role`-enum in het datamodel is al voorbereid.
7. **Webhook-receiver** in de behandelaren-app (Apps Script of n8n) om
   `referral.created` en `referral.status-changed` events te accepteren.
8. **Audit-sink** — stream auditlogs naar een immutable log store voor
   verantwoording (5 jaar bewaartermijn).
9. **Cookiebanner** — alleen nodig zodra er ooit niet-functionele cookies
   bijkomen. Op dit moment niet vereist (geen analytics op intakeflows).

## Deployment

- **Vercel** (aanbevolen). Connect repo, build = `next build`. Zet
  environment variables: `ADMIN_PASSWORD`, `ADMIN_SECRET`, `IP_HASH_SALT`,
  optioneel `REFERRAL_WEBHOOK_URL`. **Let op:** filesystem op Vercel is
  ephemerals — voor productie verplicht een database- en object-store-
  gebaseerde storage-adapter.
- **Selfhost / Docker** met Node 20+. Mount een persistente volume op
  `AGONATURA_DATA_DIR` als je het file-backed model wil blijven gebruiken.
- DNS: `www.agonatura.nl` canonical, `agonatura.nl` als redirect.
- Forceer HTTPS aan de edge. Middleware zet HSTS in productie.

## Handover-checklist voor de webbeheerder

Deze website is een **Next.js 14** applicatie. Een webbeheerder heeft geen
diepgaande Next.js-kennis nodig, mits hosting Node 20+ ondersteunt. Volg
deze stappen:

1. **Hosting kiezen.** Drie veilige opties:
   - *Vercel* (eenvoudigst): koppel de Git-repo aan een Vercel-project,
     standaardinstellingen werken (`next build`, output directory `.next`).
   - *Cloudflare Pages / Netlify* met Next.js-runtime-plugin.
   - *Selfhost*: een server met Node 20+ en PM2 of een Docker-container.
2. **Domein.** Wijs `www.agonatura.nl` (CNAME) en `agonatura.nl`
   (apex / ALIAS, met permanente redirect naar www) aan de hostingprovider.
   HTTPS-certificaat wordt automatisch geregeld bij alle drie de opties.
3. **Environment variables** (in het dashboard van de hostingprovider zetten):

   | Naam | Waarde | Toelichting |
   |---|---|---|
   | `ADMIN_PASSWORD` | sterk wachtwoord (≥16 tekens) | Toegang tot `/admin` |
   | `ADMIN_SECRET` | willekeurige string (≥32 tekens) | Tekent de sessiecookie |
   | `ADMIN_NAME` | bv. `AgoNatura admin` | Naam in auditlog |
   | `IP_HASH_SALT` | willekeurige string (≥16 tekens) | Voor rate-limit fingerprints |
   | `REFERRAL_WEBHOOK_URL` | optioneel | Push naar behandelaren-app |

   Genereer wachtwoord/secret met `openssl rand -base64 32` of een
   passwordmanager.

4. **Eigen fotografie plaatsen.** De huidige sfeerbeelden zijn
   AI-gegenereerd voor de feedbackversie. Vervang ze als volgt:
   - Plaats jullie eigen fotobestanden in `/public/images/` (bijvoorbeeld
     `hero-meadow.jpg`, `terrein-aerial.jpg`, etc.).
   - Open `src/lib/images.ts` en vervang elke `src: "https://d8j0..."`-URL
     door `src: "/images/jouw-bestand.jpg"`. Pas ook `width`/`height` aan
     (intrinsieke afmetingen van de afbeelding) zodat layout-shift wordt
     voorkomen.
   - Verwijder de `remotePatterns`-regel in `next.config.mjs` en de
     CloudFront-regel in `src/middleware.ts` (img-src). Daarna laden alleen
     nog eigen, lokaal gehoste beelden.
5. **Tekstaanpassingen.** Inhoudelijke teksten staan rechtstreeks in de
   `page.tsx`-bestanden in `src/app/`. De webbeheerder kan deze met een
   teksteditor aanpassen — alle teksten zijn duidelijk in het Nederlands
   gegroepeerd boven hun layout-code.
6. **Aanmeldgegevens.** In de file-backed standaardversie staan
   aanmeldingen in `<AGONATURA_DATA_DIR>/referrals.json` en uploads in
   `<AGONATURA_DATA_DIR>/uploads/`. Standaard `<repo>/.data` (lokaal).
   **Vergeet niet** een persistente volume of een productie-database
   adapter in te richten — zie `src/lib/referrals/storage.ts`.
7. **Build & deploy.**
   ```bash
   npm install
   npm run build
   npm run start   # of laat het hostingplatform dit doen
   ```
8. **Eerste login.** Ga naar `https://www.agonatura.nl/admin/login` en log
   in met `ADMIN_PASSWORD`. Test een aanmelding via `/aanmelden`.
9. **Back-ups.** Configureer dagelijkse back-ups van
   `<AGONATURA_DATA_DIR>` (of de productie-database). De auditlog mag
   alleen append-only worden bewaard.

> **Privacy-aandachtspunt:** voor productie is een managed database
> (PostgreSQL via Supabase, Neon of een privacy-vriendelijke EU-provider)
> en object-store (S3 / R2 / Vercel Blob in EU-regio) aanbevolen. De
> file-backed adapter is bedoeld voor lokale ontwikkeling en eenvoudige
> selfhost-deployments — niet voor schaalbare productie.

## Licentie

© AgoNatura. Alle rechten voorbehouden.
