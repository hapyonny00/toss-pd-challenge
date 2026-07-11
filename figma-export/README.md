# Figma 임포트용 화면 (static HTML)

토스 PD 챌린지 프로토타입의 캘린더·모임 챗 화면을 **JS 실행 결과가 DOM에 구워진 self-contained HTML**로 내보낸 폴더입니다.
피그마로 가져가 편집하고, Cursor로 코드를 계속 수정할 수 있어요.

## 파일

| 파일 | 화면 |
|---|---|
| `캘린더-메인.html` | 캘린더 · 라이트 (기본 주간 뷰) |
| `캘린더-다크모드.html` | 캘린더 · 다크 |
| `캘린더-AI추천.html` | 캘린더 · AI 추천 카드 상태 (추천 3장은 우측 사이드바 하단) |
| `모임챗.html` | 모임 챗 3패널 (팀 프로필 · 조율 스레드 · 채팅 목록) |

각 파일은 외부 폰트(Pretendard CDN)와 프로필 이미지(pravatar) URL만 참조하고, 그 외 스타일·마크업은 전부 파일 안에 들어 있습니다. 인터랙션 스크립트는 제거돼 있어 **정적 스냅샷**이에요.

## 피그마로 가져가기 — html.to.design 플러그인

1. Figma에서 **html.to.design** 플러그인 설치 (무료)
2. 플러그인 실행 → **Import from code / Paste HTML** 탭
3. 이 폴더의 HTML 파일 내용을 붙여넣거나 파일 업로드 → Import
4. 편집 가능한 레이어(프레임·텍스트·벡터)로 변환됩니다

> URL 임포트로도 됩니다(라이브·상호작용 반영): 플러그인의 **Import from URL**에 아래 주소를 넣으세요.
> - 캘린더: `https://hapyonny00.github.io/toss-pd-challenge/oneui/app-calendar.html` (`?theme=dark`, `?demo=reco` 등)
> - 모임 챗: `https://hapyonny00.github.io/toss-pd-challenge/moim-chat/`

## Cursor로 계속 수정하기

- 이 export 파일은 **정적 스냅샷**이라 디자인만 빠르게 손볼 때 씁니다.
- **실제 인터랙션·로직을 이어서 개발**하려면 원본 소스를 여세요:
  - 캘린더: `../oneui/app-calendar.html` (단일 파일, HTML+CSS+JS)
  - 모임 챗: `../moim-chat/App.jsx` + `../moim-chat/index.html`
  - 셸(네비게이션 레일): `../shell.html`
- 원본을 수정한 뒤 이 폴더를 다시 만들려면 리포지토리 루트에서 `scripts/build-figma-export.sh`(있을 경우) 또는 헤드리스 렌더 → DOM 덤프 과정을 반복하면 됩니다.

## 디자인 시스템 (Dei 팔레트)

- 캔버스: 아이시 민트 `#D9EDF2` · 표면 흰색 · 크롬(레일·사이드바) 블랙 `#0B0B0C`
- Accent: 그린 `#2FB56B` · CTA 블랙 알약 · 하이라이트 민트 `#7EE29B`
- 파스텔 카드: 내 일정 핑크 `#F5C9EF` · 기획 옐로 · 디자인 퍼플 · 개발 민트
- 타이포: Pretendard (피그마에선 미설치 시 Noto Sans KR 등으로 대체)
