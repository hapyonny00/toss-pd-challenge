#!/usr/bin/env bash
# figma-export/ 재생성 — 원본을 헤드리스 렌더 후 shell 레일과 합쳐 static HTML로 저장.
# 사용: 리포지토리 루트에서  bash scripts/build-figma-export.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/figma-export"
PORT=5970
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUT"
( cd "$ROOT" && python3 -m http.server "$PORT" >/tmp/figexp-srv.log 2>&1 & echo $! > /tmp/figexp-srv.pid )
sleep 1
trap 'kill "$(cat /tmp/figexp-srv.pid)" 2>/dev/null || true' EXIT

render() { # url  outfile
  "$CHROME" --headless=new --disable-gpu --dump-dom --virtual-time-budget=8000 "$1" 2>/dev/null > "$2"
}

render "http://localhost:$PORT/oneui/app-calendar.html"             /tmp/raw-cal-light.html
render "http://localhost:$PORT/oneui/app-calendar.html?theme=dark"  /tmp/raw-cal-dark.html
render "http://localhost:$PORT/oneui/app-calendar.html?demo=reco"   /tmp/raw-cal-reco.html
render "http://localhost:$PORT/moim-chat/index.html"                /tmp/raw-chat.html

python3 "$ROOT/scripts/compose-figma-export.py" "$OUT"
echo "figma-export/ 재생성 완료 (네비게이션 레일 포함)"
