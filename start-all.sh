#!/usr/bin/env sh
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if command -v docker >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    echo "Starting all services with docker-compose..."
    docker-compose up --build
  else
    echo "Starting all services with docker compose..."
    docker compose up --build
  fi
else
  echo "Error: Docker is not installed or not available in PATH."
  echo "Please install Docker Desktop or Docker Engine, then rerun this script."
  exit 1
fi
