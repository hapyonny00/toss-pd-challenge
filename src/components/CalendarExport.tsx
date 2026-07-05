/** 내 캘린더에도 담기 — Google/Outlook/ICS 실동작 */
import { css } from "@emotion/react";
import { colors } from "@toss/tds-colors";
import { buildEvent, downloadICS, openGoogle, openOutlook, type SlotKey } from "../lib/calendar";

export function CalendarExport({
  kind, title, alarmMin, onToast, hint,
}: {
  kind: SlotKey;
  title: string;
  alarmMin: number;
  onToast: (msg: string) => void;
  hint: string;
}) {
  const act = (which: "google" | "outlook" | "apple") => {
    const ev = buildEvent(kind, title);
    if (which === "google") { openGoogle(ev); onToast("Google 캘린더를 열었어요"); }
    else if (which === "outlook") { openOutlook(ev); onToast("Outlook을 열었어요"); }
    else { downloadICS(ev, alarmMin); onToast("캘린더 파일을 받았어요 · 열면 바로 담겨요"); }
  };

  return (
    <div css={css`margin: 18px 0 4px; text-align: left;`}>
      <p css={css`font-size: 12.5px; font-weight: 700; color: ${colors.grey500}; margin-bottom: 8px;`}>
        개인 캘린더에도 담을래요?
      </p>
      <div css={css`display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;`}>
        <CalBtn onClick={() => act("google")} icon={<Ico bg={colors.white} border color={colors.blue500}>G</Ico>}>Google</CalBtn>
        <CalBtn onClick={() => act("outlook")} icon={<Ico bg="#0F6CBD" color={colors.white}>O</Ico>}>Outlook</CalBtn>
        <CalBtn onClick={() => act("apple")} icon={<Ico bg={colors.grey900} color={colors.white}></Ico>}>Apple</CalBtn>
      </div>
      <p css={css`font-size: 11.5px; color: ${colors.grey400}; margin-top: 8px; line-height: 1.6;`}>{hint}</p>
    </div>
  );
}

function CalBtn({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      css={css`
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        background: ${colors.white}; border: 1px solid ${colors.grey200};
        border-radius: 12px; padding: 12px 6px;
        font-size: 12px; font-weight: 600; color: ${colors.grey700};
        font-family: inherit; cursor: pointer;
        transition: border-color 150ms, transform 150ms;
        &:hover { border-color: ${colors.grey400}; }
        &:active { transform: scale(0.98); }
        &:focus-visible { outline: 2px solid ${colors.blue500}; }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

function Ico({ children, bg, color, border }: { children?: React.ReactNode; bg: string; color: string; border?: boolean }) {
  return (
    <span
      css={css`
        width: 26px; height: 26px; border-radius: 8px;
        display: grid; place-items: center;
        font-size: 13px; font-weight: 800;
        background: ${bg}; color: ${color};
        ${border ? `border: 1px solid ${colors.grey200};` : ""}
      `}
    >
      {children}
    </span>
  );
}
