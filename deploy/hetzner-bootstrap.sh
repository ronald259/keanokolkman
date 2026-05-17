#!/usr/bin/env bash
# Bootstrap-script voor een verse Hetzner Cloud server (Ubuntu 24.04).
# Voer uit als root direct na het aanmaken van de server, óf gebruik
# het als cloud-init User-data bij het aanmaken (zonder de `set -e` regel
# en deze comments laat staan).
#
# Wat dit script doet:
#   1. Updates systeem en installeert basis-pakketten
#   2. Installeert Docker + Compose plugin
#   3. Maakt een non-root user "keanu" met sudo + docker rechten
#   4. Zet UFW firewall aan (alleen 22, 80, 443 open)
#   5. Installeert fail2ban tegen SSH brute-force
#   6. Maakt /opt/keanu klaar voor de app

set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

USER_NAME="${USER_NAME:-keanu}"
APP_DIR="${APP_DIR:-/opt/keanu}"

echo "▸ Systeem updaten…"
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates curl gnupg lsb-release \
  ufw fail2ban git unattended-upgrades

echo "▸ Docker installeren…"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "▸ Gebruiker '${USER_NAME}' aanmaken…"
if ! id "${USER_NAME}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${USER_NAME}"
  usermod -aG sudo,docker "${USER_NAME}"
  if [ -f /root/.ssh/authorized_keys ]; then
    mkdir -p /home/${USER_NAME}/.ssh
    cp /root/.ssh/authorized_keys /home/${USER_NAME}/.ssh/
    chown -R ${USER_NAME}:${USER_NAME} /home/${USER_NAME}/.ssh
    chmod 700 /home/${USER_NAME}/.ssh
    chmod 600 /home/${USER_NAME}/.ssh/authorized_keys
  fi
fi
echo "${USER_NAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-${USER_NAME}

echo "▸ SSH hardenen…"
sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

echo "▸ Firewall (UFW)…"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
yes | ufw enable

echo "▸ Fail2ban…"
systemctl enable --now fail2ban

echo "▸ Automatische security-updates…"
dpkg-reconfigure -fnoninteractive unattended-upgrades

echo "▸ App-directory voorbereiden…"
mkdir -p "${APP_DIR}"
chown -R "${USER_NAME}:${USER_NAME}" "${APP_DIR}"

cat <<EOF

✅ Klaar.

Volgende stappen:
  1. Log in als '${USER_NAME}':
       ssh ${USER_NAME}@<server-ip>
  2. Clone de repo in ${APP_DIR}:
       git clone <repo-url> ${APP_DIR}
       cd ${APP_DIR}
  3. Maak een .env aan (zie .env.example) en zet DOMAIN, ACME_EMAIL,
     SITE_PASSWORD, ADMIN_PASSWORD, SESSION_SECRET, DB_PASSWORD.
  4. Wijs je DNS A-record naar dit servers-IP.
  5. Start de stack:
       docker compose up -d --build
       docker compose run --rm app node /app/scripts/migrate.mjs
       docker compose run --rm app node /app/scripts/seed.mjs   # optioneel demo-content
  6. Open https://<jouw-domein> — Caddy regelt automatisch TLS.

EOF
