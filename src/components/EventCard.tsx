/** 이벤트 카드 — 캘린더에 들어간 모습 그대로. 제목 인라인 수정 + 알림 칩. */
import { css } from "@emotion/react";
import { Badge } from "@toss/tds-mobile";
import { colors } from "@toss/tds-colors";
import { Avatar, Hint } from "./ui";
import { when } from "../lib/calendar";

const ALARMS = [
  { min: 10, label: "10분 전" },
  { min: 30, label: "30분 전" },
  { min: 60, label: "1시간 전" },
];

export function EventCard({
  title, onTitle, alarmMin, onAlarm, onToast,
}: {
  title: string;
  onTitle: (t: string) => void;
  alarmMin: number;
  onAlarm: (min: number) => void;
  onToast: (msg: string) => void;
}) {
  return (
    <section
      aria-label="캘린더에 등록한 회의"
      css={css`
        position: relative; text-align: left;
        background: ${colors.white};
        border: 1px solid ${colors.grey200};
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(25, 31, 40, 0.08);
        padding: 18px 18px 18px 22px;
        margin: 20px 0 0;
        overflow: hidden;
        &::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; background: ${colors.blue500};
        }
      `}
    >
      <div css={css`display: flex; align-items: center; gap: 8px;`}>
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          aria-label="회의 제목 (누르면 바로 고칠 수 있어요)"
          css={css`
            flex: 1; min-width: 0;
            border: none; background: none; font-family: inherit;
            font-size: 16.5px; font-weight: 700; letter-spacing: -0.2px;
            color: ${colors.grey900};
            padding: 2px 4px; margin-left: -4px; border-radius: 6px;
            &:hover { background: ${colors.grey50}; }
            &:focus { outline: 2px solid ${colors.blue500}; background: ${colors.white}; }
          `}
        />
        <span css={css`font-size: 11px; color: ${colors.grey400}; white-space: nowrap;`}>✎ 눌러서 고치기</span>
      </div>

      <ul css={css`list-style: none; margin-top: 13px; display: grid; gap: 10px;`}>
        <Row ico="🕐">
          <b>{when.thuLong()}</b>
          <Sub>오전 10:00 – 11:00</Sub>
        </Row>
        <Row ico="🏢">
          <b>10층 회의실 A</b> · 6인실{" "}
          <Badge size="xsmall" variant="weak" color="green">자동 예약</Badge>
        </Row>
        <Row ico="🎥">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            css={css`color: ${colors.blue500}; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; }`}
          >
            meet.toss.im/design-review
          </a>
          <Sub>멀리 있는 사람은 여기로 들어와요</Sub>
        </Row>
        <Row ico="🔔">
          <span role="group" aria-label="알림 시각" css={css`display: flex; gap: 6px; flex-wrap: wrap;`}>
            {ALARMS.map((a) => {
              const on = a.min === alarmMin;
              return (
                <button
                  key={a.min}
                  onClick={() => {
                    onAlarm(a.min);
                    onToast(`알림을 ${a.label}으로 바꿨어요`);
                  }}
                  css={css`
                    font-size: 12px; font-weight: ${on ? 700 : 600};
                    font-family: inherit; cursor: pointer;
                    color: ${on ? colors.blue500 : colors.grey500};
                    background: ${on ? colors.blue50 : "none"};
                    border: 1px solid ${on ? "transparent" : colors.grey200};
                    border-radius: 999px; padding: 4px 10px;
                    &:focus-visible { outline: 2px solid ${colors.blue500}; }
                  `}
                >
                  {a.label}
                </button>
              );
            })}
          </span>
        </Row>
      </ul>

      <div css={css`display: flex; align-items: center; margin: 14px 0 2px;`}>
        {["김", "이", "박", "정", "최"].map((c, i) => (
          <Avatar key={c} size={30} overlap={i > 0}>{c}</Avatar>
        ))}
        <span css={css`font-size: 12.5px; color: ${colors.grey600}; margin-left: 10px;`}>5명이 함께해요</span>
      </div>
      <Hint>강수아님은 선택 참석이라 이번엔 빠졌어요</Hint>
    </section>
  );
}

function Row({ ico, children }: { ico: string; children: React.ReactNode }) {
  return (
    <li css={css`display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: ${colors.grey700}; b { font-weight: 600; color: ${colors.grey900}; }`}>
      <span css={css`width: 18px; text-align: center; flex-shrink: 0; font-size: 14px;`}>{ico}</span>
      <span css={css`min-width: 0;`}>{children}</span>
    </li>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <span css={css`display: block; font-size: 11.5px; color: ${colors.grey500}; margin-top: 1px;`}>{children}</span>;
}
