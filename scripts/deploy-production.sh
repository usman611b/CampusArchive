#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${CAMPUSARCHIVE_APP_DIR:-/var/www/CampusArchive}"
API_PROCESS="${CAMPUSARCHIVE_API_PROCESS:-campusarchive-api}"

log() {
  printf '[deploy] %s\n' "$1"
}

cd "$APP_DIR"

if [[ ! -f backend/.env ]]; then
  echo "[deploy] backend/.env is missing; refusing to deploy." >&2
  exit 1
fi

if [[ ! -f frontend/.env.production ]]; then
  echo "[deploy] frontend/.env.production is missing; refusing to deploy." >&2
  exit 1
fi

log "Installing locked dependencies"
npm ci --no-audit --no-fund

log "Building shared, backend, and frontend workspaces"
npm run build

log "Validating Nginx configuration"
sudo nginx -t

log "Restarting the API through PM2"
pm2 restart "$API_PROCESS" --update-env
pm2 save

log "Reloading Nginx"
sudo systemctl reload nginx

log "Checking API health"
for attempt in {1..12}; do
  if curl --fail --silent --show-error http://127.0.0.1:4000/health >/dev/null; then
    log "Deployment completed successfully"
    exit 0
  fi

  if [[ "$attempt" -lt 12 ]]; then
    sleep 5
  fi
done

echo "[deploy] API health check failed after 60 seconds." >&2
pm2 logs "$API_PROCESS" --lines 30 --nostream >&2 || true
exit 1
