/* ══════════════════════════════════════════════════════════════════
   Moim(모임) — 온·오프라인 맥락과 이동 시간까지 조율하는 대화형 일정 솔루션
   좌: 챗룸(투표 엔진) · 우: 캘린더 스케줄러(온/오프라인 토글 + 장소 입력)
   토스 UX 라이팅: 해요체 · 구체적 수치 · 단문
   ══════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback } = React;
const {
  Search, ChevronLeft, ChevronRight, MoreHorizontal, Calendar, Clock,
  MapPin, Users, Check, Loader2, Play, Video, Phone, Mic, Send, Footprints,
} = LucideReact;

/* ── 데모 딥링크: ?demo=card(카드 게시) | confirmed(확정까지 자동 진행) ── */
const DEMO = new URLSearchParams(location.search).get("demo");
const SIM_DELAY = DEMO ? 150 : 1400;

const AVATAR = {
  mira: "https://i.pravatar.cc/96?img=45",
  sim: "https://i.pravatar.cc/96?img=52",
  you: "https://i.pravatar.cc/96?img=12",
};

/* ── Moim 지오메트릭 로고 ── */
function MoimLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-label="Moim">
      <rect x="2" y="2" width="17" height="17" rx="6" fill="#2563EB" />
      <circle cx="20" cy="20" r="8" fill="#93C5FD" opacity="0.9" />
    </svg>
  );
}

/* ── 오디오 웨이브 버블 (1:43) ── */
function AudioBubble() {
  const bars = [5, 9, 14, 8, 12, 16, 10, 6, 13, 9, 15, 7, 11, 5, 9, 12, 6];
  return (
    <div className="flex items-center gap-2.5 bg-royal text-white rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[240px]">
      <button aria-label="재생" className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center flex-none">
        <Play size={13} fill="white" stroke="none" />
      </button>
      <div className="flex items-center gap-[2px] h-5">
        {bars.map((h, i) => (
          <span key={i} className="w-[2.5px] rounded-full bg-white/80" style={{ height: h }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold opacity-90">1:43</span>
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

/* ── 채팅에 게시되는 MEETING 카드 ── */
function MeetingCard({ card, onApprove, onAlt }) {
  const copy = card.type === "offline"
    ? `모두의 이동 시간을 최소화할 수 있는 ${card.place} 근처 공간과 ${card.time}를 찾았어요. 멤버들의 의견을 확인해보세요.`
    : `모두 맞는 시간이 없어서, 김토스님만 30분 조정하면 되는 최적의 대안을 찾았어요. 아래에서 의견을 모아보세요.`;
  return (
    <div className="animate-slidein bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-[300px] self-start w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-extrabold tracking-[.14em] text-royal">MEETING</span>
        <span className="text-[10px] font-bold text-gray-400">{card.type === "offline" ? "오프라인" : "온라인"}</span>
      </div>
      <h4 className="text-[15px] font-extrabold text-gray-900 mb-1.5">{card.title}</h4>
      <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500 mb-2.5">
        <span className="flex items-center gap-1"><Calendar size={12} /> {card.date}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {card.time}</span>
      </div>
      {card.type === "offline" && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
            <MapPin size={13} className="text-royal" /> {card.place}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-gray-500">
            <Footprints size={11} /> 전원 이동 시간 평균 12분 · 최대 18분
          </div>
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
            className="flex-1 h-10 rounded-xl bg-royal text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition"
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
        <div className="h-10 rounded-xl bg-emerald-50 text-emerald-600 text-[13px] font-bold flex items-center justify-center gap-1.5">
          <Check size={14} strokeWidth={3} /> 3명 전원 찬성 · 확정
        </div>
      )}
    </div>
  );
}

/* ── 좌측: 챗룸 ── */
function ChatPane({ card, feed, onApprove, onAlt }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [card, feed]);
  return (
    <section className="flex-1 min-w-0 bg-white rounded-[28px] flex flex-col overflow-hidden shadow-sm">
      {/* header */}
      <header className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
        <MoimLogo />
        <span className="text-[16px] font-extrabold text-gray-900 tracking-tight">Moim</span>
        <span className="flex-1" />
        <button aria-label="영상통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Video size={17} /></button>
        <button aria-label="음성통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Phone size={16} /></button>
        <button aria-label="더보기" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><MoreHorizontal size={17} /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* profile card */}
        <div className="flex flex-col items-center text-center pb-4">
          <img src={AVATAR.mira} alt="Mira Brown" className="w-16 h-16 rounded-full object-cover mb-2" />
          <div className="text-[15px] font-extrabold text-gray-900">Mira Brown</div>
          <div className="text-[11.5px] font-semibold text-gray-400 mb-1">@mira.b</div>
          <p className="text-[11.5px] text-gray-500 leading-snug max-w-[220px]">
            Visual &amp; Product Design, Research, Typography &amp; Illustration
          </p>
          <div className="flex gap-1.5 mt-2">
            <span className="text-[10.5px] font-bold text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">UX/UI designer</span>
            <span className="text-[10.5px] font-bold text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">Dribbbler</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pb-4">
          <span className="flex-1 h-px bg-gray-100" />
          <span className="text-[10.5px] font-bold tracking-wide text-gray-400">Open Full Chat</span>
          <span className="flex-1 h-px bg-gray-100" />
        </div>

        {/* static messages */}
        <div className="flex flex-col gap-2.5">
          <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5 self-start max-w-[260px]">
            Hi, I have great news! A new project is starting — I'll share the details in our kickoff. :)
          </div>
          <div className="bg-royal text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[260px]">
            Wow, that's inspiring. Looking forward to it!
          </div>
          <div className="text-center text-[10.5px] font-bold text-gray-300 py-1">Jul 28 · 2:20 pm</div>
          <AudioBubble />
          <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5 self-start max-w-[260px]">
            Okay, I can't wait to start! 😊
          </div>

          {/* dynamic: meeting card + feed */}
          {card && <MeetingCard card={card} onApprove={onApprove} onAlt={onAlt} />}
          {feed.map((m, i) =>
            m.side === "out" ? (
              <div key={i} className="animate-fadeup bg-royal text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[260px]">{m.text}</div>
            ) : (
              <div key={i} className="animate-fadeup flex items-end gap-2 self-start max-w-[280px]">
                {m.bot ? (
                  <span className="w-6 h-6 rounded-full bg-royal text-white text-[10px] font-extrabold flex items-center justify-center flex-none">M</span>
                ) : (
                  <img src={AVATAR.mira} alt="" className="w-6 h-6 rounded-full object-cover flex-none" />
                )}
                <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">{m.text}</div>
              </div>
            )
          )}
        </div>
        <div ref={endRef} />
      </div>

      {/* composer */}
      <footer className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <input placeholder="메시지를 입력해보세요" className="flex-1 h-10 rounded-full bg-gray-100 px-4 text-[13px] outline-none placeholder:text-gray-400" />
        <button aria-label="음성 입력" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Mic size={16} /></button>
        <button aria-label="보내기" className="w-10 h-10 rounded-full bg-royal flex items-center justify-center text-white"><Send size={15} /></button>
      </footer>
    </section>
  );
}

/* ── 우측: 캘린더 스케줄러 ── */
function SchedulerPane({ onSubmit, confirmedDay, meetingType, setMeetingType, place, setPlace, title, setTitle, time, setTime }) {
  /* 2020년 1월: 1일 = 수요일. 참고 이미지의 점 표기 재현 */
  const lead = [29, 30, 31];
  const dots = new Set([8, 9, 12, 14, 16, 22, 23]);
  return (
    <section className="w-[340px] flex-none bg-royal rounded-[28px] flex flex-col overflow-hidden shadow-sm">
      {/* search */}
      <div className="px-5 pt-5">
        <div className="flex items-center gap-2.5 h-10 rounded-full bg-white/15 px-4 text-white/80">
          <Search size={15} />
          <span className="text-[12.5px] font-semibold">Search</span>
        </div>
      </div>
      {/* month grid */}
      <div className="px-5 pt-4 pb-3 text-white">
        <div className="flex items-center mb-3">
          <span className="text-[15px] font-extrabold tracking-tight flex-1">January 2020</span>
          <button aria-label="이전 달" className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center"><ChevronLeft size={15} /></button>
          <button aria-label="다음 달" className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center"><ChevronRight size={15} /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="text-[10px] font-bold text-white/60 py-1">{d}</span>
          ))}
          {lead.map((n) => (
            <span key={"l" + n} className="text-[12px] font-semibold text-white/40 py-1.5">{n}</span>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => (
            <span key={n} className="relative py-1.5 flex flex-col items-center">
              <span
                className={
                  "w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-semibold " +
                  (n === 6 ? "bg-white text-royal font-extrabold" : "text-white")
                }
              >
                {n}
              </span>
              {confirmedDay === n ? (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-emerald-300 ring-2 ring-emerald-300/30" />
              ) : dots.has(n) ? (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white/50" />
              ) : null}
            </span>
          ))}
        </div>
        {confirmedDay && (
          <div className="animate-fadeup mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-200">
            <Check size={12} strokeWidth={3} /> 1월 {confirmedDay}일 {time} · {title} 확정
          </div>
        )}
      </div>

      {/* Add new list */}
      <div className="bg-white rounded-t-[24px] flex-1 px-5 pt-4 pb-5 flex flex-col">
        <div className="flex items-center mb-3">
          <span className="text-[14.5px] font-extrabold text-gray-900 flex-1">Add new list</span>
          <button aria-label="옵션" className="text-gray-300"><MoreHorizontal size={17} /></button>
        </div>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full border-b border-gray-200 focus:border-royal outline-none text-[13px] py-2.5 placeholder:text-gray-300 transition-colors"
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
        <label className="flex items-center gap-1.5 border-b border-gray-200 py-2.5 text-[13px] text-gray-400">
          <span className="flex-1">Mira, 김토스 외 1명</span><Users size={13} className="text-gray-300" />
        </label>

        {/* 온라인/오프라인 세그먼트 — 오프라인이면 장소 필드 확장 */}
        <div className="mt-4 p-1 rounded-full bg-gray-100 flex" role="tablist" aria-label="미팅 방식">
          {[["online", "온라인"], ["offline", "오프라인"]].map(([v, label]) => (
            <button
              key={v} role="tab" aria-selected={meetingType === v}
              onClick={() => setMeetingType(v)}
              className={
                "flex-1 h-9 rounded-full text-[12.5px] font-bold transition-all " +
                (meetingType === v ? "bg-white text-royal shadow-sm" : "text-gray-400")
              }
            >
              {label}
            </button>
          ))}
        </div>
        {meetingType === "offline" && (
          <div className="animate-expand overflow-hidden">
            <label className="flex items-center gap-1.5 border-b border-gray-200 py-2.5 mt-1">
              <MapPin size={13} className="text-royal flex-none" />
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
          className="self-center mt-4 h-11 px-8 rounded-full bg-royal text-white text-[13.5px] font-bold shadow-lg shadow-blue-500/25 active:scale-[.97] transition"
        >
          Submit List
        </button>
      </div>
    </section>
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
  }, [meetingType, place, title, time]);

  const approve = useCallback(() => {
    setCard((c) => c && { ...c, votes: { ...c.votes, you: "yes" } });
    setTimeout(() => {
      setCard((c) => c && { ...c, votes: { ...c.votes, sim: "yes" }, confirmed: true });
      setFeed((f) => [...f, { side: "in", bot: true, text: "장소와 일정이 확정되었어요. 캘린더에 등록할게요!" }]);
      setConfirmedDay(6);
    }, SIM_DELAY);
  }, []);

  const suggestAlt = useCallback(() => {
    setFeed((f) => [...f, { side: "out", text: "오후 4시는 어때요? 3시엔 리뷰가 하나 있어요." }]);
    setTimeout(() => {
      setTime("오후 4시");
      setCard((c) => c && { ...c, time: "오후 4시" });
      setFeed((f) => [...f, { side: "in", text: "좋아요, 오후 4시로 다시 모을게요 👍" }]);
    }, SIM_DELAY);
  }, []);

  /* 데모 딥링크 자동 진행 */
  useEffect(() => {
    if (!DEMO) return;
    setMeetingType("offline");
    const t1 = setTimeout(() => {
      setCard({
        type: "offline", title: "팀 킥오프", place: "강남역",
        date: "1월 6일 (월)", time: "오후 3시",
        votes: { mira: "yes", sim: "pending", you: "wait" }, confirmed: false,
      });
    }, 100);
    let t2;
    if (DEMO === "confirmed") {
      t2 = setTimeout(() => {
        setCard((c) => c && { ...c, votes: { mira: "yes", sim: "yes", you: "yes" }, confirmed: true });
        setFeed([{ side: "in", bot: true, text: "장소와 일정이 확정되었어요. 캘린더에 등록할게요!" }]);
        setConfirmedDay(6);
      }, 350);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <main className="h-screen flex gap-4 p-4 max-w-[1100px] mx-auto font-sans">
      <ChatPane card={card} feed={feed} onApprove={approve} onAlt={suggestAlt} />
      <SchedulerPane
        onSubmit={submit} confirmedDay={confirmedDay}
        meetingType={meetingType} setMeetingType={setMeetingType}
        place={place} setPlace={setPlace}
        title={title} setTitle={setTitle}
        time={time} setTime={setTime}
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
