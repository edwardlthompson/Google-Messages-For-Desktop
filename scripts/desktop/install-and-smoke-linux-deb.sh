#!/usr/bin/env bash
# Install the newest local Google Messages .deb and smoke-test process + desktop metadata.
# Google account sign-in is NOT part of this smoke (HUMAN interactive afterward).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
UNINSTALL=0
HOLD_SECS="${SMOKE_HOLD_SECS:-10}"

usage() {
  cat <<'EOF'
Usage: install-and-smoke-linux-deb.sh [--uninstall]

  Finds the newest Google.Messages-v*-linux-*.deb under dist/ or electron/dist/,
  installs with sudo apt-get, checks desktop MimeType/StartupWMClass/SingleMainWindow,
  launches briefly under $DISPLAY (second launch must exit), then quits.
  Leaves the package installed unless
  --uninstall is passed.

Environment:
  SMOKE_HOLD_SECS  Seconds the process must stay alive (default: 10)
EOF
}

for arg in "$@"; do
  case "$arg" in
    --uninstall) UNINSTALL=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -z "${DISPLAY:-}" ]]; then
  echo "FAIL: DISPLAY is empty; need a graphical session for smoke launch" >&2
  exit 1
fi

# Non-interactive agent shells cannot read a sudo password from a TTY.
# Prefer an existing SUDO_ASKPASS; otherwise use zenity when available.
ensure_sudo() {
  if sudo -n true 2>/dev/null; then
    return 0
  fi
  if [[ -n "${SUDO_ASKPASS:-}" && -x "${SUDO_ASKPASS}" ]]; then
    sudo -A -v
    return
  fi
  if [[ ! -t 0 ]] && command -v zenity >/dev/null 2>&1; then
    local askpass
    askpass="$(mktemp -t gm-sudo-askpass.XXXXXX.sh)"
    cat >"$askpass" <<'ASK'
#!/usr/bin/env bash
zenity --password --title="sudo: Google Messages .deb" 2>/dev/null
ASK
    chmod 700 "$askpass"
    export SUDO_ASKPASS="$askpass"
    trap 'rm -f "'"$askpass"'"' EXIT
    sudo -A -v
    return
  fi
  sudo -v
}

pick_deb() {
  local newest="" newest_mtime=0 f m
  shopt -s nullglob
  for f in \
    "$ROOT/dist"/Google.Messages-v*-linux-*.deb \
    "$ROOT/electron/dist"/Google.Messages-v*-linux-*.deb
  do
    [[ -f "$f" ]] || continue
    m=$(stat -c %Y "$f" 2>/dev/null || echo 0)
    if (( m >= newest_mtime )); then
      newest_mtime=$m
      newest=$f
    fi
  done
  shopt -u nullglob
  if [[ -z "$newest" ]]; then
    echo "FAIL: no Google.Messages-v*-linux-*.deb under dist/ or electron/dist/" >&2
    exit 1
  fi
  printf '%s\n' "$newest"
}

DEB="$(pick_deb)"
echo "=== deb: $DEB ==="
dpkg-deb -I "$DEB" | head -n 40

PKG_NAME="$(dpkg-deb -f "$DEB" Package)"
PKG_VERSION="$(dpkg-deb -f "$DEB" Version)"
PKG_ARCH="$(dpkg-deb -f "$DEB" Architecture)"
echo "=== package: ${PKG_NAME} ${PKG_VERSION} (${PKG_ARCH}) ==="

# Stop a prior instance so install/replace and smoke are not racing.
if pgrep -x GoogleMessages >/dev/null 2>&1; then
  echo "=== stopping existing GoogleMessages ==="
  pkill -x GoogleMessages || true
  sleep 1
fi

echo "=== sudo apt-get install (enter password if prompted) ==="
ensure_sudo
sudo apt-get install -y "$DEB"

STATUS="$(dpkg-query -W -f='${Status}' "$PKG_NAME" 2>/dev/null || true)"
if [[ "$STATUS" != *"install ok installed"* ]]; then
  echo "FAIL: package $PKG_NAME not installed (status: ${STATUS:-missing})" >&2
  exit 1
fi
echo "OK   dpkg status: $STATUS"

BIN=""
for candidate in \
  "/usr/bin/GoogleMessages" \
  "/opt/Google Messages/GoogleMessages" \
  "/opt/google-messages-for-desktop/GoogleMessages" \
  "$(command -v GoogleMessages 2>/dev/null || true)"
do
  if [[ -n "$candidate" && -x "$candidate" ]]; then
    BIN="$candidate"
    break
  fi
done
if [[ -z "$BIN" ]]; then
  # Fall back: locate from package file list
  BIN="$(dpkg -L "$PKG_NAME" 2>/dev/null | grep -E '/GoogleMessages$' | head -n 1 || true)"
fi
if [[ -z "$BIN" || ! -x "$BIN" ]]; then
  echo "FAIL: GoogleMessages executable not found after install" >&2
  dpkg -L "$PKG_NAME" | head -n 80 >&2 || true
  exit 1
fi
echo "OK   binary: $BIN"

DESKTOP=""
for d in \
  "/usr/share/applications/com.edwardlthompson.google-messages.desktop" \
  "/usr/share/applications/google-messages-for-desktop.desktop" \
  "/usr/share/applications/GoogleMessages.desktop"
do
  if [[ -f "$d" ]]; then
    DESKTOP="$d"
    break
  fi
done
if [[ -z "$DESKTOP" ]]; then
  DESKTOP="$(dpkg -L "$PKG_NAME" 2>/dev/null | grep '\.desktop$' | head -n 1 || true)"
fi
if [[ -z "$DESKTOP" || ! -f "$DESKTOP" ]]; then
  echo "FAIL: .desktop file not found" >&2
  exit 1
fi
echo "OK   desktop: $DESKTOP"

if ! grep -q 'StartupWMClass=Google Messages' "$DESKTOP"; then
  echo "FAIL: StartupWMClass=Google Messages missing in $DESKTOP" >&2
  cat "$DESKTOP" >&2
  exit 1
fi
if ! grep -qi 'SingleMainWindow=true' "$DESKTOP"; then
  echo "FAIL: SingleMainWindow=true missing in $DESKTOP" >&2
  cat "$DESKTOP" >&2
  exit 1
fi
for scheme in sms smsto tel im; do
  if ! grep -Eq "x-scheme-handler/${scheme}" "$DESKTOP"; then
    echo "FAIL: MimeType missing x-scheme-handler/${scheme} in $DESKTOP" >&2
    exit 1
  fi
done
echo "OK   StartupWMClass + SingleMainWindow + sms/smsto/tel/im MimeTypes"

LOG="$(mktemp -t gm-linux-smoke.XXXXXX.log)"
echo "=== launch smoke (${HOLD_SECS}s) log: $LOG ==="
# shellcheck disable=SC2086
"$BIN" >"$LOG" 2>&1 &
PID=$!
sleep 2
if ! kill -0 "$PID" 2>/dev/null; then
  echo "FAIL: process exited within 2s (instant crash)" >&2
  cat "$LOG" >&2 || true
  exit 1
fi

# Second launch must hand off to the first process (single instance).
"$BIN" >/dev/null 2>&1 &
SECOND=$!
sleep 2
if kill -0 "$SECOND" 2>/dev/null; then
  echo "FAIL: second launch stayed running (pid $SECOND); expected one instance" >&2
  cat "$LOG" >&2 || true
  kill -KILL "$SECOND" 2>/dev/null || true
  exit 1
fi
echo "OK   second launch handed off to pid $PID"

sleep "$HOLD_SECS"
if ! kill -0 "$PID" 2>/dev/null; then
  echo "FAIL: process died before ${HOLD_SECS}s hold" >&2
  cat "$LOG" >&2 || true
  exit 1
fi
echo "OK   process $PID alive after ${HOLD_SECS}s"

kill -TERM "$PID" 2>/dev/null || true
# Wait up to 15s for clean exit
for _ in $(seq 1 15); do
  if ! kill -0 "$PID" 2>/dev/null; then
    break
  fi
  sleep 1
done
if kill -0 "$PID" 2>/dev/null; then
  echo "WARN: process did not exit on SIGTERM; sending SIGKILL"
  kill -KILL "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
  echo "FAIL: unclean quit" >&2
  cat "$LOG" >&2 || true
  exit 1
fi
wait "$PID" 2>/dev/null || true
echo "OK   graceful quit"

if [[ "$UNINSTALL" -eq 1 ]]; then
  echo "=== uninstall $PKG_NAME ==="
  ensure_sudo
  sudo apt-get remove -y "$PKG_NAME"
else
  echo "=== package left installed ($PKG_NAME $PKG_VERSION) ==="
  echo "Next (HUMAN): open Google Messages from the app menu and complete Google sign-in / QR pairing."
fi

echo "=== linux deb install + smoke PASSED ==="
rm -f "$LOG"
