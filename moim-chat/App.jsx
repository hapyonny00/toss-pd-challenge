/* ══════════════════════════════════════════════════════════════════
   Moim(모임) — 대화 속에서 일정이 확정되는 채팅 중심 조율 솔루션
   좌: 1:1 챗룸 · 우: 팀 채팅방(회의 카드 게시 + 투표 + 메시지 전송)
   캘린더·스케줄러 기능은 메인 캘린더 프로토타입과 중복이라 제거하고,
   팀원들이 대화하고 회의 카드를 주고받는 채팅방으로 교체
   토스 UX 라이팅: 해요체 · 구체적 수치 · 단문
   ══════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback } = React;
const {
  MoreHorizontal, Calendar, Clock, MapPin, Check, Loader2,
  Play, Video, Phone, Mic, Send, Footprints, Plus,
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

/* ── 좌측: 1:1 챗룸 (Mira) ── */
function ChatPane() {
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
        </div>
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

/* ── 우측: 팀 채팅방 — 회의 카드가 게시되고 투표가 오가는 곳 ── */
function TeamChatPane({ card, feed, onApprove, onAlt, onSend, onPostCard }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [card, feed]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <section className="w-[340px] flex-none bg-white rounded-[28px] flex flex-col overflow-hidden shadow-sm">
      {/* header: 멤버 아바타 스택 + 방 이름 */}
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
        <div className="flex">
          {[AVATAR.you, AVATAR.mira, AVATAR.sim].map((src, i) => (
            <img key={i} src={src} alt="" className={"w-8 h-8 rounded-full object-cover border-2 border-white " + (i > 0 ? "-ml-2.5" : "")} />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-extrabold text-gray-900 tracking-tight">프로젝트 팀</div>
          <div className="text-[10.5px] font-semibold text-gray-400">나 · Mira · 김토스</div>
        </div>
        <button aria-label="영상통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Video size={17} /></button>
      </header>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        <div className="text-center text-[10.5px] font-bold text-gray-300 py-1">오늘</div>

        <div className="flex items-end gap-2 self-start max-w-[280px]">
          <img src={AVATAR.sim} alt="" className="w-6 h-6 rounded-full object-cover flex-none" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1">김토스</div>
            <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">
              킥오프 언제 하죠? 이번 주는 좀 빡빡해요
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 self-start max-w-[280px]">
          <img src={AVATAR.mira} alt="" className="w-6 h-6 rounded-full object-cover flex-none" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1">Mira Brown</div>
            <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">
              저는 월·화 오후가 편해요!
            </div>
          </div>
        </div>
        <div className="bg-royal text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[260px]">
          제가 시간이랑 장소 모아볼게요. 잠깐만요 🙌
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
                <img src={AVATAR[m.who] || AVATAR.mira} alt="" className="w-6 h-6 rounded-full object-cover flex-none" />
              )}
              <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">{m.text}</div>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      {/* composer: + 로 회의 카드를 게시, 입력·전송이 실제로 동작 */}
      <footer className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <button
          onClick={onPostCard} aria-label="회의 카드 보내기" title="회의 카드 보내기"
          className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-royal flex-none active:scale-95 transition"
        >
          <Plus size={17} strokeWidth={2.5} />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="팀에게 메시지 보내기"
          className="flex-1 min-w-0 h-10 rounded-full bg-gray-100 px-4 text-[13px] outline-none placeholder:text-gray-400"
        />
        <button onClick={send} aria-label="보내기" className="w-10 h-10 rounded-full bg-royal flex items-center justify-center text-white flex-none active:scale-95 transition"><Send size={15} /></button>
      </footer>
    </section>
  );
}

/* ── 앱 루트 ── */
function App() {
  const [card, setCard] = useState(null);
  const [feed, setFeed] = useState([]);

  /* + 버튼 → 회의 카드 게시 (이동 시간이 계산된 오프라인 제안) */
  const postCard = useCallback(() => {
    setCard({
      type: "offline", title: "팀 킥오프", place: "강남역",
      date: "1월 6일 (월)", time: "오후 3시",
      votes: { mira: "yes", sim: "pending", you: "wait" },
      confirmed: false,
    });
    setFeed([]);
  }, []);

  const approve = useCallback(() => {
    setCard((c) => c && { ...c, votes: { ...c.votes, you: "yes" } });
    setTimeout(() => {
      setCard((c) => c && { ...c, votes: { ...c.votes, sim: "yes" }, confirmed: true });
      setFeed((f) => [...f, { side: "in", bot: true, text: "장소와 일정이 확정됐어요. 캘린더에 등록할게요!" }]);
    }, SIM_DELAY);
  }, []);

  const suggestAlt = useCallback(() => {
    setFeed((f) => [...f, { side: "out", text: "오후 4시는 어때요? 3시엔 리뷰가 하나 있어요." }]);
    setTimeout(() => {
      setCard((c) => c && { ...c, time: "오후 4시" });
      setFeed((f) => [...f, { side: "in", who: "mira", text: "좋아요, 오후 4시로 다시 모을게요 👍" }]);
    }, SIM_DELAY);
  }, []);

  /* 메시지 전송 — 보내면 팀원이 잠시 뒤 답장 */
  const sendMessage = useCallback((text) => {
    setFeed((f) => [...f, { side: "out", text }]);
    setTimeout(() => {
      setFeed((f) => [...f, { side: "in", who: "sim", text: "넵, 확인했어요 👍" }]);
    }, SIM_DELAY);
  }, []);

  /* 데모 딥링크 자동 진행 */
  useEffect(() => {
    if (!DEMO) return;
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
        setFeed([{ side: "in", bot: true, text: "장소와 일정이 확정됐어요. 캘린더에 등록할게요!" }]);
      }, 350);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <main className="h-screen flex gap-4 p-4 max-w-[1100px] mx-auto font-sans">
      <ChatPane />
      <TeamChatPane
        card={card} feed={feed}
        onApprove={approve} onAlt={suggestAlt}
        onSend={sendMessage} onPostCard={postCard}
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
