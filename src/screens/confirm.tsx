/** 확정(캘린더 자동 등록) · 시간 바꾸기 · 변경 확정 */
import { css } from "@emotion/react";
import { useState } from "react";
import { Button, TextButton } from "@toss/tds-mobile";
import { colors } from "@toss/tds-colors";
import { CalendarExport } from "../components/CalendarExport";
import { EventCard } from "../components/EventCard";
import { WeekView } from "../components/WeekView";
import { Callout, Content, Hint, Input, Intro, Nav } from "../components/ui";
import { when } from "../lib/calendar";
import type { ScreenProps } from "../types";

export interface EventState {
  title: string;
  setTitle: (t: string) => void;
  alarmMin: number;
  setAlarmMin: (m: number) => void;
}

/* ============ 확정 — 캘린더 자동 등록 ============ */
export function Confirmed({ nav, toast, event }: ScreenProps & { event: EventState }) {
  return (
    <Content>
      <div css={css`text-align: center; padding-top: 8px;`}>
        <div
          css={css`
            width: 56px; height: 56px; margin: 8px auto 12px;
            display: grid; place-items: center; font-size: 24px; font-weight: 800;
            color: ${colors.green500}; background: ${colors.green50}; border-radius: 999px;
          `}
        >
          ✓
        </div>
        <h2 css={css`font-size: 23px; font-weight: 800; letter-spacing: -0.3px;`}>회의가 잡혔어요</h2>
        <p css={css`font-size: 15px; color: ${colors.grey600}; margin-top: 5px;`}>{when.thuLong()} 오전 10시 · 1시간</p>
        <Hint center>6명 캘린더에 자동으로 넣었어요 · 다들 알림을 받았어요</Hint>

        <EventCard
          title={event.title}
          onTitle={event.setTitle}
          alarmMin={event.alarmMin}
          onAlarm={event.setAlarmMin}
          onToast={toast}
        />

        <WeekView
          blocks={[
            { day: 2, h: 14, cls: "ghost" },
            { day: 3, h: 10, cls: "active", label: "10–11" },
            { day: 4, h: 16, cls: "ghost" },
          ]}
        />

        <CalendarExport
          kind="thu"
          title={event.title}
          alarmMin={event.alarmMin}
          onToast={toast}
          hint="회사 캘린더에는 이미 들어가 있어요. 시간이 바뀌면 캘린더도 자동으로 바뀌어요."
        />

        <div css={css`margin-top: 14px;`}>
          <Button display="full" size="xlarge" onClick={() => nav("p-home")}>완료</Button>
        </div>
        <div css={css`margin-top: 8px;`}>
          <TextButton size="small" onClick={() => nav("p-reschedule")}>
            시간을 바꿔야 하면 여기서 바꿔요
          </TextButton>
        </div>
      </div>
    </Content>
  );
}

/* ============ 시간 바꾸기 ============ */
const OPTIONS = [
  { time: "수요일 오후 3시", sub: "꼭 4명 가능 · 선택 0명", impact: "4명이 와요 · 지금보다 1명 줄어요" },
  { time: "금요일 오후 4시", sub: "꼭 3명 가능 · 이서연님 외근", impact: "3명이 와요 · 지금보다 2명 줄어요" },
  { time: "화요일 오전 11시", sub: "6명 전원 · 박지후님 조정하면", impact: "6명 전원이 와요 · 박지후님 30분 조정이 필요해요", em: true },
];

export function Reschedule({ nav, toast }: ScreenProps) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <>
      <Nav title="시간 바꾸기" onBack={() => nav("p-confirmed")} />
      <Content>
        <Callout label="지금 확정한 시간" title="목요일 오전 10시 · 5명" />
        <Intro title="언제로 바꿀까요?" sub="캘린더를 이미 알고 있어서, 바로 고를 수 있어요" />

        {OPTIONS.map((o, i) => {
          const on = pick === i;
          return (
            <button
              key={o.time}
              onClick={() => setPick(i)}
              css={css`
                width: 100%; display: flex; align-items: center; justify-content: space-between;
                gap: 12px; text-align: left; font-family: inherit; cursor: pointer;
                background: ${colors.white};
                border: ${on ? `2px solid ${colors.blue500}` : `1px solid ${colors.grey200}`};
                border-radius: 12px;
                padding: ${on ? "12px 15px" : "13px 16px"};
                margin-bottom: 8px;
                &:focus-visible { outline: 2px solid ${colors.blue500}; outline-offset: 2px; }
              `}
            >
              <span css={css`display: flex; flex-direction: column; gap: 2px;`}>
                <span css={css`font-size: 15px; font-weight: 600;`}>{o.time}</span>
                <span css={css`font-size: 12px; color: ${o.em ? colors.blue600 : colors.grey500};`}>{o.sub}</span>
              </span>
              <span
                aria-hidden
                css={css`
                  width: 20px; height: 20px; border-radius: 999px; flex-shrink: 0;
                  border: ${on ? `6px solid ${colors.blue500}` : `1.5px solid ${colors.grey300}`};
                  transition: border 150ms;
                `}
              />
            </button>
          );
        })}

        <div css={css`margin: 12px 0 0;`}>
          <Input placeholder="바꾸는 이유 (선택) · 동료에게 같이 전해요" />
        </div>

        <Callout>
          {pick === null ? (
            "바꿀 시간을 고르면, 누구에게 알림이 다시 가는지 알려드려요"
          ) : (
            <>
              <b css={css`color: ${colors.grey900};`}>{OPTIONS[pick].impact}</b> · 5명에게 변경 알림이 가요
            </>
          )}
        </Callout>

        <Button
          display="full"
          size="xlarge"
          disabled={pick === null}
          onClick={() => {
            if (pick === null) { toast("먼저 바꿀 시간을 골라주세요"); return; }
            nav("p-rescheduled");
          }}
        >
          {pick === null ? "바꿀 시간을 골라요" : `${OPTIONS[pick].time}로 바꾸기`}
        </Button>
        <div css={css`margin-top: 8px;`}>
          <Button display="full" size="large" color="dark" variant="weak" onClick={() => nav("p-confirmed")}>
            역시 그대로 둘게요
          </Button>
        </div>
      </Content>
    </>
  );
}

/* ============ 변경 확정 (화요일 · 조건부) ============ */
export function Rescheduled({ nav, toast, event }: ScreenProps & { event: EventState }) {
  return (
    <Content>
      <div css={css`text-align: center; padding-top: 8px;`}>
        <div
          css={css`
            width: 56px; height: 56px; margin: 8px auto 12px;
            display: grid; place-items: center; font-size: 24px;
            background: ${colors.blue50}; border-radius: 999px;
          `}
        >
          📅
        </div>
        <h2 css={css`font-size: 23px; font-weight: 800; letter-spacing: -0.3px;`}>시간을 바꿨어요</h2>
        <p css={css`font-size: 15px; color: ${colors.grey600}; margin-top: 5px;`}>{when.tueLong()} 오전 11시 · 1시간</p>
        <Hint center><s>목요일 오전 10시</s> 에서 바꿨어요</Hint>

        <div css={css`background: ${colors.grey50}; border-radius: 12px; padding: 4px 16px; margin: 16px 0; text-align: left;`}>
          <FactRow ico="📅">캘린더를 새 시간으로 바꿨어요</FactRow>
          <FactRow ico="🏢">회의실도 다시 잡았어요 · 11층 회의실 B</FactRow>
          <FactRow ico="🔔">5명에게 변경 알림을 보냈어요</FactRow>
          <FactRow ico="🕐" last warn="답을 기다리는 중">박지후님에게 30분 조정을 부탁했어요</FactRow>
        </div>

        <WeekView
          blocks={[
            { day: 1, h: 11, cls: "active", label: "11–12" },
            { day: 3, h: 10, cls: "gone", label: "10–11" },
          ]}
        />

        <Callout blue>
          <b css={css`color: ${colors.blue600};`}>박지후님이 조정하면 6명 전원이 모여요.</b>{" "}
          강수아님도 이번엔 함께할 수 있어요.
        </Callout>

        <CalendarExport
          kind="tue"
          title={event.title}
          alarmMin={event.alarmMin}
          onToast={toast}
          hint="아까 담았어도 괜찮아요. 새 시간으로 바꿔서 담겨요."
        />

        <div css={css`margin-top: 14px;`}>
          <Button display="full" size="xlarge" onClick={() => nav("p-home")}>완료</Button>
        </div>
        <div css={css`display: flex; gap: 8px; margin-top: 8px;`}>
          <div css={css`flex: 1;`}>
            <Button display="full" size="large" color="dark" variant="weak" onClick={() => nav("p-waiting")}>
              🕐 박지후님 답 기다리기
            </Button>
          </div>
          <div css={css`flex: 1;`}>
            <Button display="full" size="large" color="dark" variant="weak" onClick={() => toast("회의 링크를 복사했어요")}>
              ↗ 공유
            </Button>
          </div>
        </div>
      </div>
    </Content>
  );
}

function FactRow({ ico, children, warn, last }: { ico: string; children: React.ReactNode; warn?: string; last?: boolean }) {
  return (
    <div
      css={css`
        display: flex; align-items: flex-start; gap: 8px;
        padding: 12px 0; border-bottom: ${last ? "none" : `1px solid ${colors.grey100}`};
        font-size: 13px; color: ${colors.grey800};
      `}
    >
      <span css={css`font-size: 15px;`}>{ico}</span>
      <span>
        {children}
        {warn && <em css={css`display: block; font-style: normal; font-size: 11px; color: ${colors.orange600}; margin-top: 2px;`}>{warn}</em>}
      </span>
    </div>
  );
}
