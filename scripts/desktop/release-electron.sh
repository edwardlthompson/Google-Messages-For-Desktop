#!/usr/bin/env bash
# Build Electron desktop artifacts for the current OS (mac or linux) and copy to repo dist/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ELECTRON_DIR="$ROOT/electron"
cd "$ELECTRON_DIR"

SKIP_INSTALL="${1:-}"
VERSION="$(node -p "require('./package.json').version")"
PLATFORM="$(uname -s)"

echo "=== release:desktop (Electron) v${VERSION} on ${PLATFORM} ==="

if [[ "$SKIP_INSTALL" != "--skip-install" ]]; then
  echo "=== npm install ==="
  npm install
fi

case "$PLATFORM" in
  Darwin)
    echo "=== webpack + electron-builder (mac) ==="
    npm run package:mac
    ;;
  Linux)
    echo "=== webpack + electron-builder (linux) ==="
    npm run package:linux
    ;;
  *)
    echo "Unsupported platform for this script: $PLATFORM (use release-electron.ps1 on Windows)" >&2
    exit 1
    ;;
esac

mkdir -p "$ROOT/dist"
shopt -s nullglob
for f in dist/*; do
  [[ -f "$f" ]] || continue
  base="$(basename "$f")"
  case "$base" in
    *.dmg|*.zip|*.AppImage|*.deb|*.yml|*.yaml|*.blockmap)
      cp -f "$f" "$ROOT/dist/"
      echo "Copied $base -> $ROOT/dist/"
      ;;
  esac
done

echo "=== release:desktop complete ==="
ls -la "$ROOT/dist" | head -n 40
