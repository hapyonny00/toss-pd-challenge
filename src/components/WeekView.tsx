/** 주간 뷰 — 이벤트가 다음 주에 자리 잡는 모습 (9–18시, 1시간 = 16px) */
import { css, keyframes } from "@emotion/react";
import { colors } from "@toss/tds-colors";
import { DAYS_KO, nextWeekday, when } from "../lib/calendar";

const H0 = 9;
const PPH = 16;
const COL_H = (18 - H0) * PPH;

export interface WeekBlock {
  day: number; // 0=월
  h: number;
  cls: "active" | "ghost" | "gone";
  label?: string;
}

const drop = keyframes`
  from { opacity: 0; transform: translateY(-26px) scale(0.9); }
  to { opacity: 1; transform: none; }
`;

const blockCss = {
  active: css`
    background: ${colors.blue500}; color: ${colors.white};
    box-shadow: 0 2px 8px rgba(49, 130, 246, 0.35);
    animation: ${drop} 640ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
    animation-delay: 240ms;
  `,
  ghost: css`background: ${colors.blue50}; color: ${colors.blue500}; opacity: 0.75;`,
  gone: css`background: ${colors.grey100}; color: ${colors.grey400}; text-decoration: line-through;`,
};

export function WeekView({ blocks }: { blocks: WeekBlock[] }) {
  const today = new Date().toDateString();
  return (
    <div css={css`margin: 14px 0 4px; text-align: left;`} aria-hidden>
      <div css={css`display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;`}>
        <span css={css`font-size: 12.5px; font-weight: 700; color: ${colors.grey500};`}>다음 주</span>
        <span css={css`font-size: 11.5px; color: ${colors.grey400};`}>{when.range()}</span>
      </div>
      <div
        css={css`
          display: grid; grid-template-columns: 26px repeat(5, 1fr); gap: 5px;
          background: ${colors.grey50};
          border-radius: 16px; padding: 12px 12px 14px;
        `}
      >
        <div css={css`position: relative; height: ${COL_H}px; margin-top: 32px;`}>
          {[9, 12, 15, 18].map((h) => (
            <span
              key={h}
              css={css`
                position: absolute; right: 4px; top: ${(h - H0) * PPH}px;
                transform: translateY(-50%);
                font-size: 10px; color: ${colors.grey400};
              `}
            >
              {h}
            </span>
          ))}
        </div>
        {DAYS_KO.map((name, i) => {
          const d = nextWeekday(i);
          const isToday = d.toDateString() === today;
          return (
            <div key={name} css={css`text-align: center;`}>
              <div css={css`font-size: 11px; font-weight: 600; color: ${colors.grey500};`}>{name}</div>
              <div css={css`font-size: 12.5px; font-weight: 700; margin-top: 1px; color: ${isToday ? colors.blue500 : colors.grey900};`}>
                {d.getDate()}
              </div>
              <div css={css`position: relative; height: ${COL_H}px; margin-top: 7px; background: ${colors.white}; border-radius: 8px;`}>
                {blocks
                  .filter((b) => b.day === i)
                  .map((b, j) => (
                    <div
                      key={j}
                      css={css`
                        position: absolute; left: 3px; right: 3px;
                        top: ${(b.h - H0) * PPH}px; height: ${PPH}px;
                        border-radius: 5px; font-size: 9.5px; font-weight: 700;
                        display: flex; align-items: center; justify-content: center;
                        overflow: hidden; white-space: nowrap;
                        ${blockCss[b.cls]}
                      `}
                    >
                      {b.label}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
