# gcal-prototype — 팀의 시간 레이어 (GCalendar 스킨)

토스 2026 PD 챌린지의 두 번째 프로토타입. **"익숙한 캘린더 위에 레이어 하나를 얹으면 조율이 사라진다"**를 보여주기 위해, Figma 커뮤니티의 [Google Calendar Mac App (GCalendar)](https://www.figma.com/community/file/1440612499810975916/google-calendar-mac-app) 디자인 시스템 위에 To-Be 컨셉을 올렸다.

v3(TDS mobile, 리포 루트)와 별개의 독립 산출물 — 이 폴더는 빌드 없이 `index.html`을 브라우저로 열면 된다.

## 디자인 토큰 (GCalendar 커버에서 샘플링)

| 토큰 | 값 | 용도 |
|---|---|---|
| blue | `#036EFE` | 이벤트 필, 주 버튼, 추천 슬롯 |
| blue-tint | `#DFEDFF` | 투데이 서클, 추천 슬롯 배경 |
| bg | `#EDF5F7` | 앱 바깥 배경 |
| gray | `#8A8A8A` | 보조 텍스트 |
| 카드 radius | `16px` / 필 `8px` | GCalendar 위젯 문법 |

폰트는 Pretendard Variable(CDN). 시맨틱 컬러(가능=green tint, 부담=amber dot)는 Google 팔레트 계열로 GCalendar 문법과 충돌하지 않게.

## 담고 있는 스펙 (전략 세션 산출)

1. **콜드 스타트** — 우하단 확인 카드. "묻지 말고 맞혀서 확인만 받기" (목요일 외근 패턴 자동 감지)
2. **3클릭 플로우** — ① 함께할 사람(꼭 참석/가능하면) → ② 팀의 시간 레이어(히트맵) + 추천 3 → ③ 확정
3. **정보 계층** — 개인별 색 폐기. 면(적합도 4단계) / 점(부담 경고) / 보더+배지(추천)의 3겹. 파란색은 화면에 추천 3곳뿐
4. **슬롯 0개 방어** — "만약 모두 되는 시간이 없다면?" → 타협 카드 3장 (민지 제외 / 기피 허용+양해 대필 / 30분 단축)
5. **프라이버시** — 사이드바 고지: 팀원 사정은 '조금 어려운 시간'으로만 집계 노출

라이팅은 리포 공통 원칙(해요체·능동·막다른 길 금지, 금지어: 가중치·최적화·교집합). 대필 메시지만 존댓말 예외.

## 데모 딥링크 (발표·검증용)

- `index.html` — 초기 상태 + 콜드 스타트 카드
- `index.html?step=2` — 레이어 켜진 상태 + 추천 3
- `index.html?step=comp` — 슬롯 0개 타협 카드
- `index.html?step=done` — 확정 화면

## 검증

헤드리스 크롬 스크린샷 (데스크톱 1440×900):

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --window-size=1440,900 --screenshot=/tmp/gcal.png \
  "file://$PWD/index.html?step=2"
```
