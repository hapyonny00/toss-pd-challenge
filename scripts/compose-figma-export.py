#!/usr/bin/env python3
"""shell.html 네비게이션 레일 + 렌더된 앱 DOM을 flat HTML 하나로 합친다 (Figma html.to.design용)."""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL_PATH = os.path.join(ROOT, "shell.html")

EMBED_OVERRIDE = """
/* figma-export: shell 레일 + 임베디드 앱 (iframe 없이 flat) */
.viewcard .figma-embed { height: 100%; overflow: hidden; }
.viewcard .figma-embed > .app { height: 100%; min-height: 0; }
.viewcard .figma-embed #root,
.viewcard .figma-embed #root > main { height: 100%; max-width: none !important; margin: 0 !important; }
/* figma-export: 진입 애니메이션 최종 상태 고정 */
.animate-slidein,.animate-fadeup,.animate-expand,.enter,.reco.enter{
  animation:none!important;opacity:1!important;transform:none!important;max-height:none!important;}
"""


def extract_style(html: str) -> str:
    blocks = re.findall(r"<style[^>]*>(.*?)</style>", html, re.DOTALL | re.IGNORECASE)
    return "\n".join(blocks)


def extract_body_inner(html: str) -> str:
    m = re.search(r"<body[^>]*>(.*?)</body>", html, re.DOTALL | re.IGNORECASE)
    if not m:
        return ""
    inner = m.group(1)
    inner = re.sub(r"<script\b[^>]*>.*?</script>", "", inner, flags=re.DOTALL | re.IGNORECASE)
    inner = re.sub(r"<script\b[^>]*/>", "", inner, flags=re.IGNORECASE)
    return inner.strip()


def build_rail(active_view: str, theme: str) -> str:
    cal_on = " on" if active_view == "calendar" else ""
    chat_on = " on" if active_view == "chat" else ""
    theme_icon = "#n-sun" if theme == "dark" else "#n-moon"
    theme_label = "라이트 모드" if theme == "dark" else "다크 모드"
    return f"""  <nav class="rail">
    <div class="logo" role="img" aria-label="모임">
      <svg width="38" height="38" viewBox="0 0 30 30"><rect class="lg-sq" x="2" y="2" width="17" height="17" rx="6"/><circle class="lg-dot" cx="20" cy="20" r="8"/></svg>
    </div>
    <button class="fab" type="button" aria-label="회의 잡기"><svg class="ic"><use href="#n-plus"/></svg></button>
    <button class="item{cal_on}" type="button" aria-label="캘린더"><svg class="ic"><use href="#n-cal"/></svg><span class="lb">캘린더</span></button>
    <button class="item{chat_on}" type="button" aria-label="모임 챗"><svg class="ic"><use href="#n-chat"/></svg><span class="lb">모임 챗</span></button>
    <button class="item" type="button" aria-label="팀원 추가"><svg class="ic"><use href="#n-user-plus"/></svg><span class="lb">팀원 추가</span></button>
    <span class="sp"></span>
    <div class="foot">
      <button class="fbtn" type="button" aria-label="{theme_label}"><svg class="ic"><use href="{theme_icon}"/></svg></button>
      <div class="avatar">지</div>
    </div>
  </nav>"""


def compose(raw_app_html: str, note: str, active_view: str, theme: str) -> str:
    shell = open(SHELL_PATH, encoding="utf-8").read()
    shell_style = extract_style(shell)
    shell_body = extract_body_inner(shell)
    shell_svg_m = re.match(r"(<svg[^>]*>.*?</svg>)", shell_body, re.DOTALL)
    shell_svg = shell_svg_m.group(1) if shell_svg_m else ""

    app_style = extract_style(raw_app_html)
    app_body = extract_body_inner(raw_app_html)
    body_attr = f' data-theme="{theme}"' if theme == "dark" else ""

    return f"""<!DOCTYPE html>
<!-- {note} — Figma 임포트용 (네비게이션 레일 + 본문 flat, 스크립트 제거) -->
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{note}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
{shell_style}
{app_style}
{EMBED_OVERRIDE}
</style>
</head>
<body{body_attr}>
{shell_svg}
<div class="shell">
{build_rail(active_view, theme)}
  <div class="content">
    <div class="viewcard">
      <div class="figma-embed">
{app_body}
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""


def main() -> None:
    out_dir = sys.argv[1]
    jobs = [
        ("/tmp/raw-cal-light.html", "캘린더-메인.html", "캘린더 · 라이트 (기본 주간 뷰)", "calendar", "light"),
        ("/tmp/raw-cal-dark.html", "캘린더-다크모드.html", "캘린더 · 다크 모드", "calendar", "dark"),
        ("/tmp/raw-cal-reco.html", "캘린더-AI추천.html", "캘린더 · AI 추천 카드 상태", "calendar", "light"),
        ("/tmp/raw-chat.html", "모임챗.html", "모임 챗 · 3패널", "chat", "light"),
    ]
    for src, name, note, active, theme in jobs:
        raw = open(src, encoding="utf-8").read()
        html = compose(raw, note, active, theme)
        html = re.sub(r"\n{3,}", "\n\n", html)
        path = os.path.join(out_dir, name)
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  ✓ {name}: {os.path.getsize(path):,} bytes (레일 포함)")


if __name__ == "__main__":
    main()
