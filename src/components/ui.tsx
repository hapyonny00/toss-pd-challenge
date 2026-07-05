/** 제품 안 공용 조각 — TDS 토큰(@toss/tds-colors) 기반. TDS에 없는 조각만 여기서 만든다. */
import { css, keyframes } from "@emotion/react";
import { colors } from "@toss/tds-colors";
import type { ReactNode } from "react";

export const grey = colors;

/* ---------- 화면 골격 ---------- */

export function Content({ children }: { children: ReactNode }) {
  return (
    <div
      css={css`
        padding: 8px 20px 40px;
        display: flex;
        flex-direction: column;
        flex: 1;
      `}
    >
      {children}
    </div>
  );
}

export function Nav({ title, onBack }: { title?: string; onBack?: () => void }) {
  return (
    <header
      css={css`
        display: flex; align-items: center; gap: 8px;
        padding: 12px 16px;
        position: sticky; top: 0; z-index: 5;
        background: ${colors.white};
      `}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="뒤로"
          css={css`
            width: 36px; height: 36px;
            display: grid; place-items: center;
            border: none; background: none; cursor: pointer;
            color: ${colors.grey800};
            font-size: 24px; font-weight: 300; line-height: 1;
            border-radius: 8px;
            &:focus-visible { outline: 2px solid ${colors.blue500}; }
          `}
        >
          ‹
        </button>
      )}
      <span css={css`font-size: 15px; font-weight: 600;`}>{title}</span>
    </header>
  );
}

export function Intro({ title, sub, center }: { title: string; sub?: string; center?: boolean }) {
  return (
    <div css={css`margin: 12px 0 20px; ${center ? "text-align:center;" : ""}`}>
      <h2 css={css`font-size: 22px; font-weight: 700; line-height: 1.35; letter-spacing: -0.3px;`}>{title}</h2>
      {sub && <p css={css`margin-top: 5px; font-size: 14px; color: ${colors.grey600}; line-height: 1.5;`}>{sub}</p>}
    </div>
  );
}

export function SecHead({ children }: { children: ReactNode }) {
  return (
    <p
      css={css`
        font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
        color: ${colors.grey500}; margin: 20px 4px 6px;
      `}
    >
      {children}
    </p>
  );
}

/* ---------- 아바타 ---------- */

type Ring = "green" | "blue" | "dash" | undefined;

export function Avatar({
  children, size = 40, me, ring, overlap,
}: { children: ReactNode; size?: number; me?: boolean; ring?: Ring; overlap?: boolean }) {
  return (
    <span
      css={css`
        width: ${size}px; height: ${size}px; flex-shrink: 0;
        display: inline-grid; place-items: center;
        background: ${me ? colors.blue50 : colors.grey100};
        color: ${me ? colors.blue500 : colors.grey700};
        font-size: ${size >= 48 ? 18 : size >= 36 ? 14 : 12}px; font-weight: 600;
        border-radius: 999px;
        ${ring === "green" ? `box-shadow: 0 0 0 2px ${colors.white}, 0 0 0 4px ${colors.green500};` : ""}
        ${ring === "blue" ? `box-shadow: 0 0 0 2px ${colors.white}, 0 0 0 4px ${colors.blue500};` : ""}
        ${ring === "dash" ? `border: 1.5px dashed ${colors.grey300}; color: ${colors.grey400}; background: ${colors.grey50};` : ""}
        ${overlap ? `margin-left: -7px; border: 2px solid ${colors.white};` : ""}
      `}
    >
      {children}
    </span>
  );
}

/* ---------- 콜아웃 · 힌트 · 메시지 ---------- */

export function Callout({
  label, title, children, blue,
}: { label?: string; title?: string; children?: ReactNode; blue?: boolean }) {
  return (
    <div
      css={css`
        background: ${blue ? colors.blue50 : colors.grey50};
        border-radius: 12px;
        padding: 13px 16px; margin: 12px 0;
        text-align: left;
      `}
    >
      {label && <i css={css`display: block; font-style: normal; font-size: 11px; color: ${colors.grey500}; margin-bottom: 2px;`}>{label}</i>}
      {title && <b css={css`font-size: 13px; font-weight: 700; color: ${blue ? colors.blue600 : colors.grey900};`}>{title}</b>}
      {children && (
        <p css={css`font-size: 12.5px; line-height: 1.6; color: ${blue ? colors.blue600 : colors.grey600}; margin-top: 2px; opacity: ${blue ? 0.9 : 1};`}>
          {children}
        </p>
      )}
    </div>
  );
}

export function Hint({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <p
      css={css`
        font-size: 12.5px; color: ${colors.grey500}; line-height: 1.6;
        margin: 8px 0 16px; ${center ? "text-align:center;" : ""}
        b { color: ${colors.grey700}; }
      `}
    >
      {children}
    </p>
  );
}

export function MsgBox({ children, dim, label }: { children: ReactNode; dim?: boolean; label?: string }) {
  return (
    <div
      css={css`
        position: relative; background: ${colors.grey50};
        border-radius: 12px; text-align: left;
        padding: 14px 16px; font-size: 13.5px; line-height: 1.7;
        color: ${dim ? colors.grey600 : colors.grey800}; margin-bottom: 12px;
        b { font-weight: 700; color: ${colors.grey900}; }
      `}
    >
      {label && <i css={css`display: block; font-style: normal; font-size: 11px; color: ${colors.grey500}; margin-bottom: 3px;`}>{label}</i>}
      {children}
    </div>
  );
}

/* ---------- 칩 (기간·마감) ---------- */

export function InfoChip({ children, warn }: { children: ReactNode; warn?: boolean }) {
  return (
    <span
      css={css`
        display: inline-flex; align-items: center; gap: 5px;
        background: ${warn ? colors.orange50 : colors.grey100};
        color: ${warn ? colors.orange600 : colors.grey700};
        font-size: 12.5px; font-weight: 600;
        padding: 6px 12px; border-radius: 999px;
      `}
    >
      {children}
    </span>
  );
}

/* ---------- 입력 ---------- */

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      css={css`
        width: 100%; height: 46px;
        border: 1px solid ${colors.grey200}; border-radius: 12px;
        padding: 0 16px; font-size: 14px; font-family: inherit;
        background: ${colors.white}; color: ${colors.grey900};
        &::placeholder { color: ${colors.grey400}; }
        &:focus { outline: 2px solid ${colors.blue500}; outline-offset: -1px; }
      `}
    />
  );
}

/* ---------- 모션 ---------- */

const rise = keyframes`to { opacity: 1; transform: none; }`;
export const enterCss = (delayMs = 0) => css`
  opacity: 0; transform: translateY(10px);
  animation: ${rise} 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${delayMs}ms;
`;

const popKf = keyframes`to { opacity: 1; transform: none; }`;
export const popCss = (delayMs = 0) => css`
  opacity: 0; transform: scale(0.7);
  animation: ${popKf} 360ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: ${delayMs}ms;
`;
