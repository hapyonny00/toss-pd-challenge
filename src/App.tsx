import { css, keyframes } from "@emotion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RATIONALE, type ScreenId } from "./rationale";
import { Home, Create, Add, Collecting, Tap } from "./screens/flow";
import { Recommend, Ask, Waiting } from "./screens/decide";
import { Confirmed, Reschedule, Rescheduled } from "./screens/confirm";

const pagein = keyframes`from { opacity: 0; transform: translateX(14px); }`;

function initialScreen(): ScreenId {
  const h = location.hash.slice(1) as ScreenId;
  return RATIONALE[h] ? h : "p-home";
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(initialScreen);
  const [toastMsg, setToastMsg] = useState("");
  const [eventTitle, setEventTitle] = useState("디자인 리뷰 · 6명");
  const [alarmMin, setAlarmMin] = useState(10);
  const screenRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number>();

  const nav = useCallback((id: ScreenId) => {
    setScreen(id);
    if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    screenRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
    document.title = "회의 잡기 — " + id.replace("p-", "");
  }, []);

  useEffect(() => {
    const onPop = () => setScreen(initialScreen());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(""), 2400);
  }, []);

  const event = { title: eventTitle, setTitle: setEventTitle, alarmMin, setAlarmMin };
  const p = { nav, toast };
  const r = RATIONALE[screen];

  return (
    <div className="stage">
      <aside className="rail" aria-label="설계 노트">
        <div className="rail-brand">
          <span className="rail-logo">toss</span>
          <span className="rail-divider" />
          <span className="rail-prod">회의 잡기</span>
        </div>
        <p className="rail-eyebrow">설계 노트</p>
        <h1 className="rail-title" dangerouslySetInnerHTML={{ __html: r.t }} />
        <ul className="rail-list">
          {r.b.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
        <p className="rail-note">
          React + 실제 TDS mobile(@toss/tds-mobile) · 375 네이티브
          <br />
          Toss PD Challenge 2026 · 화면을 눌러 전체 플로우를 걸어보세요
        </p>
      </aside>

      <div className="device">
        <div className="screen" ref={screenRef}>
          <main
            key={screen}
            css={css`
              display: flex; flex-direction: column; min-height: 100%;
              animation: ${pagein} 260ms cubic-bezier(0.16, 1, 0.3, 1);
            `}
          >
            {screen === "p-home" && <Home {...p} />}
            {screen === "p-create" && <Create {...p} />}
            {screen === "p-add" && <Add {...p} />}
            {screen === "p-collecting" && <Collecting {...p} />}
            {screen === "p-tap" && <Tap {...p} />}
            {screen === "p-recommend" && <Recommend {...p} />}
            {screen === "p-ask" && <Ask {...p} />}
            {screen === "p-waiting" && <Waiting {...p} />}
            {screen === "p-confirmed" && <Confirmed {...p} event={event} />}
            {screen === "p-reschedule" && <Reschedule {...p} />}
            {screen === "p-rescheduled" && <Rescheduled {...p} event={event} />}
          </main>
        </div>

        <div
          role="status"
          aria-live="polite"
          css={css`
            position: absolute; left: 50%; bottom: 28px; z-index: 50;
            transform: translateX(-50%) translateY(${toastMsg ? 0 : "16px"});
            background: #191f28; color: #fff;
            font-size: 13px; font-weight: 600;
            padding: 11px 18px; border-radius: 999px;
            box-shadow: 0 8px 24px rgba(25, 31, 40, 0.25);
            opacity: ${toastMsg ? 1 : 0};
            pointer-events: none; white-space: nowrap;
            transition: opacity 220ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
            @media (max-width: 1023px) {
              position: fixed; bottom: 32px;
            }
          `}
        >
          {toastMsg}
        </div>
      </div>
    </div>
  );
}
