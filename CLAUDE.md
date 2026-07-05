# CLAUDE.md — 작업 컨텍스트

Claude Code가 이 저장소에서 작업할 때 참고하는 문서입니다.

## 이 프로젝트가 뭔가

토스 2026 프로덕트 디자인 챌린지 제출물. 과제: **같은 회사 동료 6명이 다음 주까지 1시간 회의를 잡는 경험 설계.**

핵심 문제 정의(모든 결정의 기준점):
> 일정 조율의 진짜 고통은 빈 시간 찾기가 아니라, 모두가 안 될 때 **'누굴 포기할지'를 주최자가 혼자·미안하게 떠안는 것**이다. 시스템이 제약의 무게를 흡수해, 주최자가 판단도 죄책감도 지지 않게 한다.

**앱인토스에는 등록하지 않는다.** [AI 바이브 코딩 가이드](https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html)의 React+TypeScript+TDS 구조는 따르되, `create-ait-app`/`granite.config.ts`/콘솔 업로드/ait 빌드 같은 앱인토스 전용 단계는 이 프로젝트에 없다. 일반 웹(Vite) 프로젝트로, 브라우저에서 바로 연다.

## 스택

- React 18 + TypeScript + Vite + Emotion(`css` prop, `jsxImportSource: "@emotion/react"`)
- **`@toss/tds-mobile`**: 실제 토스 디자인 시스템 컴포넌트 (Button, Badge, List/ListRow, TextButton …)
- **`@toss/tds-colors`**: 실제 시맨틱 컬러 토큰
- `@toss/tds-mobile-ait`는 peer dependency라 설치는 돼 있지만 앱인토스 전용 오버레이(Dialog/Toast 훅)라 이 프로젝트에서는 쓰지 않는다 — 토스트는 `App.tsx`에 직접 구현.

## 편집 규칙

- 화면은 `src/screens/{flow,decide,confirm}.tsx`의 함수 컴포넌트. 함수명 또는 라우터 id(`p-xxx`)로 지시하면 정확히 찾아짐.
- 공용 조각(Content, Nav, Callout, Avatar 등)은 `src/components/ui.tsx`. TDS에 이미 있는 컴포넌트를 다시 만들지 말 것 — 없는 조각만 여기 추가한다.
- **색은 반드시 `@toss/tds-colors`의 `colors.*` 토큰만 쓴다.** 하드코딩 hex 금지(로고 `#0064FF`, WeekView 블록 그림자 등 TDS에 없는 최소한의 예외 제외).
- 폰트는 Pretendard(CDN, `index.html`)만. TDS mobile 자체 폰트 스택은 건드리지 않는다.
- 캘린더 날짜/내보내기 로직은 `src/lib/calendar.ts`에만 둔다 — 컴포넌트에 날짜 계산을 직접 넣지 않는다.
- 데스크톱 프레젠테이션 셸(폰 프레임 + 설계 노트)은 `src/shell.css` + `App.tsx`가 전담. 화면 컴포넌트 안에는 셸 관련 스타일을 넣지 않는다.

## 절대 지켜야 할 설계 원칙 (바꾸지 말 것)

1. **막다른 길 금지.** 모든 화면에 출구가 있어야 함(추천 다 별로 → 거래, 동료 다 안 됨 → 되는 시간 입력, 대기 → 5명 확정).
2. **묻지 말고 아는 걸 쓴다.** 캘린더 free/busy는 자동, 캘린더가 모르는 선호만 탭으로.
3. **One Thing per One Page.** 한 화면에 주 결정 하나. 주 버튼(Button 기본 `color="primary"`)은 화면당 하나.
4. **강조 리듬 3단.** 히어로(그림자) > 거래(파랑 틴트) > 차선(flat). 그림자 카드는 화면당 하나.
5. **라이팅은 토스 원칙대로.** 해요체·능동·긍정·캐주얼 경어('~시' 제거, '께'→'에게'). `docs/UX_WRITING.md`의 금지어(가중치·최적화·교집합) 쓰지 말 것.
6. **확정 = 등록.** 캘린더 등록은 '과정'이 아니라 자동으로 끝난 '결과'로 보여준다. 개인 캘린더 내보내기(Google/Outlook/ICS)는 실동작을 유지한다.

## TDS Button color 주의사항 (직접 겪은 함정)

`color="light"`는 **어두운/컬러 배경 위에 얹는 흰 버튼**이다(흰 배경 위 `weak` variant는 거의 투명하게 렌더됨 — 실제로 이 버그를 냈다가 스크린샷 검증에서 발견해 고쳤음). 흰 화면 위의 보조/고스트 버튼은 항상 **`color="dark" variant="weak"`**를 쓴다.

## 화면 목록

| 함수 (screens/*.tsx) | 라우터 id | 역할 |
|---|---|---|
| `Home` | p-home | 회의 목록 홈 |
| `Create` | p-create | 회의 만들기 — 참석자 + 꼭/선택 |
| `Add` | p-add | 동료 추가 — 검색 + 탭 선택 |
| `Collecting` | p-collecting | 시간 모으는 중 — 캘린더 자동 + 응답 현황 |
| `Tap` | p-tap | 동료 10초 탭 — 안 되는 시간만 표시 |
| `Recommend` | p-recommend | 추천 + 거래 — **히어로 화면** |
| `Ask` | p-ask | 조정 부탁 — 박지후님에게 대필 메시지 |
| `Waiting` | p-waiting | 조정 대기 — 불안 없는 대기 |
| `Confirmed` | p-confirmed | 확정 — **캘린더 자동 등록 + 이벤트 카드 + 주간 뷰 + 내보내기** |
| `Reschedule` | p-reschedule | 시간 바꾸기 — 대안 즉시 제시 |
| `Rescheduled` | p-rescheduled | 변경 확정 — 캘린더 자동 수정 · 조건부(박지후 대기) |

## 캘린더 엔진 (`src/lib/calendar.ts`)

- 다음 주 월–금을 오늘 기준으로 동적 계산(`nextWeekday`). 목 10시 확정 / 화 11시 변경.
- `when.*` 함수가 화면에 넣을 날짜 문자열을 만든다.
- `buildEvent(kind, title)` → `openGoogle` / `openOutlook` / `downloadICS(ev, alarmMin)` 세 가지 실제 내보내기.
- `WeekView` 컴포넌트가 9–18시, 1시간=16px 그리드로 active/ghost/gone 블록을 그린다.

## 남은 할 일 (아이디어)

- [ ] GitHub Pages 배포 (제출용 URL — `npm run build` 정적 산출물)
- [ ] 단서 4개 → 설계 매핑 테이블 시각화 (제출물 서두)
- [ ] 추천 로직 다이어그램 (필수 가중 > 선호 회피 > 선택 참석)
