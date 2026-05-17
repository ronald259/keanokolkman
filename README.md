# Keanu Kolkman — Privé Streamingplatform

Een Netflix/Apple TV+-achtig portfolio-platform voor Keanu Kolkman. Cinematic zwart met goud accent, beveiligd achter login, met admin-omgeving voor uploads.

> **Test-versie op Vercel.** Werkt out-of-the-box met seed-data. Voor echte uploads moet je Vercel Blob configureren.

---

## Stack

- **Next.js 15** (App Router, Server Actions, RSC)
- **TypeScript** + **Tailwind v4**
- **Auth:** HMAC-signed cookies, 2 wachtwoorden (bezoeker + admin)
- **Storage:** Vercel Blob (media) + JSON-file (metadata, in `/tmp` in productie)
- **Hosting:** Vercel (gratis Hobby plan voldoende voor test)

## Pagina's

| Route | Beschrijving |
|---|---|
| `/login` | Wachtwoord-login (cinematic background) |
| `/home` | Hero + carrousels (Nieuw, Films, Animaties, Foto's, Projecten, Uitgelicht) |
| `/films` / `/animaties` / `/fotos` / `/projecten` | Grid per categorie |
| `/media/[id]` | Detailpagina met video player of full-screen foto |
| `/admin` | Mediabibliotheek (alleen admin) |
| `/admin/upload` | 5-stappen upload-wizard |
| `/admin/edit/[id]` | Bewerken & verwijderen |
| `/logout` | Sessie wissen |

---

## Lokaal draaien

```bash
npm install
cp .env.example .env.local
# Bewerk .env.local met sterkere wachtwoorden + SESSION_SECRET
npm run dev
```

Open <http://localhost:3000>.

**Standaard wachtwoorden (.env.example):**
- Bezoeker: `keanu2026`
- Admin: `admin2026`

> Wijzig deze direct vóór je deployt naar Vercel.

---

## Deploy naar Vercel

### 1. Push de repo (al gedaan op deze branch)

### 2. Importeer in Vercel
1. Ga naar <https://vercel.com/new>
2. Importeer deze GitHub-repo
3. Framework wordt automatisch herkend (Next.js)
4. Klik op **Deploy**

### 3. Environment variables (Settings → Environment Variables)

| Variabele | Waarde | Verplicht |
|---|---|---|
| `SITE_PASSWORD` | Wachtwoord voor bezoekers | ja |
| `ADMIN_PASSWORD` | Wachtwoord voor Keanu (admin) | ja |
| `SESSION_SECRET` | Lange random string (min. 32 tekens) | ja |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | alleen voor echte uploads |

Genereer een sterke `SESSION_SECRET`:
```bash
openssl rand -base64 48
```

### 4. Vercel Blob aanzetten (voor uploads)

1. Vercel dashboard → je project → **Storage** → **Create Database** → **Blob**
2. De `BLOB_READ_WRITE_TOKEN` wordt automatisch als env-var toegevoegd
3. Re-deploy: **Deployments** → laatste → **⋯** → **Redeploy**

### 5. Custom domain (optioneel)
**Settings → Domains** → voeg het Strato-domein toe als CNAME naar `cname.vercel-dns.com`.

---

## Database / opslag

**Test-versie (huidig):**
- Metadata in `data/media.json` (lokaal) of `/tmp/keanu-media.json` (Vercel)
- ⚠ `/tmp` op Vercel is **ephemeer**: items die je via admin uploadt overleven geen redeploy of langere idle-periode

**Productie-upgrade (aanbevolen):**
Vervang `lib/store.ts` door Vercel Postgres of Neon. Schema:

```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL CHECK (category IN ('films','animaties','fotos','projecten')),
  media_type      TEXT NOT NULL CHECK (media_type IN ('video','image')),
  file_path       TEXT NOT NULL,
  thumbnail_path  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  sort_order      INT NOT NULL DEFAULT 0,
  featured        BOOLEAN NOT NULL DEFAULT false,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_category ON media(category) WHERE status = 'published';
CREATE INDEX idx_media_featured ON media(featured) WHERE status = 'published';
```

---

## Video-opslag — advies

| Optie | Kosten | Pro | Con |
|---|---|---|---|
| **Vercel Blob (huidig)** | $0,15/GB/mo + bandbreedte | Simpel, ingebakken | Geen adaptive streaming (HLS), traag bij grote bestanden |
| **Bunny Stream** ⭐ | ~€1/mo + €0,005/GB | HLS, wereldwijde CDN, automatische thumbnails | Externe service |
| **Cloudflare Stream** | $5/mo per 1000 min opslag | Sterke speler, ingebouwde DRM | Duurder bij veel uploads |
| **Vimeo Pro privé** | €20/mo | Mooie player | Duurst, minst controle |

Voor Keanu's filmwerk raad ik **Bunny Stream** aan zodra je meer dan ~30 minuten video hebt. Migratiestappen later: vervang `lib/upload.ts::uploadToBlob` door Bunny's API en gebruik hun HLS-player.

---

## Veiligheid

- ✅ Alle routes (behalve `/login`) zitten achter middleware-auth
- ✅ Cookies zijn `httpOnly`, `sameSite=lax`, `secure` in productie
- ✅ Sessie-tokens zijn HMAC-signed (`SESSION_SECRET`)
- ✅ Wachtwoord-vergelijking is constant-time (`timingSafeEqual`)
- ✅ Login heeft in-memory rate-limit (8 pogingen/min per proces)
- ✅ Upload valideert MIME-type, max 200 MB, sanitized filenames
- ✅ Server actions controleren admin-rol vóór elke wijziging
- ✅ React JSX escapet automatisch tegen XSS
- ⚠ Voor productie: upgrade naar individuele user-accounts met bcrypt hashes (zie schema hierboven)

---

## Mappenstructuur

```
.
├── app/
│   ├── (site)/              # routes achter auth
│   │   ├── layout.tsx       # navigatie + footer
│   │   ├── home/            # hero + carrousels
│   │   ├── films/ animaties/ fotos/ projecten/
│   │   ├── media/[id]/      # detail + player
│   │   └── admin/           # beheer + upload + edit
│   ├── login/               # publieke login
│   ├── logout/              # GET → sessie wissen
│   ├── api/health/          # health check
│   ├── layout.tsx
│   ├── globals.css          # Tailwind v4 + thema-tokens
│   └── page.tsx             # redirect /home of /login
├── components/
│   ├── Nav.tsx              # bovenbalk
│   ├── Hero.tsx             # cinematic hero
│   ├── Carousel.tsx         # horizontale rail
│   ├── MediaCard.tsx        # thumbnail card
│   └── CategoryGrid.tsx     # grid view
├── lib/
│   ├── auth.ts              # sessie + wachtwoord-verify
│   ├── store.ts             # CRUD op media.json
│   ├── upload.ts            # Vercel Blob + validatie
│   └── types.ts
├── data/
│   └── seed.json            # demo-content (9 items)
├── middleware.ts            # auth-gate
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Test-checklist

- [ ] `/` redirect naar `/login`
- [ ] Verkeerd wachtwoord → foutmelding, sessie blijft leeg
- [ ] Bezoekerswachtwoord → naar `/home`, geen Beheer-knop in nav
- [ ] Admin-wachtwoord → Beheer-knop verschijnt
- [ ] `/admin/upload` → 5-stappen wizard, foutmelding bij >200MB of verkeerd type
- [ ] Upload (met BLOB token) → verschijnt op `/home` en `/admin`
- [ ] Verbergen → item verdwijnt van `/home`, blijft in `/admin`
- [ ] Verwijderen → item weg overal
- [ ] Mobiel: navigatie + carrousels scrollen netjes

---

## Volgende stappen

1. **Echte database** (Vercel Postgres / Neon)
2. **Multi-user accounts** met bcrypt
3. **Bunny Stream** voor adaptive video streaming
4. **Automatische video-thumbnails** (ffmpeg in een Edge Function)
5. **Zoekfunctie** + filters
6. **Drag & drop sortering** in admin
7. **Kijkgeschiedenis** + "Verder kijken"-rij
8. **Custom logo** + branding
9. **Achtergrondvideo** in hero (autoplay muted loop)
10. **Privé-links per item** (token-based deeplink)
