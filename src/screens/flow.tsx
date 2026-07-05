/** 홈 · 만들기 · 동료 추가 · 조율 중 · 동료 탭 */
import { css } from "@emotion/react";
import { useMemo, useState } from "react";
import { Badge, Button, List, ListRow, TextButton } from "@toss/tds-mobile";
import { colors } from "@toss/tds-colors";
import { Avatar, Callout, Content, Hint, InfoChip, Input, Intro, Nav, SecHead } from "../components/ui";
import { DIRECTORY, PEOPLE } from "../data";
import { when } from "../lib/calendar";
import type { ScreenProps } from "../types";

/* 리스트를 화면 좌우 끝까지 흘리기 (TDS ListRow의 자체 패딩 사용) */
const bleed = css`margin: 0 -20px;`;

/* ============ 홈 ============ */
export function Home({ nav }: ScreenProps) {
  return (
    <Content>
      <div css={css`display: flex; align-items: center; justify-content: space-between; padding: 14px 0 2px;`}>
        <span css={css`font-size: 22px; font-weight: 800; letter-spacing: -0.5px;`}>회의</span>
        <Avatar size={32} me>화</Avatar>
      </div>
      <Hint>확정하면 모두의 캘린더에 자동으로 들어가요</Hint>

      <SecHead>다가오는 회의</SecHead>
      <HomeCard
        onClick={() => nav("p-confirmed")}
        hi
        title="목요일 오전 10시"
        titleBadge={<Badge size="xsmall" variant="weak" color="blue">방금 잡았어요</Badge>}
        sub={`${when.thuShort()} · 1시간 · 5명 · 10층 회의실 A`}
        right={<Badge size="small" variant="weak" color="green">확정</Badge>}
      />
      <SecHead>조율하는 중</SecHead>
      <HomeCard
        onClick={() => nav("p-collecting")}
        title="시간을 모으고 있어요"
        sub="6명 중 4명이 답했어요 · 곧 정할 수 있어요"
        right={<Badge size="small" variant="weak" color="elephant">4 / 6</Badge>}
      />
      <HomeCard
        onClick={() => nav("p-tap")}
        title="이서연님의 회의"
        sub="시간을 골라주세요 · 10초면 돼요"
        right={<Badge size="small" variant="weak" color="yellow">답할 차례</Badge>}
      />

      <div css={css`margin-top: 20px;`}>
        <Button display="full" size="xlarge" onClick={() => nav("p-create")}>
          새 회의 잡기
        </Button>
      </div>
    </Content>
  );
}

function HomeCard({
  title, titleBadge, sub, right, hi, onClick,
}: {
  title: string; titleBadge?: React.ReactNode; sub: string;
  right: React.ReactNode; hi?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      css={css`
        width: 100%; display: flex; align-items: center; justify-content: space-between;
        gap: 14px; text-align: left; cursor: pointer; font-family: inherit;
        background: ${colors.white};
        border: 1px solid ${hi ? "rgba(49,130,246,.4)" : colors.grey200};
        border-radius: 16px; padding: 16px 18px; margin-bottom: 8px;
        ${hi ? "box-shadow: 0 6px 20px rgba(25,31,40,.08);" : ""}
        transition: transform 150ms, border-color 150ms;
        &:active { transform: scale(0.99); }
        &:focus-visible { outline: 2px solid ${colors.blue500}; outline-offset: 2px; }
      `}
    >
      <span css={css`display: flex; flex-direction: column; gap: 3px; min-width: 0;`}>
        <span css={css`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`}>
          <b css={css`font-size: 15px; font-weight: 700;`}>{title}</b>
          {titleBadge}
        </span>
        <span css={css`font-size: 12.5px; color: ${colors.grey500};`}>{sub}</span>
      </span>
      {right}
    </button>
  );
}

/* ============ 회의 만들기 ============ */
export function Create({ nav }: ScreenProps) {
  const [must, setMust] = useState(PEOPLE.map((p) => p.must));
  return (
    <>
      <Nav title="회의 만들기" onBack={() => nav("p-home")} />
      <Content>
        <Intro title="누가 모여야 하나요?" sub="다음 주 안에 1시간, 같이 모일 사람을 골라요" />
        <div
          css={css`
            display: flex; align-items: center; gap: 8px;
            background: ${colors.grey50}; border-radius: 10px;
            padding: 8px 12px; font-size: 12.5px; color: ${colors.grey600};
          `}
        >
          <Avatar size={26} me>화</Avatar> 나(김화연)는 자동으로 들어가요
        </div>

        <SecHead>함께할 사람 · 6명</SecHead>
        <List css={bleed}>
          {PEOPLE.map((p, i) => (
            <ListRow
              key={p.name}
              horizontalPadding="small"
              verticalPadding="small"
              left={<Avatar>{p.initial}</Avatar>}
              contents={<ListRow.Texts type="2RowTypeA" top={p.name} bottom={p.role} />}
              right={
                <Pill
                  must={must[i]}
                  onClick={() => setMust((m) => m.map((v, j) => (j === i ? !v : v)))}
                />
              }
            />
          ))}
        </List>

        <button
          onClick={() => nav("p-add")}
          css={css`
            width: 100%; height: 46px; margin-top: 10px;
            border: 1.5px dashed ${colors.grey300}; background: none;
            border-radius: 12px; font-family: inherit;
            font-size: 14px; font-weight: 600; color: ${colors.grey600}; cursor: pointer;
            &:hover { border-color: ${colors.grey400}; }
            &:focus-visible { outline: 2px solid ${colors.blue500}; }
          `}
        >
          ＋ 동료 추가
        </button>

        <div css={css`display: flex; gap: 8px; margin: 18px 0 22px;`}>
          <InfoChip>🕐 1시간 ›</InfoChip>
          <InfoChip>📅 다음 주까지 ›</InfoChip>
        </div>

        <Button display="full" size="xlarge" onClick={() => nav("p-collecting")}>
          동료 시간 확인하기
        </Button>
      </Content>
    </>
  );
}

function Pill({ must, onClick }: { must: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      css={css`
        font-size: 12px; font-weight: 600; font-family: inherit;
        padding: 7px 12px; border-radius: 999px; cursor: pointer;
        white-space: nowrap;
        border: 1px solid ${must ? "transparent" : colors.grey200};
        background: ${must ? colors.blue50 : "none"};
        color: ${must ? colors.blue500 : colors.grey500};
        transition: background 150ms;
        &:focus-visible { outline: 2px solid ${colors.blue500}; }
      `}
    >
      {must ? "꼭 와야 해요 ⇄" : "안 와도 돼요 ⇄"}
    </button>
  );
}

/* ============ 동료 추가 ============ */
export function Add({ nav }: ScreenProps) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    [...DIRECTORY.team, ...DIRECTORY.recent].forEach((p) => (init[p.name] = p.picked));
    return init;
  });
  const count = useMemo(() => Object.values(picked).filter(Boolean).length, [picked]);
  const filter = (list: typeof DIRECTORY.team) =>
    list.filter((p) => !q || p.name.includes(q) || p.role.includes(q));

  const section = (label: string, list: typeof DIRECTORY.team) => {
    const rows = filter(list);
    if (rows.length === 0) return null;
    return (
      <>
        <SecHead>{label}</SecHead>
        <List css={bleed}>
          {rows.map((p) => (
            <ListRow
              key={p.name}
              horizontalPadding="small"
              verticalPadding="small"
              onClick={() => setPicked((m) => ({ ...m, [p.name]: !m[p.name] }))}
              withTouchEffect
              left={<Avatar>{p.initial}</Avatar>}
              contents={<ListRow.Texts type="2RowTypeA" top={p.name} bottom={p.role} />}
              right={<Check on={picked[p.name]} />}
            />
          ))}
        </List>
      </>
    );
  };

  return (
    <>
      <Nav title="동료 추가" onBack={() => nav("p-create")} />
      <Content>
        <Input
          placeholder="🔍  이름이나 팀으로 찾기"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {section("우리 팀", DIRECTORY.team)}
        {section("최근 함께 일한 사람", DIRECTORY.recent)}
        <div css={css`margin-top: 20px;`}>
          <Button display="full" size="xlarge" onClick={() => nav("p-create")}>
            {count}명으로 계속하기
          </Button>
        </div>
      </Content>
    </>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      css={css`
        width: 24px; height: 24px; border-radius: 999px;
        display: grid; place-items: center; font-size: 13px; font-weight: 800;
        border: 1.5px solid ${on ? colors.blue500 : colors.grey300};
        background: ${on ? colors.blue500 : "none"};
        color: ${on ? colors.white : "transparent"};
        transition: background 150ms;
      `}
    >
      ✓
    </span>
  );
}

/* ============ 시간 모으는 중 (주최자) ============ */
export function Collecting({ nav }: ScreenProps) {
  return (
    <>
      <Nav title="시간 모으는 중" onBack={() => nav("p-home")} />
      <Content>
        <Intro title="동료들 시간을 모으고 있어요" />
        <div css={css`margin-top: -8px; margin-bottom: 4px;`}>
          <InfoChip warn>📅 다음 주까지 · 4일 남았어요</InfoChip>
        </div>
        <Callout blue title="캘린더는 자동으로 확인했어요">
          일정 제목은 안 보고, 비어 있는지만 봤어요. 지금은 각자 선호만 받고 있어요.
        </Callout>

        <div css={css`display: flex; justify-content: space-between; font-size: 12.5px; color: ${colors.grey600}; margin-top: 14px; b { color: ${colors.grey900}; }`}>
          <span>답한 사람</span><b>4 / 6</b>
        </div>
        <div css={css`height: 6px; background: ${colors.grey200}; border-radius: 3px; overflow: hidden; margin: 8px 0 8px;`}>
          <i css={css`display: block; height: 100%; width: 66%; background: ${colors.blue500}; border-radius: 3px;`} />
        </div>

        <List css={bleed}>
          {PEOPLE.map((p) => (
            <ListRow
              key={p.name}
              horizontalPadding="small"
              verticalPadding="small"
              left={<Avatar>{p.initial}</Avatar>}
              contents={
                <ListRow.Texts
                  type="1RowTypeA"
                  top={
                    <span>
                      {p.name}{" "}
                      <em css={css`font-style: normal; font-size: 11px; font-weight: 700; color: ${p.must ? colors.blue500 : colors.grey400};`}>
                        {p.must ? "꼭" : "선택"}
                      </em>
                    </span>
                  }
                />
              }
              right={
                <span css={css`font-size: 12.5px; font-weight: 600; color: ${p.answered ? colors.green500 : colors.grey400}; white-space: nowrap;`}>
                  {p.answered ? "✓ 답했어요" : "기다리는 중"}
                </span>
              }
            />
          ))}
        </List>

        <Callout>
          <b css={css`color: ${colors.grey900};`}>꼭 와야 하는 4명은 이미 다 답했어요.</b>{" "}
          두 명을 더 기다리지 않고 지금 정해도 돼요.
        </Callout>

        <Button display="full" size="xlarge" onClick={() => nav("p-recommend")}>
          추천 시간 보기
        </Button>
        <div css={css`margin-top: 8px;`}>
          <Button display="full" size="large" color="dark" variant="weak" onClick={() => nav("p-tap")}>
            동료 응답 화면 보기 (데모)
          </Button>
        </div>
      </Content>
    </>
  );
}

/* ============ 동료 10초 탭 (응답자) ============ */
export function Tap({ nav, toast }: ScreenProps) {
  const [bad, setBad] = useState([false, false, false]);
  const [free, setFree] = useState(false);
  const slots = [
    { label: "수요일 오후 2시", date: when.wedShort() },
    { label: "목요일 오전 10시", date: when.thuShort() },
    { label: "금요일 오후 4시", date: when.friShort() },
  ];
  return (
    <Content>
      <div css={css`display: flex; align-items: center; gap: 8px; margin: 14px 0 6px;`}>
        <Avatar size={26} me>화</Avatar>
        <span css={css`font-size: 13px; color: ${colors.grey600};`}>김화연님이 회의 시간을 찾고 있어요</span>
      </div>
      <Intro title="안 되는 시간만 알려주세요" sub="모두 비어 있는 시간이에요 · 다 괜찮으면 그대로 보내요" />

      {slots.map((s, i) => (
        <button
          key={s.label}
          onClick={() => setBad((b) => b.map((v, j) => (j === i ? !v : v)))}
          css={css`
            width: 100%; display: flex; align-items: center; justify-content: space-between;
            text-align: left; font-family: inherit; cursor: pointer;
            background: ${bad[i] ? colors.red50 : colors.white};
            border: 1px solid ${bad[i] ? "rgba(240,68,82,.4)" : colors.grey200};
            border-radius: 12px; padding: 15px 18px; margin-bottom: 8px;
            transition: border-color 150ms, background 150ms;
            &:focus-visible { outline: 2px solid ${colors.blue500}; }
          `}
        >
          <span>
            <b css={css`font-size: 15px; font-weight: 600; color: ${bad[i] ? colors.red500 : colors.grey900};`}>{s.label}</b>
            <small css={css`display: block; font-size: 11.5px; color: ${bad[i] ? colors.red400 : colors.grey500}; margin-top: 2px;`}>{s.date}</small>
          </span>
          <span css={css`font-size: 13px; font-weight: 600; color: ${bad[i] ? colors.red500 : colors.green500}; white-space: nowrap;`}>
            {bad[i] ? "✕ 안 돼요" : "✓ 괜찮아요"}
          </span>
        </button>
      ))}

      <div css={css`text-align: center; margin: 4px 0 10px;`}>
        <TextButton size="small" onClick={() => setFree((f) => !f)}>
          셋 다 안 맞으면, 되는 시간 알려주기
        </TextButton>
      </div>
      {free && (
        <div css={css`margin-bottom: 12px;`}>
          <Input placeholder="예) 화요일 오전엔 언제든 좋아요" autoFocus />
        </div>
      )}

      <Button
        display="full"
        size="xlarge"
        onClick={() => {
          toast("답을 보냈어요. 10초 만에 끝!");
          nav("p-collecting");
        }}
      >
        보내기
      </Button>
    </Content>
  );
}
