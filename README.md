# 회의 잡기 — Toss PD Challenge 2026

6명이 다음 주까지 1시간 회의를 잡는 경험. 핵심 문제 정의:
**일정 조율의 진짜 고통은 빈 시간 찾기가 아니라, 모두가 안 될 때 '누굴 포기할지'를 주최자가 혼자·미안하게 떠안는 것.**

## 실행

```bash
npm install
npm run dev   # http://localhost:5941
```

React + Vite. 앱인토스에는 등록하지 않으므로 `create-ait-app`/`granite.config.ts`/콘솔 업로드 과정은 없고,
**일반 웹 프로젝트**로 TDS mobile만 가져와 씁니다.

## v3: 실제 TDS mobile 적용 (2026-07-04)

토스가 공개한 [TDS mobile](https://tossmini-docs.toss.im/tds-mobile/start/) 패키지를 그대로 설치해 썼습니다.
v2(순수 CSS로 TDS 문법을 흉내낸 버전)를 실제 컴포넌트로 교체한 것이 핵심 차이입니다.

- **`@toss/tds-mobile`**: Button, Badge, List/ListRow, TextButton 등 실제 프로덕션 컴포넌트.
- **`@toss/tds-colors`**: 실제 시맨틱 컬러 토큰(grey/blue/red/orange/green 램프 + white).
- **`TDSMobileProvider`**: 앱 최상단에서 `useUserAgent()`로 브라우저 컨텍스트를 채워 감싼다 (`src/main.tsx`).
- 이 프로젝트는 토스 앱 웹뷰가 아니라 **일반 브라우저**에서 여는 프로토타입이라, `@toss/tds-mobile-ait`(앱인토스 전용 오버레이 확장)는 설치만 하고 실제로는 쓰지 않는다.

### 앱인토스 AI 바이브 코딩 가이드를 참고해 재정리한 것

[AI 바이브 코딩 튜토리얼](https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html)의 구조(React + TypeScript + TDS, 화면 단위 폴더, AI에게 화면 id로 지시)를 따르되, **앱인토스 등록·배포 단계(`create-ait-app`, `granite.config.ts`, 콘솔 업로드, ait 빌드)는 이 프로젝트에 해당하지 않아 제외**했습니다. 이 프로젝트는 웹 프로토타입 제출물입니다.

- `index.html` + `src/` 표준 Vite React 구조로 재편.
- 화면을 `src/screens/*.tsx`로 분리, 공용 조각은 `src/components/`.
- 캘린더 로직은 `src/lib/calendar.ts`로 순수 함수 분리 (Google/Outlook/ICS 실동작 유지).
- 과거 v1(모바일 네이티브 HTML)·v2(웹 반응형 HTML, CSS로 TDS 문법 흉내)는 `archive/`에 보관.

## 구조

```
src/
  main.tsx            TDSMobileProvider(userAgent) 부트스트랩
  App.tsx             라우터(해시) + 폰 프레임/설계 노트 셸 + 토스트
  rationale.ts         화면별 설계 노트 (데스크톱 레일에 표시)
  data.ts              참석자·주소록 더미 데이터
  types.ts             ScreenProps 타입
  lib/calendar.ts       다음 주 날짜 계산 · Google/Outlook/ICS 내보내기
  components/
    ui.tsx              Content/Nav/Intro/Callout 등 화면 공용 조각
    EventCard.tsx        캘린더 이벤트 카드 (제목 인라인 수정 · 알림 칩)
    WeekView.tsx          주간 뷰 (이벤트 슬롯인 모먼트)
    CalendarExport.tsx    개인 캘린더 담기 버튼 3종
  screens/
    flow.tsx             홈 · 만들기 · 동료 추가 · 조율 중 · 동료 탭
    decide.tsx           추천+거래(히어로) · 조정 부탁 · 조정 대기
    confirm.tsx          확정(캘린더 등록) · 시간 바꾸기 · 변경 확정
docs/
  SUBMISSION.md         제출 3대 질문 답안 (문제·해결·이유)
  UX_WRITING.md         토스 공식 라이팅 원칙 + 제품 원칙 5 + 화면별 적용
archive/
  v1-mobile.html        최초 모바일 네이티브 프로토타입
  v2-web.html           WDS 토큰 흉내낸 웹 반응형 버전 (TDS 실장 전)
```

## Claude Code로 계속 작업하기

작업 컨텍스트·설계 원칙: [`CLAUDE.md`](CLAUDE.md). 화면은 `src/screens/*.tsx`의 함수명(`Home`, `Confirmed` 등) 또는
라우터 id(`p-confirmed` 등)로 지시하면 정확히 찾아갑니다.

```bash
claude
# 예: "Confirmed 화면 이벤트 카드에 참석자 응답 상태 배지 추가해줘"
```

## 조형 원칙 3줄

1. **시간이 주인공** — 결정 대상(시간)이 화면에서 가장 큰 타이포.
2. **강조 리듬 3단** — 히어로(elevation) > 거래(blue 틴트) > 차선(flat). 그림자 카드는 화면당 하나.
3. **모션은 의미 있는 곳에만** — 아바타 스태거 팝, 캘린더 슬롯인. `prefers-reduced-motion` 존중.
