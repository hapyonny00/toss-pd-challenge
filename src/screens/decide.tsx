/** 추천+거래(히어로) · 조정 부탁 · 조정 대기 */
import { css } from "@emotion/react";
import { useState } from "react";
import { Badge, Button } from "@toss/tds-mobile";
import { colors } from "@toss/tds-colors";
import { Avatar, Callout, Content, Hint, Intro, MsgBox, Nav, popCss } from "../components/ui";
import { when } from "../lib/calendar";
import type { ScreenProps } from "../types";

/* ============ 추천 + 거래 (히어로) ============ */
export function Recommend({ nav }: ScreenProps) {
  const people: { c: string; name: string; ring: "green" | "blue" | "dash"; away?: boolean }[] = [
    { c: "김", name: "김민준", ring: "green" },
    { c: "이", name: "이서연", ring: "green" },
    { c: "박", name: "박지후", ring: "green" },
    { c: "정", name: "정하은", ring: "green" },
    { c: "최", name: "최도윤", ring: "blue" },
    { c: "강", name: "강수아", ring: "dash", away: true },
  ];
  return (
    <>
      <Nav title="추천 시간" onBack={() => nav("p-collecting")} />
      <Content>
        <Intro title="이 시간이 가장 좋아요" sub="꼭 와야 하는 4명 기준으로 골랐어요" />

        <section
          css={css`
            background: ${colors.white};
            border: 1px solid ${colors.grey200};
            border-radius: 16px; padding: 20px;
            box-shadow: 0 8px 24px rgba(25, 31, 40, 0.08);
          `}
        >
          <div css={css`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`}>
            <span css={css`font-size: 25px; font-weight: 800; letter-spacing: -0.5px;`}>목요일 오전 10시</span>
            <Badge size="small" variant="weak" color="green">추천</Badge>
          </div>
          <p css={css`font-size: 12.5px; color: ${colors.grey500}; margin-top: 2px;`}>{when.thuLong()}</p>

          <div css={css`display: flex; justify-content: space-between; margin: 20px 0 14px;`}>
            {people.map((p, i) => (
              <div
                key={p.name}
                css={css`
                  position: relative; display: flex; flex-direction: column;
                  align-items: center; gap: 6px; width: 46px;
                  ${popCss(120 + i * 60)}
                `}
              >
                <Avatar ring={p.ring}>{p.c}</Avatar>
                {p.ring !== "dash" && (
                  <span
                    css={css`
                      position: absolute; top: -2px; right: 0;
                      width: 16px; height: 16px; display: grid; place-items: center;
                      background: ${p.ring === "blue" ? colors.blue500 : colors.green500};
                      color: ${colors.white}; font-size: 10px; font-weight: 800;
                      border-radius: 999px; border: 2px solid ${colors.white};
                    `}
                  >
                    ✓
                  </span>
                )}
                <span css={css`font-size: 11px; color: ${p.away ? colors.grey400 : colors.grey600};`}>{p.name}</span>
              </div>
            ))}
          </div>

          <ul css={css`list-style: none; border-top: 1px solid ${colors.grey100};`}>
            <Fact label="꼭 와야 하는 4명" value="모두 가능" green />
            <Fact label="선택 참석 2명" value="최도윤님 가능" />
            <Fact label="피하고 싶은 시간" value="없음" green last />
          </ul>
          <p css={css`margin-top: 12px; font-size: 13px; line-height: 1.6; color: ${colors.grey600};`}>
            선택 참석이 한 명 더 올 수 있고, 피하고 싶은 시간이 없어서 가장 좋아요.
          </p>
          <div css={css`background: ${colors.grey50}; border-radius: 12px; padding: 12px 14px; margin: 14px 0;`}>
            <p css={css`font-size: 12.5px; line-height: 1.6; color: ${colors.grey600}; b { color: ${colors.grey800}; }`}>
              강수아님은 <b>선택 참석</b>이라, 외근이어도 회의는 그대로 진행돼요.
            </p>
          </div>
          <Button display="full" size="xlarge" onClick={() => nav("p-confirmed")}>
            목요일 오전 10시로 잡기
          </Button>
        </section>

        <section
          css={css`
            margin-top: 16px;
            background: linear-gradient(180deg, ${colors.blue50}, #f4f9ff);
            border-radius: 16px; padding: 20px;
          `}
        >
          <span
            css={css`
              display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
              color: ${colors.blue500}; background: ${colors.white};
              padding: 4px 10px; border-radius: 999px; margin-bottom: 12px;
            `}
          >
            전원이 모이려면
          </span>
          <h3 css={css`font-size: 17px; font-weight: 700; line-height: 1.4; letter-spacing: -0.2px;`}>
            화요일 오전 11시면 6명 모두 와요
          </h3>
          <p css={css`margin: 8px 0 16px; font-size: 13px; line-height: 1.6; color: ${colors.grey700}; b { color: ${colors.blue600}; }`}>
            박지후님 일정과 <b>30분만</b> 겹쳐요. 그 회의를 조금만 옮기면 전원이 모여요.
          </p>
          <Button display="full" size="large" variant="weak" onClick={() => nav("p-ask")}>
            박지후님에게 30분 조정 부탁하기
          </Button>
        </section>

        <p css={css`font-size: 13px; color: ${colors.grey500}; margin: 24px 0 8px;`}>다른 시간도 있어요</p>
        <Alt time="수요일 오후 3시" sub="꼭 4명 가능 · 선택 0명" />
        <Alt time="금요일 오후 4시" sub="꼭 3명 가능 · 이서연님 외근" />
      </Content>
    </>
  );
}

function Fact({ label, value, green, last }: { label: string; value: string; green?: boolean; last?: boolean }) {
  return (
    <li
      css={css`
        display: flex; align-items: center; justify-content: space-between;
        padding: 11px 0; border-bottom: ${last ? "none" : `1px solid ${colors.grey100}`};
      `}
    >
      <span css={css`font-size: 13px; color: ${colors.grey600};`}>{label}</span>
      <span css={css`font-size: 13px; font-weight: 600; color: ${green ? colors.green500 : colors.grey900};`}>{value}</span>
    </li>
  );
}

function Alt({ time, sub, onClick }: { time: string; sub: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      css={css`
        width: 100%; display: flex; align-items: center; justify-content: space-between;
        gap: 12px; text-align: left; font-family: inherit; cursor: pointer;
        background: ${colors.white}; border: 1px solid ${colors.grey200};
        border-radius: 12px; padding: 13px 16px; margin-bottom: 8px;
        transition: border-color 150ms;
        &:hover { border-color: ${colors.grey300}; }
        &:focus-visible { outline: 2px solid ${colors.blue500}; }
      `}
    >
      <span css={css`display: flex; flex-direction: column; gap: 2px;`}>
        <span css={css`font-size: 15px; font-weight: 600;`}>{time}</span>
        <span css={css`font-size: 12px; color: ${colors.grey500};`}>{sub}</span>
      </span>
      <span css={css`color: ${colors.grey300}; font-size: 18px;`}>›</span>
    </button>
  );
}

/* ============ 조정 부탁 ============ */
export function Ask({ nav, toast }: ScreenProps) {
  return (
    <>
      <Nav title="조정 부탁하기" onBack={() => nav("p-recommend")} />
      <Content>
        <Intro title="박지후님에게 부탁할게요" sub="전원이 모이는 유일한 방법이에요" />
        <Callout blue title="화요일 오전 11시 · 6명 모두 가능">박지후님 다른 회의와 30분 겹쳐요</Callout>
        <p css={css`font-size: 12px; font-weight: 600; color: ${colors.grey500}; margin: 18px 4px 6px;`}>이렇게 보낼게요</p>
        <MsgBox>
          지후님, 화요일 11시 회의를 <b>30분만</b> 뒤로 옮겨주실 수 있을까요? 그러면 6명이 다 모일 수 있어요.
          어려우면 목요일 10시로 진행할게요!{" "}
          <span css={css`position: absolute; top: 12px; right: 14px; color: ${colors.grey400}; font-size: 13px;`}>✎</span>
        </MsgBox>
        <Hint>👆 박지후님은 <b>'옮길게요 / 어려워요'</b>만 누르면 돼요</Hint>
        <Button
          display="full"
          size="xlarge"
          onClick={() => {
            toast("박지후님에게 부탁을 보냈어요");
            nav("p-waiting");
          }}
        >
          부탁 보내기
        </Button>
        <div css={css`margin-top: 8px;`}>
          <Button display="full" size="large" color="dark" variant="weak" onClick={() => nav("p-confirmed")}>
            그냥 목요일 10시로 할게요
          </Button>
        </div>
      </Content>
    </>
  );
}

/* ============ 조정 대기 ============ */
export function Waiting({ nav, toast }: ScreenProps) {
  const [sent, setSent] = useState(false);
  return (
    <>
      <Nav title="박지후님 조정" onBack={() => nav("p-recommend")} />
      <Content>
        <div css={css`text-align: center; padding-top: 8px;`}>
          <div css={css`position: relative; width: 56px; margin: 8px auto 12px;`}>
            <Avatar size={56}>박</Avatar>
            <span
              css={css`
                position: absolute; right: -6px; bottom: -4px; font-size: 14px;
                background: ${colors.orange50}; border-radius: 999px;
                width: 24px; height: 24px; display: grid; place-items: center;
                border: 2px solid ${colors.white};
              `}
            >
              🕐
            </span>
          </div>
          <Intro center title="박지후님 답을 기다리고 있어요" sub="30분 조정을 부탁했어요 · 어제 오후 3시 · 읽음" />
        </div>

        <div css={css`background: ${colors.grey50}; border-radius: 12px; padding: 6px 16px 4px; margin-bottom: 14px;`}>
          <b css={css`display: block; font-size: 13px; font-weight: 700; padding: 10px 0 4px;`}>
            어느 쪽이든 회의는 화요일 11시예요
          </b>
          <div css={css`display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid ${colors.grey100}; font-size: 13px;`}>
            <span css={css`color: ${colors.grey600};`}>옮기면</span>
            <b css={css`color: ${colors.green500}; font-weight: 600;`}>6명 전원이 모여요</b>
          </div>
          <div css={css`display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid ${colors.grey100}; font-size: 13px;`}>
            <span css={css`color: ${colors.grey600};`}>안 옮겨도</span>
            <b css={css`font-weight: 600;`}>5명으로 그대로 진행돼요</b>
          </div>
        </div>

        <MsgBox dim label="보낸 부탁">
          "지후님, 화요일 11시 회의를 30분만 뒤로 옮겨주실 수 있을까요? 어려우면 그대로 진행할게요!"
        </MsgBox>
        <Hint center>급하지 않으면 그냥 기다려도 괜찮아요</Hint>

        <Button
          display="full"
          size="large"
          color="dark"
          variant="weak"
          disabled={sent}
          onClick={() => {
            setSent(true);
            toast("박지후님에게 다시 알렸어요");
          }}
        >
          {sent ? "✓ 알림을 보냈어요 · 하루에 한 번만 보내요" : "🔔 박지후님에게 다시 알림"}
        </Button>
        <div css={css`margin-top: 8px;`}>
          <Button
            display="full"
            size="large"
            color="dark"
            variant="weak"
            onClick={() => {
              toast("5명으로 확정했어요");
              nav("p-rescheduled");
            }}
          >
            ✓ 기다리지 않고 5명으로 확정
          </Button>
        </div>
      </Content>
    </>
  );
}
