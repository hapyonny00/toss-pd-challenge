/* ══════════════════════════════════════════════════════════════════
   Moim(모임) — 토스 2026 PD 챌린지 제출용 하이파이 프로토타입
   "6명의 동료가 1시간 회의를 잡는 경험"

   좌: 옵시디언 다크 위젯(#0F0F11) — Moim 로고(네온 라임) · 12분 링 게이지 ·
       Mira Brown 활성 프로필(#1E1E22)
   중: 챗 피드(화이트) — 블루(#2563EB) 발신 · 피치/옐로 액센트 수신 ·
       기능하는 1:43 오디오 웨이브(재생/일시정지) · MEETING 투표 카드
   우: 스케줄러(다크) — January 2020 그리드(6일 흰 원) · Tue 18 네온 라임 데이 필 ·
       Add new list(Title/Date/Time/Invite 필수·선택) · [온라인/오프라인] 토글 ·
       Submit List

   핵심 UX 논지(서류 문항과 연결):
   - Submit은 '전송'이 아니라 대화창에 투표 카드를 '게시' — 낙탄 불안 제거
   - 필수/선택·온오프라인·이동시간을 제약으로 수집, 조율은 사람이 대화로 확정
   토스 UX 라이팅: 해요체 · 구체적 수치 · 단문
   ══════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback } = React;
const {
  MoreHorizontal, Calendar, Clock, MapPin, Users, Check, Loader2,
  Play, Pause, Video, Phone, Mic, Send, Footprints, Paperclip,
  ChevronLeft, ChevronRight, Search,
} = LucideReact;

/* ── 데모 딥링크: ?demo=card(온라인) | offline | confirmed ── */
const DEMO = new URLSearchParams(location.search).get("demo");
const SIM_DELAY = DEMO ? 150 : 1400;

const AVATAR = {
  mira: "https://i.pravatar.cc/160?img=45",
  sim: "https://i.pravatar.cc/160?img=52",
  you: "https://i.pravatar.cc/160?img=12",
};
const LIME = "#D2FE55";

/* ── Moim 지오메트릭 로고 — 네온 라임 액센트 ── */
function MoimLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-label="Moim">
      <rect x="2" y="2" width="17" height="17" rx="6" fill="#2563EB" />
      <circle cx="20" cy="20" r="8" fill={LIME} />
    </svg>
  );
}

/* ── 12분 링 게이지 — 얇은 방사형 인디케이터 (라임) ── */
function RingGauge() {
  const TICKS = 48, ACTIVE = 34;
  return (
    <div className="relative w-[112px] h-[112px] mx-auto">
      <svg width="112" height="112" viewBox="0 0 120 120">
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const x1 = 60 + Math.cos(a) * 46, y1 = 60 + Math.sin(a) * 46;
          const x2 = 60 + Math.cos(a) * 56, y2 = 60 + Math.sin(a) * 56;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i < ACTIVE ? LIME : "#2E2E33"} strokeWidth="2.5" strokeLinecap="round" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[21px] font-extrabold text-white leading-none">12분</span>
        <span className="text-[9.5px] font-semibold text-gray-500 mt-1">평균 이동 시간</span>
      </div>
    </div>
  );
}

/* ── 좌측: 옵시디언 다크 위젯 ── */
function DarkWidget() {
  return (
    <aside className="w-[248px] flex-none bg-[#0F0F11] rounded-[32px] shadow-[0_12px_40px_rgba(31,21,68,0.18)] flex flex-col p-5 text-white overflow-y-auto">
      <div className="flex items-center gap-2.5 mb-5">
        <MoimLogo />
        <span className="text-[16px] font-extrabold tracking-tight">Moim</span>
      </div>

      {/* 12분 링 게이지 */}
      <div className="bg-[#1E1E22] rounded-[24px] p-4 mb-4 flex-none">
        <RingGauge />
        <p className="text-center text-[10px] font-semibold text-gray-500 mt-3 leading-relaxed">
          오프라인으로 모이면<br />전원 평균 12분이면 도착해요
        </p>
      </div>

      {/* Mira Brown 활성 프로필 */}
      <div className="bg-[#1E1E22] rounded-[24px] p-4 text-center flex-none">
        <img src={AVATAR.mira} alt="Mira Brown" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 ring-2 ring-[#D2FE55]/50" />
        <div className="text-[14px] font-extrabold">Mira Brown</div>
        <div className="text-[10.5px] font-semibold text-gray-500 mb-1.5">@mira.b</div>
        <p className="text-[10px] text-gray-400 leading-snug">
          Visual &amp; Product Design, Research, Typography &amp; Illustration
        </p>
        <div className="flex justify-center gap-1.5 mt-2.5">
          <span className="text-[9.5px] font-bold text-gray-300 bg-white/10 rounded-full px-2 py-0.5">UX/UI designer</span>
          <span className="text-[9.5px] font-bold text-gray-300 bg-white/10 rounded-full px-2 py-0.5">Dribbbler</span>
        </div>
      </div>

      <span className="flex-1 min-h-[12px]" />
      <div className="flex items-center gap-2.5 pt-4 flex-none">
        <img src={AVATAR.you} alt="나" className="w-9 h-9 rounded-full object-cover" />
        <div>
          <div className="text-[12px] font-bold">김지민</div>
          <div className="text-[9.5px] font-semibold text-gray-500">프로덕트 매니저</div>
        </div>
      </div>
    </aside>
  );
}

/* ── 기능하는 오디오 웨이브 버블 — 재생/일시정지 + 실시간 카운트 ── */
function AudioBubble() {
  const TOTAL = 103; /* 1:43 */
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((v) => {
        if (v + 1 >= TOTAL) { setPlaying(false); return 0; }
        return v + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const bars = [5, 9, 14, 8, 12, 16, 10, 6, 13, 9, 15, 7, 11, 5, 9, 12, 6];
  const progress = t / TOTAL;
  return (
    <div className="flex items-center gap-2.5 bg-[#2563EB] text-white rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[250px]">
      <button
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? "일시정지" : "재생"}
        className="w-7 h-7 rounded-full bg-white/25 hover:bg-white/35 flex items-center justify-center flex-none active:scale-90 transition"
      >
        {playing ? <Pause size={12} fill="white" stroke="none" /> : <Play size={13} fill="white" stroke="none" />}
      </button>
      <div className="flex items-center gap-[2px] h-5">
        {bars.map((h, i) => (
          <span
            key={i}
            className={"w-[2.5px] rounded-full transition-colors " + (i / bars.length <= progress && playing ? "bg-[#D2FE55]" : "bg-white/80") + (playing ? " animate-pulse" : "")}
            style={{ height: h }}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold opacity-90 tabular-nums">{playing || t > 0 ? fmt(t) : "1:43"}</span>
    </div>
  );
}

/* ── 투표 상태 행 ── */
function VoteRow({ img, name, state }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <img src={img} alt={name} className="w-7 h-7 rounded-full object-cover" />
      <span className="text-[13px] font-semibold text-gray-800 flex-1">{name}</span>
      {state === "yes" && (
        <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
          <Check size={12} strokeWidth={3} /> 찬성
        </span>
      )}
      {state === "pending" && (
        <span className="flex items-center gap-1 text-[12px] font-semibold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">
          <Loader2 size={12} className="animate-spin" /> 확인 중
        </span>
      )}
      {state === "wait" && (
        <span className="text-[12px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">대기 중</span>
      )}
    </div>
  );
}

/* ── 챗에 게시되는 MEETING 투표 카드 — Submit은 전송이 아니라 '게시' ── */
function MeetingCard({ card, onApprove, onAlt }) {
  const copy = card.type === "offline"
    ? `모두의 이동 시간을 최소화할 수 있는 ${card.place} 근처 공간과 ${card.time}를 찾았어요. 멤버들의 의견을 확인해보세요.`
    : `모두 맞는 시간이 없어서, 김토스님만 30분 조정하면 되는 최적의 대안을 찾았어요. 아래에서 의견을 모아보세요.`;
  return (
    <div className="animate-slidein bg-white border border-gray-200 rounded-[24px] p-4 shadow-[0_12px_40px_rgba(31,21,68,0.08)] max-w-[330px] self-start w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-extrabold tracking-[.14em] text-[#2563EB]">MEETING</span>
        <span className="text-[10px] font-bold text-gray-400">{card.type === "offline" ? "오프라인" : "온라인"}</span>
      </div>
      <h4 className="text-[15px] font-extrabold text-gray-900 mb-1.5">{card.title}</h4>
      <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500 mb-2.5">
        <span className="flex items-center gap-1"><Calendar size={12} /> {card.date}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {card.time}</span>
      </div>
      {card.type === "offline" ? (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
            <MapPin size={13} className="text-[#2563EB]" /> {card.place}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-gray-500">
            <Footprints size={11} /> 전원 이동 시간 평균 12분 · 최대 18분
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-gray-800">
          <Video size={13} className="text-[#2563EB]" /> 화상회의 링크가 시작 10분 전에 도착해요
        </div>
      )}
      <p className="text-[12.5px] leading-relaxed text-gray-600 mb-3">{copy}</p>
      <div className="border-t border-gray-100 pt-1 mb-3">
        <VoteRow img={AVATAR.mira} name="Mira Brown" state={card.votes.mira} />
        <VoteRow img={AVATAR.sim} name="김토스" state={card.votes.sim} />
        <VoteRow img={AVATAR.you} name="나" state={card.votes.you} />
      </div>
      {!card.confirmed ? (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={card.votes.you === "yes"}
            className="flex-1 h-10 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition"
          >
            찬성하기
          </button>
          <button
            onClick={onAlt}
            className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-600 text-[13px] font-bold active:scale-[.98] transition"
          >
            다른 시간 제안
          </button>
        </div>
      ) : (
        <div className="h-10 rounded-xl bg-[#D2FE55] text-[#2A3105] text-[13px] font-extrabold flex items-center justify-center gap-1.5">
          <Check size={14} strokeWidth={3} /> 3명 전원 찬성 · 확정 — 캘린더에 등록했어요
        </div>
      )}
    </div>
  );
}

/* ── 수신 버블 — 피치·옐로 액센트 아이콘 ── */
function InBubble({ img, name, accent, children }) {
  return (
    <div className="animate-fadeup flex items-end gap-2 self-start max-w-[380px]">
      <img src={img} alt={name} className="w-7 h-7 rounded-full object-cover flex-none" />
      <div>
        <div className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1">{name}</div>
        <div className="flex items-end gap-2">
          <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">{children}</div>
          {accent && (
            <span className={"w-7 h-7 rounded-full flex-none flex items-center justify-center text-[11px] " + accent.cls}>{accent.emoji}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 중앙: 챗 피드 (화이트) ── */
function ChatFeed({ card, feed, onApprove, onAlt, onSend }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [card, feed]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <section className="flex-1 min-w-0 bg-white rounded-[32px] shadow-[0_12px_40px_rgba(31,21,68,0.08)] flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <img src={AVATAR.mira} alt="Mira Brown" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-extrabold text-gray-900 tracking-tight">Mira Brown</div>
          <div className="text-[10.5px] font-semibold text-emerald-500">● Online</div>
        </div>
        <button aria-label="영상통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Video size={17} /></button>
        <button aria-label="음성통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Phone size={16} /></button>
        <button aria-label="더보기" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><MoreHorizontal size={17} /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        <div className="text-center text-[10.5px] font-bold text-gray-300 py-1">오늘 · 2:20 pm</div>
        <InBubble img={AVATAR.mira} name="Mira Brown" accent={{ emoji: "🎉", cls: "bg-amber-100" }}>
          좋은 소식이에요! 새 프로젝트가 시작돼요. 킥오프에서 자세히 공유할게요 :)
        </InBubble>
        <div className="bg-[#2563EB] text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[280px]">
          기대돼요! 킥오프 일정부터 잡아볼게요.
        </div>
        <InBubble img={AVATAR.sim} name="김토스" accent={{ emoji: "🙏", cls: "bg-orange-100" }}>
          저 다음 주 화요일에 외근 있어요. 오후 3시 이후면 가능해요!
        </InBubble>
        <AudioBubble />
        <InBubble img={AVATAR.mira} name="Mira Brown">
          넵, 저는 월·화 오후가 편해요. 정해지면 알려주세요 😊
        </InBubble>

        {card && <MeetingCard card={card} onApprove={onApprove} onAlt={onAlt} />}
        {feed.map((m, i) =>
          m.side === "out" ? (
            <div key={i} className="animate-fadeup bg-[#2563EB] text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[280px]">{m.text}</div>
          ) : (
            <div key={i} className="animate-fadeup flex items-end gap-2 self-start max-w-[330px]">
              {m.bot ? (
                <span className="w-7 h-7 rounded-full bg-[#D2FE55] text-[#2A3105] text-[10px] font-extrabold flex items-center justify-center flex-none">M</span>
              ) : (
                <img src={AVATAR[m.who] || AVATAR.mira} alt="" className="w-7 h-7 rounded-full object-cover flex-none" />
              )}
              <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">{m.text}</div>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      <footer className="px-5 pb-5">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-2 py-2 shadow-[0_6px_24px_rgba(31,21,68,0.06)]">
          <button aria-label="첨부" className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 flex-none"><Paperclip size={15} /></button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="메시지를 입력해보세요"
            className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-gray-400 px-1"
          />
          <button aria-label="음성 입력" className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 flex-none"><Mic size={15} /></button>
          <button onClick={send} aria-label="보내기" className="w-9 h-9 rounded-full bg-[#2563EB] hover:bg-blue-700 flex items-center justify-center text-white flex-none active:scale-95 transition"><Send size={14} /></button>
        </div>
      </footer>
    </section>
  );
}

/* ── 우측: 스케줄러 (다크 상단 + Add new list 화이트 카드) ── */
function SchedulerPane({ onSubmit, confirmedDay, meetingType, setMeetingType, place, setPlace, title, setTitle, time, setTime, invitees, toggleRequired, inviteFlash }) {
  const lead = [29, 30, 31];
  const dots = new Set([8, 9, 12, 14, 16, 22, 23]);
  const dayPills = [["Mon", 17], ["Tue", 18], ["Wed", 19], ["Thu", 20], ["Fri", 21]];
  return (
    <section className="w-[340px] flex-none bg-[#0F0F11] rounded-[32px] shadow-[0_12px_40px_rgba(31,21,68,0.18)] flex flex-col overflow-hidden text-white">
      {/* month grid */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center mb-3">
          <span className="text-[15px] font-extrabold tracking-tight flex-1">January 2020</span>
          <button aria-label="이전 달" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><ChevronLeft size={15} /></button>
          <button aria-label="다음 달" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><ChevronRight size={15} /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="text-[10px] font-bold text-gray-500 py-1">{d}</span>
          ))}
          {lead.map((n) => (
            <span key={"l" + n} className="text-[12px] font-semibold text-gray-600 py-1">{n}</span>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => (
            <span key={n} className="relative py-1 flex flex-col items-center">
              <span
                className={
                  "w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-semibold " +
                  (n === 6 ? "bg-white text-[#0F0F11] font-extrabold" : "text-gray-200")
                }
              >
                {n}
              </span>
              {confirmedDay === n ? (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#D2FE55] ring-2 ring-[#D2FE55]/30" />
              ) : dots.has(n) ? (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white/40" />
              ) : null}
            </span>
          ))}
        </div>
        {/* 데이 필 — 활성 Tue 18 네온 라임 */}
        <div className="flex gap-1.5 mt-3">
          {dayPills.map(([dow, n]) => {
            const active = n === 18;
            return (
              <button
                key={n}
                className={
                  "flex-1 rounded-2xl py-2 flex flex-col items-center gap-0.5 transition " +
                  (active ? "bg-[#D2FE55] text-[#2A3105]" : "bg-white/5 text-gray-400 hover:bg-white/10")
                }
              >
                <span className="text-[9px] font-bold">{dow}</span>
                <span className={"text-[14px] font-extrabold " + (active ? "" : "text-gray-200")}>{n}</span>
              </button>
            );
          })}
        </div>
        {confirmedDay && (
          <div className="animate-fadeup mt-2.5 flex items-center gap-1.5 text-[11.5px] font-bold text-[#D2FE55]">
            <Check size={12} strokeWidth={3} /> 1월 {confirmedDay}일 {time} · {title} 확정
          </div>
        )}
      </div>

      {/* Add new list — 화이트 카드 */}
      <div className="bg-white text-gray-900 rounded-t-[28px] flex-1 px-5 pt-4 pb-5 flex flex-col overflow-y-auto">
        <div className="flex items-center mb-2.5">
          <span className="text-[14.5px] font-extrabold flex-1">Add new list</span>
          <button aria-label="옵션" className="text-gray-300"><MoreHorizontal size={17} /></button>
        </div>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full border-b border-gray-200 focus:border-[#2563EB] outline-none text-[13px] py-2.5 placeholder:text-gray-300 transition-colors"
        />
        <div className="flex gap-4">
          <label className="flex-1 flex items-center gap-1.5 border-b border-gray-200 py-2.5 text-[13px] text-gray-700">
            <span className="flex-1">1월 6일</span><Calendar size={13} className="text-gray-300" />
          </label>
          <label className="flex-1 flex items-center gap-1.5 border-b border-gray-200 py-2.5">
            <input value={time} onChange={(e) => setTime(e.target.value)} className="w-full outline-none text-[13px] text-gray-700" />
            <Clock size={13} className="text-gray-300" />
          </label>
        </div>

        {/* Invite people — 필수/선택을 칩으로 토글 */}
        <div className={"border-b border-gray-200 py-2.5 transition rounded-lg " + (inviteFlash ? "ring-2 ring-[#2563EB]/60 bg-blue-50/50" : "")}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[11px] font-bold text-gray-400 flex-1">Invite people · 칩을 누르면 필수↔선택</span>
            <Users size={13} className="text-gray-300" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {invitees.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleRequired(p.id)}
                className={
                  "flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 text-[11px] font-bold transition active:scale-95 " +
                  (p.required ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-500")
                }
              >
                <img src={p.img} alt="" className="w-5 h-5 rounded-full object-cover" />
                {p.name}
                <span className={"text-[9px] font-extrabold rounded-full px-1.5 py-0.5 " + (p.required ? "bg-white/25" : "bg-gray-200 text-gray-500")}>
                  {p.required ? "필수" : "선택"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 하이브리드 컨트롤 — 온라인/오프라인 */}
        <div className="mt-3.5 p-1 rounded-full bg-gray-100 flex" role="tablist" aria-label="미팅 방식">
          {[["online", "온라인"], ["offline", "오프라인"]].map(([v, label]) => (
            <button
              key={v} role="tab" aria-selected={meetingType === v}
              onClick={() => setMeetingType(v)}
              className={
                "flex-1 h-9 rounded-full text-[12.5px] font-bold transition-all " +
                (meetingType === v ? "bg-white text-[#2563EB] shadow-sm" : "text-gray-400")
              }
            >
              {label}
            </button>
          ))}
        </div>
        {meetingType === "offline" && (
          <div className="animate-expand overflow-hidden">
            <label className="flex items-center gap-1.5 border-b border-gray-200 py-2.5 mt-1">
              <MapPin size={13} className="text-[#2563EB] flex-none" />
              <input
                value={place} onChange={(e) => setPlace(e.target.value)} placeholder="만날 장소"
                className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-300"
              />
            </label>
            <p className="text-[10.5px] text-gray-400 pt-1.5">멤버 3명의 위치 기준으로 이동 시간을 계산해요</p>
          </div>
        )}

        <span className="flex-1" />
        <button
          onClick={onSubmit}
          className="self-center mt-4 h-11 px-8 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[13.5px] font-bold shadow-lg shadow-blue-500/25 active:scale-[.97] transition"
        >
          Submit List
        </button>
      </div>
    </section>
  );
}

/* ── 확정 토스트 ── */
function Toast({ show }) {
  if (!show) return null;
  return (
    <div className="animate-slidein fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0F0F11] text-white text-[13px] font-bold px-6 py-3.5 rounded-full shadow-2xl">
      장소와 일정이 확정되었어요. 캘린더에 등록할게요! 🎉
    </div>
  );
}

/* ── 앱 루트 ── */
function App() {
  const [meetingType, setMeetingType] = useState("online");
  const [place, setPlace] = useState("강남역");
  const [title, setTitle] = useState("팀 킥오프");
  const [time, setTime] = useState("오후 3시");
  const [card, setCard] = useState(null);
  const [feed, setFeed] = useState([]);
  const [confirmedDay, setConfirmedDay] = useState(null);
  const [toast, setToast] = useState(false);
  const [inviteFlash, setInviteFlash] = useState(false);
  const [invitees, setInvitees] = useState([
    { id: "mira", name: "Mira", img: AVATAR.mira, required: true },
    { id: "sim", name: "김토스", img: AVATAR.sim, required: true },
    { id: "you", name: "나", img: AVATAR.you, required: false },
  ]);
  const toggleRequired = (id) => setInvitees((arr) => arr.map((p) => p.id === id ? { ...p, required: !p.required } : p));

  /* Submit = 강제 전송이 아니라 챗에 '투표 카드' 게시 (맥락적 안전장치) */
  const submit = useCallback(() => {
    setCard({
      type: meetingType,
      title: title.trim() || "팀 킥오프",
      place: place.trim() || "강남역",
      date: "1월 6일 (월)",
      time,
      votes: { mira: "yes", sim: "pending", you: "wait" },
      confirmed: false,
    });
    setFeed([]);
    setConfirmedDay(null);
    setToast(false);
  }, [meetingType, place, title, time]);

  const approve = useCallback(() => {
    setCard((c) => c && { ...c, votes: { ...c.votes, you: "yes" } });
    setTimeout(() => {
      setCard((c) => c && { ...c, votes: { ...c.votes, sim: "yes" }, confirmed: true });
      setFeed((f) => [...f, { side: "in", bot: true, text: "장소와 일정이 확정되었어요. 캘린더에 등록할게요! 🎉" }]);
      setConfirmedDay(6);
      setToast(true);
      setTimeout(() => setToast(false), 3200);
    }, SIM_DELAY);
  }, []);

  const suggestAlt = useCallback(() => {
    setFeed((f) => [...f, { side: "out", text: "오후 4시는 어때요? 3시엔 리뷰가 하나 있어요." }]);
    setTimeout(() => {
      setTime("오후 4시");
      setCard((c) => c && { ...c, time: "오후 4시" });
      setFeed((f) => [...f, { side: "in", who: "mira", text: "좋아요, 오후 4시로 다시 모을게요 👍" }]);
    }, SIM_DELAY);
  }, []);

  const sendMessage = useCallback((text) => {
    setFeed((f) => [...f, { side: "out", text }]);
    setTimeout(() => {
      setFeed((f) => [...f, { side: "in", who: "sim", text: "넵, 확인했어요 👍" }]);
    }, SIM_DELAY);
  }, []);

  /* 셸 Nav Rail [팀원 추가] → Invite 영역 하이라이트 (모든 화면에서 동작 유지) */
  useEffect(() => {
    const h = (e) => {
      if (e.data && e.data.openPicker) {
        setInviteFlash(true);
        setTimeout(() => setInviteFlash(false), 2200);
      }
    };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, []);

  /* 데모 딥링크 자동 진행 */
  useEffect(() => {
    if (!DEMO) return;
    const type = DEMO === "card" ? "online" : "offline";
    setMeetingType(type);
    const t1 = setTimeout(() => {
      setCard({
        type, title: "팀 킥오프", place: "강남역",
        date: "1월 6일 (월)", time: "오후 3시",
        votes: { mira: "yes", sim: "pending", you: "wait" }, confirmed: false,
      });
    }, 100);
    let t2;
    if (DEMO === "confirmed") {
      t2 = setTimeout(() => {
        setCard((c) => c && { ...c, votes: { mira: "yes", sim: "yes", you: "yes" }, confirmed: true });
        setFeed([{ side: "in", bot: true, text: "장소와 일정이 확정되었어요. 캘린더에 등록할게요! 🎉" }]);
        setConfirmedDay(6);
      }, 350);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#E9E4FA] via-[#F4F1FD] to-[#DFD9F7] flex gap-5 p-5 max-w-[1280px] mx-auto font-sans h-screen">
      <DarkWidget />
      <ChatFeed card={card} feed={feed} onApprove={approve} onAlt={suggestAlt} onSend={sendMessage} />
      <SchedulerPane
        onSubmit={submit} confirmedDay={confirmedDay}
        meetingType={meetingType} setMeetingType={setMeetingType}
        place={place} setPlace={setPlace}
        title={title} setTitle={setTitle}
        time={time} setTime={setTime}
        invitees={invitees} toggleRequired={toggleRequired} inviteFlash={inviteFlash}
      />
      <Toast show={toast} />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
