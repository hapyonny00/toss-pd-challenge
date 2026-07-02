# 피그마 이식 가이드 — 토큰 → Variables

> 대상 파일: `wzqU1eN4yqM21UEqFPM3hv` (현재 빈 캔버스)
> 원본: `css/tokens.css` — 이 문서와 CSS가 어긋나면 CSS가 정답.

## 1. Variables 컬렉션 만들기

피그마 좌측 패널 → Local variables → 컬렉션 3개 생성:

### Collection: `color`
| 이름 | 값 | 용도 |
|---|---|---|
| grey/900 | `#191F28` | 최강조 텍스트 |
| grey/700 | `#4E5968` | 보조 텍스트 |
| grey/500 | `#8B95A1` | 뮤트 텍스트 |
| grey/200 | `#E5E8EB` | 보더 |
| grey/100 | `#F2F4F6` | 페이지 배경 |
| grey/50 | `#F9FAFB` | 서브 서피스 |
| blue/500 | `#3182F6` | Primary 행동 |
| blue/600 | `#1B64DA` | Primary pressed |
| blue/100 | `#E8F3FF` | Primary 틴트 |
| green/500 | `#00B380` | 완료·가능 |
| green/100 | `#E5F7F1` | 완료 배경 |
| orange/500 | `#FF9500` | 대기·주의 |
| red/500 | `#F04452` | 불가·위험 |

### Collection: `space` (4pt 그리드)
`4, 8, 12, 16, 20, 24, 32, 40`

### Collection: `radius`
`s=8, m=12, l=16, full=999`

## 2. 텍스트 스타일 5단 (Pretendard)
| 스타일 | 크기/굵기/행간 | 쓰는 곳 |
|---|---|---|
| Display | 26 / ExtraBold / 1.25 | 추천 시간 (히어로) |
| Title | 20 / Bold / 1.3 | 페이지 타이틀 |
| Subtitle | 17 / SemiBold / 1.4 | 거래 카드 타이틀 |
| Body | 15 / Medium / 1.5 | 버튼, 본문 |
| Caption | 13 / Regular / 1.5 | 근거, 보조 |
| Micro | 11 / SemiBold / ls+0.4 | 배지, 아이브로우 |

> 자간: Display −0.5, Title −0.3, Subtitle −0.2 (한글 타이트닝)

## 3. 이펙트 스타일
- `elevation/hero`: Drop shadow ×2 — `0 6 20 rgba(25,31,40,8%)` + `0 1 3 rgba(25,31,40,6%)`
- 거래 카드는 그림자 없음 (blue/100 배경 틴트가 강조를 담당)

## 4. 강조 리듬 원칙 (컴포넌트 만들 때)
1순위 히어로 = **흰 배경 + elevation** / 2순위 거래 = **blue 틴트, 그림자 없음** / 3순위 차선 = **flat + 1px 보더**.
한 화면에 elevation 카드는 **하나만**.

## 5. 프레임 규격
- 디자인: **375 × 812** (iPhone 기준, TDS 표준)
- 콘텐츠 좌우 여백: 20 / 카드 내부 패딩: 20
- 프로토타입 공유 시 Device: iPhone 선택
