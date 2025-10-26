#!/usr/bin/env bash
# Convenience script to start the app locally.
# It will load .env (if present), create and migrate the DB, and run the server.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  echo "Loading .env"
  # export variables from .env for the duration of the script
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "Using PGUSER=${PGUSER:-$(whoami)} PGDATABASE=${PGDATABASE:-perdi_meu_pet_dev} PGHOST=${PGHOST:-localhost}"

MIX_ENV="${MIX_ENV:-dev}"
echo "Running mix ecto.create && mix ecto.migrate (MIX_ENV=$MIX_ENV)"
MIX_ENV="$MIX_ENV" mix ecto.create
MIX_ENV="$MIX_ENV" mix ecto.migrate

echo "Starting Phoenix (MIX_ENV=$MIX_ENV)"
MIX_ENV="$MIX_ENV" mix run --no-halt
