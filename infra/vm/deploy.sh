#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$HOME/niar/plataforma}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "Diretorio de deploy nao encontrado: $ROOT_DIR" >&2
  exit 1
fi

cd "$ROOT_DIR"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "nvm nao encontrado em $NVM_DIR. Instale o nvm na VM antes de usar o deploy automatizado." >&2
  exit 1
fi

. "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm nao encontrado na VM. Instale o pnpm antes de usar o deploy automatizado." >&2
  exit 1
fi

if [ ! -f ".env.production" ]; then
  echo "Arquivo .env.production nao encontrado em $ROOT_DIR." >&2
  exit 1
fi

pnpm install --frozen-lockfile
pnpm prod:deploy
