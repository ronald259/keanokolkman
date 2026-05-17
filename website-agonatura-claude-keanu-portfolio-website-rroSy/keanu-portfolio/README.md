# Keano Kolkman — Private Streaming Portfolio

Cinematic, Netflix-achtig portfolioplatform voor Keano Kolkman. Privé
beveiligd met wachtwoord, donker thema, neon-accent, horizontale carrousels,
hero-sectie en een eenvoudige adminomgeving voor uploads.

Deze map bevat fase 3 — het **klikbare HTML-prototype** (geen backend).
Het demo-prototype is volledig statisch (HTML + CSS + vanilla JS) en
framework-agnostisch. De backend volgt in fase 4 (zie roadmap onderaan).

---

## Snelle demo

Open `keanu-portfolio/index.html` direct in de browser, of serveer lokaal:

```bash
cd keanu-portfolio
python3 -m http.server 5173        # of: npx serve .
# open http://localhost:5173
```

Inloggen:

| Rol      | Code     | Toegang                  |
| -------- | -------- | ------------------------ |
| Bezoeker | `kijken` | home + categorieën + detail |
| Admin    | `keano`  | alles + /admin           |

Wachtwoorden zitten alleen voor demo in `assets/js/app.js` — in de
live versie komen ze server-side terecht (zie security-sectie).

---

## Pagina's

| URL                 | Beschrijving                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `/index.html`       | Loginpagina (Bezoeker / Admin tab)                                 |
| `/home.html`        | Cinematic hero + 6 carrousels (Nieuw, Uitgelicht, 4 categorieën)   |
| `/films.html`       | Films-overzicht (grid, zoek, sorteer)                              |
| `/animaties.html`   | Animaties-overzicht                                                |
| `/fotos.html`       | Foto's-overzicht (smallere portrait-kaarten)                       |
| `/projecten.html`   | Projecten-overzicht                                                |
| `/media.html?id=X`  | Detailpagina: hero met backdrop, info, video-player of foto-viewer |
| `/admin.html`       | Adminoverzicht — statistieken + tabel met filters                  |
| `/admin-upload.html`| 5-stappen uploadwizard (drop, details, thumb, categorie, publish)  |
| `/admin-edit.html?id=X` | Item bewerken                                                  |

---

## 1. Technisch plan (productie)

> Je gaf aan: **Hetzner** + **Vimeo Pro (private)** + 1 admin + 1 bezoekers-
> wachtwoord + futuristisch neon design. Op basis daarvan:

### Aanbevolen stack (Stack B — recommended)

| Laag         | Keuze                                                     |
| ------------ | --------------------------------------------------------- |
| Hosting      | **Hetzner Cloud CX22** (€4,51/mnd, 2 vCPU, 4 GB, 40 GB SSD, Falkenstein/Helsinki) |
| OS           | Ubuntu 24.04 LTS                                          |
| Webserver    | Caddy (auto-HTTPS) of Nginx + certbot                     |
| App-runtime  | Node.js 22 + **Next.js 14** (App Router)                  |
| Database     | **PostgreSQL 16** (lokaal of Hetzner Managed)             |
| Sessies      | HttpOnly cookies, HMAC-getekend, 30 dagen                 |
| Auth         | iron-session (of Lucia)                                   |
| Video        | **Vimeo Pro** privé — embed via Player SDK                |
| Foto's       | Lokale opslag op VPS (40 GB voldoende) + Sharp voor thumbs |
| Backup       | Hetzner Storage Box (€3,49 voor 1 TB)                     |

**Waarom Next.js i.p.v. PHP?** De repo bevat al een Next.js project
(`/src`). Op een Hetzner VPS draait Node.js prima — geen reden voor
shared-hosting compromises zoals bij Strato. Bovendien past het bij de
visuele animaties en server-actions die deze interface verdient.

### Alternatief (Stack A — als je echt shared wilt)

Hetzner biedt ook **Hetzner Webhosting (Level 4+)** met PHP 8 + MySQL,
SSH, 100 GB opslag. Werkt prima maar je verliest server-actions en SSR
zonder veel winst. Aanbevolen alleen als je geen VPS wilt beheren.

| Laag         | Keuze                                                     |
| ------------ | --------------------------------------------------------- |
| Hosting      | Hetzner Webhosting Level 4 (€4,99/mnd, 100 GB, PHP 8.3)   |
| Stack        | PHP 8.3 + MySQL 8 + slim-template (vanilla, geen framework) |
| Sessies      | PHP sessions met `session.cookie_httponly=1`              |
| Video        | Vimeo Pro embed                                           |

De HTML/CSS/JS in deze demo is op te plakken op **beide** stacks —
alleen de auth-laag en upload-endpoints verschillen.

---

## 2. Risico's & beperkingen

| Risico                              | Mitigatie                                              |
| ----------------------------------- | ------------------------------------------------------ |
| Wachtwoord lekt (gedeeld bezoekers) | Tijdelijke toegangslinks, IP rate limit, log poging.   |
| Brute-force op login                | Token bucket (5 pogingen / 15 min), CAPTCHA na 3 fouts |
| Vimeo embed te vinden via DOM       | Vimeo "Hide from Vimeo.com" + domain whitelist op embed |
| Grote video-uploads via webformulier| Direct vanuit admin uploaden naar Vimeo (Upload API),  |
|                                     | of resumable upload (tus.io) i.p.v. multipart.         |
| Hetzner VPS down                    | UptimeRobot ping + nightly DB-dump → Storage Box       |
| XSS via beschrijvingen              | Server-side escapen + DOMPurify bij rich text          |
| Onbeveiligde directory listing      | `autoindex off` (Nginx) of `Options -Indexes` (.htaccess) |
| AVG / privacy bezoekersgegevens     | Geen tracking, geen cookies behalve sessie.            |

---

## 3. Mappenstructuur (productie — Next.js variant)

```
keanu-portfolio/                  ← deze map blijft voor de HTML-demo
website/                          ← productiebuild (volgende fase)
├── app/
│   ├── (public)/login/page.tsx
│   ├── (gated)/
│   │   ├── layout.tsx            # vereist sessie
│   │   ├── home/page.tsx
│   │   ├── films/page.tsx
│   │   ├── animaties/page.tsx
│   │   ├── fotos/page.tsx
│   │   ├── projecten/page.tsx
│   │   └── media/[id]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx            # vereist admin-rol
│   │   ├── page.tsx              # overzicht
│   │   ├── upload/page.tsx       # wizard
│   │   └── edit/[id]/page.tsx
│   └── api/
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       ├── media/route.ts        # GET list · POST create
│       ├── media/[id]/route.ts   # GET · PATCH · DELETE
│       └── vimeo/sign/route.ts   # tijdelijk upload-token
├── lib/
│   ├── auth.ts                   # iron-session
│   ├── db.ts                     # Postgres pool
│   ├── vimeo.ts                  # Vimeo API wrapper
│   ├── rate-limit.ts
│   └── image.ts                  # Sharp thumbnails
├── components/                   # ui (carousel, card, hero, …)
├── public/
│   ├── thumbnails/               # gegenereerde 16:9 + 3:4 versies
│   └── photos/                   # originelen achter login
└── data/
    └── uploads/                  # buiten public webroot
```

---

## 4. Database (Postgres / MySQL — agnostisch)

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,    -- argon2id of bcrypt cost 12+
  role          VARCHAR(16) NOT NULL DEFAULT 'visitor', -- admin | visitor
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id             SERIAL PRIMARY KEY,
  slug           VARCHAR(128) UNIQUE NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  category       VARCHAR(24) NOT NULL,    -- films | animaties | fotos | projecten
  media_type     VARCHAR(24) NOT NULL,    -- video | photo
  vimeo_id       VARCHAR(32),             -- nullable; alleen bij video
  file_path      VARCHAR(255),            -- lokale path (alleen foto)
  thumb_path     VARCHAR(255) NOT NULL,
  backdrop_path  VARCHAR(255) NOT NULL,
  year           SMALLINT,
  duration       VARCHAR(32),             -- '12:42' of '8 beelden'
  tags           TEXT[],                  -- of JSON in MySQL
  status         VARCHAR(16) NOT NULL DEFAULT 'draft', -- published | draft | hidden
  featured       BOOLEAN NOT NULL DEFAULT false,
  sort_order     INT NOT NULL DEFAULT 0,
  allow_download BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX media_category_idx ON media (category, status, sort_order);
CREATE INDEX media_featured_idx ON media (featured) WHERE featured = true;

CREATE TABLE login_attempts (
  ip          INET NOT NULL,
  attempted   TIMESTAMPTZ NOT NULL DEFAULT now(),
  success     BOOLEAN NOT NULL
);
CREATE INDEX login_attempts_ip_idx ON login_attempts (ip, attempted DESC);
```

Twee user-rijen volstaan voor MVP:
1. `keano` / role `admin`
2. `visitor` / role `visitor` (gedeelde toegang)

---

## 5. Video-opslag advies

**Conclusie: Vimeo Pro private embed is voor jou ideaal.** €240/jaar
maar je krijgt:

- Adaptive bitrate streaming uit hun CDN (snel wereldwijd)
- Domein-whitelist (alleen jouw site mag embedden)
- "Hide from Vimeo.com" zodat de video niet vindbaar is
- Geen videostorage of bandbreedte op je VPS
- Player customisation via `&color=00f0ff&dnt=1`

**Alternatieven** als je later goedkoper wilt:

| Optie              | Prijs (richt)  | Voor wie?                                      |
| ------------------ | -------------- | ---------------------------------------------- |
| Bunny Stream       | $0.005/GB+CDN  | Goedkoopst, eigen player skin, technischer     |
| Cloudflare Stream  | $5/1000 min    | Beste DRM en signed URLs                       |
| Lokaal op Hetzner  | 40 GB gratis   | Alleen voor korte clips, geen adaptive bitrate |

**Performance-tips**:

- Thumbnails altijd in 2 sizes (640w voor carrousel, 1920w voor backdrop)
- WebP + JPEG fallback, lazy loading (al ingebouwd via `loading="lazy"`)
- Vimeo iframe pas insluiten ná klik op play (zo werkt deze demo al)
- `preconnect` naar `player.vimeo.com` en `i.vimeocdn.com` in `<head>`

---

## 6. Installatie op Hetzner Cloud (Stack B — productie)

```bash
# 1. Server aanmaken
hcloud server create --type cx22 --image ubuntu-24.04 \
  --location nbg1 --name keano-stream --ssh-key keano

# 2. Inloggen + basis
ssh root@<ip>
adduser keano && usermod -aG sudo keano
ufw allow OpenSSH && ufw allow 80,443/tcp && ufw enable

# 3. Stack installeren
apt update && apt install -y curl postgresql nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pnpm pm2

# 4. Database
sudo -u postgres psql -c "CREATE USER keano WITH PASSWORD '...';"
sudo -u postgres psql -c "CREATE DATABASE keano_stream OWNER keano;"

# 5. Project deployen
git clone <repo> /home/keano/app
cd /home/keano/app/website
cp .env.example .env.local         # vul DATABASE_URL, ADMIN_PASS_HASH, VIMEO_TOKEN
pnpm install && pnpm build
pm2 start "pnpm start" --name keano-stream && pm2 save

# 6. HTTPS (Caddy is nóg simpeler)
certbot --nginx -d streaming.keano.nl
```

### Reverse proxy (Nginx)

```nginx
server {
  server_name streaming.keano.nl;
  client_max_body_size 2g;        # uploads tot 2 GB
  location / { proxy_pass http://127.0.0.1:3000; }
  # /uploads niet exposeren — directory listing uit
  location /uploads/ { deny all; return 404; }
}
```

### .htaccess (alleen Stack A — Hetzner Webhosting)

```apache
Options -Indexes
<Files ".env">
  Require all denied
</Files>
RewriteEngine On
RewriteRule ^uploads/ - [F,L]
```

---

## 7. Testinstructies

```bash
# Lokaal (demo)
cd keanu-portfolio && python3 -m http.server 5173
```

**Manuele test-checklist (demo):**

- [ ] `/index.html` opent, kan **niet** naar `/home.html` zonder login
- [ ] Bezoekerscode `kijken` → komt op /home, geen "Admin" knop
- [ ] Admincode `keano` → komt op /admin, ziet wel "Admin" knop in header
- [ ] Hero op /home toont "The Last Frame" met backdrop
- [ ] Carrousels scrollen horizontaal, pijl-knoppen verschijnen bij hover
- [ ] /films, /animaties, /fotos, /projecten tonen alle items per categorie
- [ ] Zoekveld filtert direct, sorteer-chips werken
- [ ] /media.html?id=neon-rain → toont hero + zijbalk met meta + player
- [ ] Klik op play → Vimeo iframe laadt in (op échte Vimeo ID werkt het)
- [ ] /admin → tabel met statussen, filters werken, edit en delete knoppen
- [ ] /admin-upload → 5 stappen, drop een afbeelding, zie preview + progress
- [ ] Mobiel (≤ 640px): nav verbergt, hero blijft leesbaar, knoppen blijven groot
- [ ] Uitloggen rechtsboven → terug naar login

---

## 8. Security (productieversie)

- **Wachtwoorden**: Argon2id (memory: 19 MB, iterations: 2, parallelism: 1)
- **Sessie**: iron-session, `httpOnly` + `secure` + `sameSite=lax`, 30 dagen
- **CSRF**: dubbele cookie pattern op alle POST/PATCH/DELETE
- **CSP**: `default-src 'self'; img-src 'self' i.picsum.photos i.vimeocdn.com data:; frame-src https://player.vimeo.com; script-src 'self'`
- **Rate limit**: 5 login pogingen per IP per 15 min, dan 1 uur lock
- **Bestandsuploads**: MIME-check server-side (`finfo`/`file-type` npm), naam saneren (`slugify`), buiten public webroot opslaan, alleen serveren via gated route
- **Toegestane types**: video `mp4, mov, webm` · afbeelding `jpg, jpeg, png, webp`
- **Max upload**: 2 GB; voor video gebruik **resumable upload** (tus.io of Vimeo Upload API rechtstreeks vanuit de browser)

---

## 9. Wat de bezoeker / Keano zelf doet

**Bezoeker** (1 wachtwoord):
1. Open `streaming.keano.nl`
2. Voer code in
3. Bekijk alles

**Keano (admin)**:
1. Log in als admin (eigen wachtwoord)
2. Klik "Nieuw item"
3. Sleep video of foto in dropzone
4. Vul titel + beschrijving in
5. Kies thumbnail (auto of eigen)
6. Kies categorie
7. Markeer "Uitgelicht" als hij op de homepage moet
8. Publiceer

---

## 10. Roadmap / volgende stappen

| Fase | Onderwerp                                                     | Status |
| ---- | ------------------------------------------------------------- | ------ |
| 1    | Technische haalbaarheid (Hetzner-onderzoek)                   | ✓      |
| 2    | Architectuurvoorstel                                          | ✓      |
| 3    | Klikbaar HTML-prototype                                       | **✓ deze build** |
| 4    | MVP build (Next.js + Postgres + Vimeo)                        | open   |
| 5    | Optimalisatie (thumbnails, mobiel, security audit)            | open   |
| 6    | Live op `streaming.keano.nl`                                  | open   |

### Concrete acties die ik nodig heb van Keano

1. **Domein** — registreer (.nl ~€8/jr) en zet DNS A-record naar Hetzner VPS IP
2. **Vimeo Pro abonnement** — €240/jaar, geef mij toegang als developer
3. **Foto** — 1 high-res still die we als hero-backdrop gebruiken
4. **Logo-keuze** — bevestig of het type-logo "KEANO KOLKMAN" in de demo de juiste richting is, of dat we een aparte mark/illustratie willen
5. **Wachtwoorden** — wat wordt het admin-wachtwoord en wat wordt het bezoekerswachtwoord (mag later wijzigen)
6. **Eerste 5 items** — film(s)/foto's klaar om te uploaden zodra het platform live is

---

## Optionele uitbreidingen (later)

- Drag & drop sortering in admin (SortableJS)
- "Verder kijken" / kijkgeschiedenis (localStorage + later DB)
- Privé-links per item (signed URLs, vervaltijd 7 dagen)
- Tags-filter en cross-tag zoeken
- Automatisch thumbnail genereren uit Vimeo via API
- Multi-user uitbreiding (familie/klanten met eigen logins)
- Achtergrondvideo in hero (Vimeo silent loop)

---

_Demo gebruikt placeholderbeelden van `picsum.photos`. Bij echte build
worden Keano's eigen stills geladen vanuit Vimeo (thumbnail API) of
lokaal opgeslagen JPG's._
