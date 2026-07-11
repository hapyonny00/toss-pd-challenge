#!/usr/bin/env bash
# figma-export/ 재생성 — 원본을 헤드리스 렌더 후 DOM을 덤프해 static self-contained HTML로 저장.
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

python3 - "$OUT" << 'PYEOF'
import re, os, sys
OUT = sys.argv[1]
JOBS = [
    ("/tmp/raw-cal-light.html", "캘린더-메인.html",   "캘린더 · 라이트 (기본 주간 뷰)"),
    ("/tmp/raw-cal-dark.html",  "캘린더-다크모드.html", "캘린더 · 다크 모드"),
    ("/tmp/raw-cal-reco.html",  "캘린더-AI추천.html",  "캘린더 · AI 추천 카드 상태"),
    ("/tmp/raw-chat.html",      "모임챗.html",         "모임 챗 · 3패널"),
]
OVERRIDE = ("<style>/* figma-export: 진입 애니메이션 최종 상태 고정 */"
            ".animate-slidein,.animate-fadeup,.animate-expand,.enter,.reco.enter{"
            "animation:none!important;opacity:1!important;transform:none!important;max-height:none!important;}</style>\n")
for src, name, note in JOBS:
    s = open(src, encoding="utf-8").read()
    s = re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.DOTALL|re.IGNORECASE)
    s = re.sub(r'<script\b[^>]*/>', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\n{3,}', '\n\n', s)
    banner = f"<!-- {note} — Figma 임포트/Cursor 편집용 static 스냅샷 (스크립트 제거) -->\n"
    s = re.sub(r'(<!DOCTYPE html>\s*)', r'\1' + banner, s, count=1, flags=re.IGNORECASE)
    s = s.replace("</head>", OVERRIDE + "</head>", 1)
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(s)
    print(f"  ✓ {name}: {os.path.getsize(os.path.join(OUT, name)):,} bytes")
PYEOF
echo "figma-export/ 재생성 완료"
