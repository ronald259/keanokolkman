# Keanu Kolkman — Privé Streamingplatform

Een Netflix/Apple TV+-achtig portfolio-platform. Cinematic zwart met goud, achter login, met eigen admin/upload-omgeving. **Productie-deploy op Hetzner Cloud.**

---

## Stack

| Laag | Component |
|---|---|
| App | Next.js 15 (App Router, Server Actions, RSC) |
| Taal | TypeScript |
| Styling | Tailwind v4 |
| Auth | HMAC-signed cookies + middleware-gate |
| Database | PostgreSQL 16 |
| Media | Lokale filesystem-volume, auth-gated streaming met HTTP Range |
| Reverse proxy / TLS | Caddy 2 (automatische Let's Encrypt) |
| Runtime | Docker Compose op Hetzner Cloud (Ubuntu 24.04) |

## Mappenstructuur

```
.
├── app/                     # Next.js routes
│   ├── (site)/              # achter auth: home, films, animaties, fotos, projecten, media, admin
│   ├── login/  logout/      # auth in/uit
│   └── api/
│       ├── files/[...key]/  # auth-gated media-stream (Range support)
│       └── health/
├── components/              # Hero, Carousel, MediaCard, Nav, CategoryGrid
├── lib/                     # auth, db (pg pool), store (DAO), upload, types
├── data/
│   ├── seed.json            # demo content
│   └── uploads/             # (volume) media op productie
├── db/migrations/           # SQL migrations
├── scripts/                 # migrate.mjs, seed.mjs
├── deploy/                  # hetzner-bootstrap.sh
├── Dockerfile               # multi-stage build → standalone Next bundle
├── docker-compose.yml       # app + db + caddy
├── Caddyfile                # reverse proxy + TLS
├── middleware.ts            # auth-gate
└── package.json
```

## Pagina's

| Route | Doel |
|---|---|
| `/login` | Wachtwoord-login |
| `/home` | Hero + carrousels |
| `/films` `/animaties` `/fotos` `/projecten` | Grids per categorie |
| `/media/[id]` | Detail + player |
| `/admin` | Mediabibliotheek |
| `/admin/upload` | 5-stappen upload-wizard |
| `/admin/edit/[id]` | Bewerken / verwijderen |
| `/api/files/[…]` | Auth-gated stream (Range) |

---

## Productie-deploy op Hetzner Cloud

### 1. Server aanmaken

In de [Hetzner Cloud Console](https://console.hetzner.cloud/):

- **Type:** CPX21 (3 vCPU, 4 GB RAM, 80 GB SSD) — ~€5/mnd. Voor grotere mediabibliotheken: CPX31 (160 GB).
- **OS:** Ubuntu 24.04 LTS
- **Locatie:** Nuremberg of Helsinki
- **SSH-key:** voeg jouw publieke key toe
- **Firewall:** Hetzner-firewall is optioneel — UFW wordt door het script geconfigureerd

> Voor groot videowerk: koppel later een **Hetzner Storage Box** of mount **Hetzner Object Storage** op `/data/uploads`.

### 2. DNS

In de DNS-instellingen van je domein:
- A-record: `portfolio.keanu.nl` → `<server-IP>`
- (optioneel) AAAA-record voor IPv6

### 3. Bootstrap de server

Eenmalig als root op de nieuwe server:

```bash
ssh root@<server-ip>
curl -fsSL https://raw.githubusercontent.com/ronald259/keanokolkman/claude/keanu-portfolio-website-04SXM/deploy/hetzner-bootstrap.sh -o /root/bootstrap.sh
bash /root/bootstrap.sh
```

Dit script:
- Installeert Docker + Compose plugin
- Maakt user `keanu` (sudo + docker)
- Hardent SSH (geen root-login met wachtwoord, geen password auth)
- Zet UFW firewall (alleen 22, 80, 443)
- Installeert fail2ban en unattended-upgrades

### 4. App uitrollen

```bash
ssh keanu@<server-ip>
cd /opt/keanu
git clone https://github.com/ronald259/keanokolkman.git .
git checkout claude/keanu-portfolio-website-04SXM

cp .env.example .env
# vul alle waarden in (zie hieronder)
nano .env

docker compose up -d --build
docker compose run --rm app node /app/scripts/migrate.mjs
docker compose run --rm app node /app/scripts/seed.mjs    # optioneel — vult demo-content
```

Bezoek `https://portfolio.keanu.nl` — Caddy regelt TLS automatisch.

### 5. Env-vars (`.env` op de server)

| Variabele | Voorbeeld | Toelichting |
|---|---|---|
| `DOMAIN` | `portfolio.keanu.nl` | Domein dat naar deze server wijst |
| `ACME_EMAIL` | `keanu@example.nl` | Voor Let's Encrypt-meldingen |
| `SITE_PASSWORD` | `…` | Wachtwoord voor bezoekers |
| `ADMIN_PASSWORD` | `…` | Wachtwoord voor Keanu (admin) |
| `SESSION_SECRET` | (lang & random) | `openssl rand -base64 48` |
| `DB_PASSWORD` | (lang & random) | Postgres wachtwoord |

### 6. Updates uitrollen

```bash
ssh keanu@<server-ip>
cd /opt/keanu
git pull
docker compose up -d --build
docker compose run --rm app node /app/scripts/migrate.mjs
```

---

## Lokaal ontwikkelen

```bash
# Postgres draaien (lokaal of via Docker):
docker run -d --name keanu-pg -e POSTGRES_PASSWORD=devpass -e POSTGRES_USER=keanu -e POSTGRES_DB=keanu -p 5432:5432 postgres:16-alpine

cp .env.example .env.local
# In .env.local:
#   DATABASE_URL=postgres://keanu:devpass@localhost:5432/keanu
#   UPLOAD_DIR=./data/uploads

npm install
npm run migrate
npm run seed
npm run dev
```

Open http://localhost:3000. Standaard wachtwoorden (uit `.env.example`): bezoeker `verander-mij`, admin `verander-mij-ook` — wijzig deze.

---

## Beveiliging

- ✅ Hele site achter middleware-auth (alleen `/login` en `/api/health` publiek)
- ✅ HttpOnly, SameSite=Lax, Secure cookies in productie
- ✅ HMAC-signed sessie-tokens (constant-time verify)
- ✅ In-process login rate-limit (8 pogingen/min)
- ✅ Server actions controleren admin-rol vóór elke mutatie
- ✅ Uploads: MIME-whitelist (mp4/mov/webm/jpg/png/webp), max 500 MB, gesanitized filenames, random prefix
- ✅ Media-streaming alleen achter sessie-cookie; path-traversal voorkomen
- ✅ Caddy: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- ✅ Postgres niet publiek bereikbaar (intern Docker-network)
- ✅ SSH hardening, UFW, fail2ban, unattended-upgrades (via bootstrap-script)
- ⚠ Voor multi-user: voeg een users-tabel + bcrypt toe (schema ligt al klaar in `001_init.sql`)

---

## Video-opslag — schaling

Bij beperkte hoeveelheid video (<50 GB) is de lokale `/data/uploads` op de Hetzner Cloud server prima. Voor meer:

| Volume | Aanbevolen |
|---|---|
| < 50 GB | Server-disk (CPX21 met 80 GB) |
| 50–500 GB | **Hetzner Storage Box** (€3,81/mnd voor 1 TB) — mount via CIFS/SMB op `/data/uploads` |
| > 500 GB of HLS gewenst | **Bunny Stream** (~€1/mnd + €0,005/GB) — vervang `lib/upload.ts` om naar Bunny te uploaden en gebruik hun HLS-player |

---

## Test-checklist

- [ ] `/` zonder cookie → redirect naar `/login`
- [ ] Verkeerd wachtwoord → foutmelding
- [ ] Bezoekerswachtwoord → naar `/home`, geen Beheer-knop
- [ ] Admin-wachtwoord → Beheer-knop verschijnt
- [ ] Upload-wizard: foutmelding bij verkeerd type / >500 MB
- [ ] Na upload: item zichtbaar op `/home` en `/admin`
- [ ] Video op `/media/[id]`: scrubbar dankzij Range-streaming
- [ ] `/api/files/...` zonder cookie → 401
- [ ] Verbergen → weg van `/home`, blijft op `/admin`
- [ ] Verwijderen → weg overal
- [ ] Mobiel: navigatie + carrousels werken

---

## Volgende stappen

1. Hetzner Storage Box mounten op `/data/uploads` zodra video's groeien
2. Bunny Stream-koppeling voor adaptive HLS-streaming
3. Multi-user accounts (bcrypt, users-tabel bestaat al)
4. Automatische video-thumbnails via ffmpeg
5. Zoekfunctie + filters
6. Drag & drop sortering in admin
7. "Verder kijken" rij + kijkgeschiedenis
8. Privé-links per item (token-based deeplink)
9. Backup-strategie: dagelijkse `pg_dump` + rsync van `/data/uploads` naar Storage Box
10. Monitoring: Uptime Kuma of Hetzner native metrics
