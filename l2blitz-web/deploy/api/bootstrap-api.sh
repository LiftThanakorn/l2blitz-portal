#!/usr/bin/env bash
set -euo pipefail
umask 077
NODE_VERSION="v24.22.2"
NODE_TAR="node-${NODE_VERSION}-linux-x64.tar.xz"
APP="/opt/l2blitz-api"
ARCHIVE="/tmp/l2blitz-api-20261030.tar.gz"
if [[ ! -f "$ARCHIVE" ]]; then echo "Missing API package" >&2; exit 1; fi
if [[ -e "$APP" ]]; then echo "Refusing to overwrite existing API directory" >&2; exit 1; fi
if [[ ! -x /opt/node24/bin/node ]]; then
  cd /tmp
  curl -fsSLo SHASUMS256.txt "https://nodejs.org/dist/$NODE_VERSION/SHASUMS256.txt"
  curl -fsSLo "$NODE_TAR" "https://nodejs.org/dist/$NODE_VERSION/$NODE_TAR"
  grep -F " $NODE_TAR" SHASUMS256.txt | sha256sum -c -
  install -d -m 0755 /opt/node24
  tar -xJf "$NODE_TAR" --strip-components=1 -C /opt/node24
fi
/opt/node24/bin/node --version
mkdir -m 0755 "$APP"
tar -xzf "$ARCHIVE" -C "$APP"
cd "$APP"
export PATH="/opt/node24/bin:$PATH"
npm ci --omit=dev --no-audit --no-fund --ignore-scripts
chown -R root:root "$APP"
chmod -R o-rwx "$APP"
chmod -R g+rX "$APP"
if ! id -u l2blitz >/dev/null 2>&1; then
  useradd -r -s /usr/sbin/nologin -d /nonexistent l2blitz
fi
chgrp -R l2blitz "$APP"
install -d -m 0750 -o root -g l2blitz /etc/l2blitz
existing=$(mysql -N -e "SELECT COUNT(*) FROM mysql.user WHERE user='l2blitz_portal_ro' AND host='127.0.0.1'")
if [[ "$existing" != "0" ]]; then echo "Existing read-only account found; aborting without modification" >&2; exit 1; fi
db_password=$(openssl rand -hex 32)
mysql <<SQL
CREATE USER 'l2blitz_portal_ro'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY '$db_password';
GRANT SELECT ON l2jmobiush5.characters TO 'l2blitz_portal_ro'@'127.0.0.1';
GRANT SELECT ON l2jmobiush5.clan_data TO 'l2blitz_portal_ro'@'127.0.0.1';
GRANT SELECT ON l2jmobiush5.olympiad_nobles TO 'l2blitz_portal_ro'@'127.0.0.1';
GRANT SELECT ON l2jmobiush5.heroes TO 'l2blitz_portal_ro'@'127.0.0.1';
GRANT SELECT ON l2jmobiush5.castle TO 'l2blitz_portal_ro'@'127.0.0.1';
SQL
env_file="/etc/l2blitz/api.env"
cat > "$env_file" <<ENV
NODE_ENV=production
HOST=127.0.0.1
PORT=4000
DB_ENABLE=true
USE_DEV_FIXTURES=false
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=l2blitz_portal_ro
DB_PASSWORD=$db_password
DB_NAME=l2jmobiush5
STATUS_CHECK_ENABLE=true
STATUS_CHECK_HOST=127.0.0.1
LOGIN_STATUS_PORT=2106
GAME_STATUS_PORT=7777
ENV
chmod 0640 "$env_file"
chown root:l2blitz "$env_file"
unset db_password
echo "Node and API installed. Database account: read-only on 5 public-data tables."
