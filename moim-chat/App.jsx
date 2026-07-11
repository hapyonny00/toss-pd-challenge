/* ══════════════════════════════════════════════════════════════════
   Moim(모임) 챗 — 프리미엄 하이브리드 3패널
   좌: 옵시디언 위젯(12분 링 게이지 · 팀원 6명 프로필 + 팀원 수정)
   중: 챗 워크스페이스 — 일정 조율의 전 과정이 한 스레드에 보인다
       (제약 공유 → 요청 → MEETING 카드 투표 → 시간 조정 → 확정)
   우: 채팅 목록(다크) — 방 전환 · 안읽음 배지
   회의 생성은 어디서든: 좌패널 [회의 잡기]·컴포저 [+]·채팅 목록 [+]
   → 모두 같은 모달이 열리고 온라인/오프라인을 고를 수 있다
   토스 UX 라이팅: 해요체 · 구체적 수치 · 단문
   ══════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback } = React;
const {
  MoreHorizontal, Calendar, Clock, MapPin, Users, Check, Loader2,
  Play, Video, Phone, Mic, Send, Footprints, Paperclip, Plus, X, Minus, Pencil,
} = LucideReact;

/* ── 데모 딥링크: ?demo=compose(모달) | vote(투표 진행 카드) ── */
const DEMO = new URLSearchParams(location.search).get("demo");
const SIM_DELAY = DEMO ? 150 : 1400;

/* ── 팀 6명 — 캘린더 프로토타입과 같은 사람들 ── */
const TEAM = {
  jimin:  { name: "김지민", me: true,  role: "프로덕트 매니저",   img: "https://i.pravatar.cc/160?img=12" },
  junho:  { name: "박준호", me: false, role: "프로덕트 기획",     img: "https://i.pravatar.cc/160?img=52" },
  seoyeon:{ name: "이서연", me: false, role: "프로덕트 디자이너", img: "https://i.pravatar.cc/160?img=47" },
  minji:  { name: "최민지", me: false, role: "데이터 분석가",     img: "https://i.pravatar.cc/160?img=25" },
  doyun:  { name: "정도윤", me: false, role: "프론트엔드 개발자", img: "https://i.pravatar.cc/160?img=33" },
  haeun:  { name: "한하은", me: false, role: "CX 매니저",        img: "https://i.pravatar.cc/160?img=44" },
};

/* ── 조율의 전 과정이 한 스레드에 — 팀 방의 시드 대화 ── */
const CONFIRMED_CARD = {
  type: "offline", title: "팀 킥오프", place: "강남역",
  date: "7월 14일 (화)", time: "오후 4시",
  votes: { seoyeon: "yes", junho: "yes", jimin: "yes" },
  confirmed: true,
};
const ROOMS = [
  {
    id: "team", name: "프로덕트 팀", members: ["jimin","junho","seoyeon","minji","doyun","haeun"],
    time: "오후 2:41", unread: 0,
    seed: [
      { who: "junho",   text: "다음 주 킥오프 언제 하죠? 저 화요일 오전엔 외근 있어요" },
      { who: "seoyeon", text: "저는 월·화 오후가 편해요. 디자인 리뷰만 피하면 돼요!" },
      { who: "minji",   text: "저는 오전이 좋아요. 오후엔 분석 리뷰가 있어서요" },
      { side: "out",    text: "제가 모아볼게요. 조건 넣고 모임한테 바로 물어볼게요 🙌" },
      { card: { ...CONFIRMED_CARD, time: "오후 3시", confirmed: false, votes: { seoyeon: "yes", junho: "pending", jimin: "yes" } } },
      { who: "junho",   text: "앗, 3시엔 외근에서 못 돌아와요. 4시면 딱 좋아요 🙏" },
      { side: "out",    text: "좋아요, 오후 4시로 옮길게요. 준호 님 고마워요!" },
      { card: CONFIRMED_CARD },
      { who: "haeun",   text: "오 잘됐다! 화요일 강남역에서 봬요 👋" },
      { bot: true,      text: "장소와 일정이 확정되었어요. 모두의 캘린더에 등록했어요 🎉" },
    ],
  },
  {
    id: "design", name: "디자인 크루", members: ["seoyeon","jimin","haeun"],
    time: "오전 11:20", unread: 2,
    seed: [
      { who: "seoyeon", text: "온보딩 시안 2차 올렸어요. 코멘트 부탁해요!" },
      { who: "haeun",   text: "VOC에서 나온 문구 이슈도 반영됐나요?" },
      { who: "seoyeon", text: "네, 3번 화면에 반영했어요 ✅" },
    ],
  },
  {
    id: "junho11", name: "박준호", members: ["junho","jimin"],
    time: "어제", unread: 0,
    seed: [
      { who: "junho", text: "내일 외근 끝나고 3시쯤 돌아와요" },
      { side: "out",  text: "넵, 그 뒤로 회의 잡을게요. 이동 고생해요!" },
    ],
  },
  {
    id: "notice", name: "전사 공지", members: ["haeun","jimin","junho","seoyeon","minji","doyun"],
    time: "월요일", unread: 1,
    seed: [
      { who: "haeun", text: "7/14(화) 오전 11시 전사 타운홀 — 본사 10층 대강당이에요. 상반기 회고 + 하반기 로드맵 발표!" },
    ],
  },
];
const lastLine = (r) => { const m = r.seed[r.seed.length - 1]; return m.card ? "📅 회의 카드" : m.text; };

/* ── Moim 지오메트릭 로고 ── */
function MoimLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-label="Moim">
      <rect x="2" y="2" width="17" height="17" rx="6" fill="#F5C9EF" />
      <circle cx="20" cy="20" r="8" fill="#7EE29B" />
    </svg>
  );
}

/* ── 12분 링 게이지 — 얇은 방사형 인디케이터 ── */
function RingGauge() {
  const TICKS = 48, ACTIVE = 34;
  return (
    <div className="relative w-[104px] h-[104px] mx-auto">
      <svg width="104" height="104" viewBox="0 0 120 120">
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const x1 = 60 + Math.cos(a) * 46, y1 = 60 + Math.sin(a) * 46;
          const x2 = 60 + Math.cos(a) * 56, y2 = 60 + Math.sin(a) * 56;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i < ACTIVE ? "#3182F6" : "#E5E8EB"} strokeWidth="2.5" strokeLinecap="round" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-extrabold text-[#191F28] leading-none">12분</span>
        <span className="text-[9px] font-semibold text-gray-500 mt-1">평균 이동 시간</span>
      </div>
    </div>
  );
}

/* ── 좌측: 팀 프로필 위젯 — 전원 프로필 + 팀원 수정 ── */
function LeftPanel({ members, onRemove, onRestore, onCompose, edit, setEdit }) {
  const removedCount = Object.keys(TEAM).length - members.length;
  return (
    <aside className="w-[248px] flex-none bg-white border border-[#E5E8EB] rounded-[24px] shadow-[0_6px_20px_rgba(25,31,40,0.06)] flex flex-col p-5 text-[#191F28] overflow-y-auto">
      <div className="flex items-center gap-2.5 mb-4">
        <MoimLogo />
        <span className="text-[16px] font-extrabold tracking-tight">Moim</span>
      </div>

      {/* 링 게이지 카드 */}
      <div className="bg-[#F2F4F6] rounded-[20px] p-3.5 mb-4 flex-none">
        <RingGauge />
        <p className="text-center text-[10px] font-semibold text-gray-500 mt-2.5 leading-relaxed">
          오프라인으로 모이면<br />전원 평균 12분이면 도착해요
        </p>
      </div>

      {/* 팀원 전원 프로필 */}
      <div className="bg-[#F9FAFB] border border-[#EEF0F2] rounded-[20px] p-3.5 flex-none">
        <div className="flex items-center mb-2.5">
          <span className="text-[11px] font-extrabold text-gray-500 flex-1">팀원 {members.length}명</span>
          <button
            onClick={() => setEdit(!edit)}
            className={"flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 transition " + (edit ? "bg-[#3182F6] text-white" : "bg-[#F2F4F6] text-gray-600 hover:bg-[#E5E8EB]")}
          >
            {edit ? <Check size={10} strokeWidth={3} /> : <Pencil size={10} />} {edit ? "완료" : "팀원 수정"}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {members.map((pid) => {
            const p = TEAM[pid];
            return (
              <div key={pid} className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-[#F2F4F6] transition">
                <div className="relative flex-none">
                  <img src={p.img} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                  <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate">{p.name}{p.me ? " (나)" : ""}</div>
                  <div className="text-[9.5px] font-semibold text-gray-500 truncate">{p.role}</div>
                </div>
                {edit && !p.me && (
                  <button onClick={() => onRemove(pid)} aria-label={p.name + " 내보내기"} className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-none active:scale-90 transition">
                    <Minus size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })}
          {edit && removedCount > 0 && (
            <button onClick={onRestore} className="flex items-center justify-center gap-1.5 rounded-xl py-2 mt-1 bg-[#F2F4F6] text-[11px] font-bold text-gray-600 hover:bg-[#E5E8EB] transition">
              <Plus size={12} /> 내보낸 팀원 {removedCount}명 다시 초대
            </button>
          )}
        </div>
      </div>

      <span className="flex-1 min-h-[12px]" />
      {/* 회의 잡기 — 여기서도 온/오프라인을 고를 수 있다 */}
      <button
        onClick={onCompose}
        className="flex-none h-11 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-[13px] font-extrabold flex items-center justify-center gap-1.5 active:scale-[.97] transition"
      >
        <Plus size={15} strokeWidth={2.5} /> 회의 잡기
      </button>
    </aside>
  );
}

/* ── 투표 상태 행 ── */
function VoteRow({ pid, state }) {
  const p = TEAM[pid];
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <img src={p.img} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
      <span className="text-[13px] font-semibold text-gray-800 flex-1">{p.me ? "나" : p.name}</span>
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

/* ── 챗에 게시되는 MEETING 카드 ── */
function MeetingCard({ card, live, onApprove, onAlt }) {
  const copy = card.type === "offline"
    ? `모두의 이동 시간을 최소화할 수 있는 ${card.place} 근처 공간과 ${card.time}를 찾았어요. 멤버들의 의견을 확인해보세요.`
    : `모두 맞는 시간이 없어서, 준호 님만 30분 조정하면 되는 최적의 대안을 찾았어요. 아래에서 의견을 모아보세요.`;
  return (
    <div className="animate-slidein bg-white border border-gray-200 rounded-[24px] p-4 shadow-[0_12px_40px_rgba(31,21,68,0.08)] max-w-[320px] self-start w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-extrabold tracking-[.14em] text-[#3182F6]">MEETING</span>
        <span className="text-[10px] font-bold text-gray-400">{card.type === "offline" ? "오프라인" : "온라인"}</span>
      </div>
      <h4 className="text-[15px] font-extrabold text-gray-900 mb-1.5">{card.title}</h4>
      <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500 mb-2.5">
        <span className="flex items-center gap-1"><Calendar size={12} /> {card.date}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {card.time}</span>
      </div>
      {card.type === "offline" ? (
        <div className="rounded-xl bg-[#E8F3FF] border border-[#C9E2FF] p-2.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
            <MapPin size={13} className="text-[#3182F6]" /> {card.place}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-gray-500">
            <Footprints size={11} /> 전원 이동 시간 평균 12분 · 최대 18분
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#E8F3FF] border border-[#C9E2FF] p-2.5 mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-gray-800">
          <Video size={13} className="text-[#3182F6]" /> 화상회의 링크가 시작 10분 전에 도착해요
        </div>
      )}
      <p className="text-[12.5px] leading-relaxed text-gray-600 mb-3">{copy}</p>
      <div className="border-t border-gray-100 pt-1 mb-3">
        <VoteRow pid="seoyeon" state={card.votes.seoyeon} />
        <VoteRow pid="junho" state={card.votes.junho} />
        <VoteRow pid="jimin" state={card.votes.jimin} />
      </div>
      {!card.confirmed ? (
        live ? (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={card.votes.jimin === "yes"}
              className="flex-1 h-10 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition"
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
          <div className="h-10 rounded-xl bg-amber-50 text-amber-600 text-[12.5px] font-bold flex items-center justify-center gap-1.5">
            <Loader2 size={13} className="animate-spin" /> 준호 님 답을 기다리는 중
          </div>
        )
      ) : (
        <div className="h-10 rounded-xl bg-emerald-50 text-emerald-600 text-[13px] font-bold flex items-center justify-center gap-1.5">
          <Check size={14} strokeWidth={3} /> 3명 전원 찬성 · 확정 — 캘린더에 등록했어요
        </div>
      )}
    </div>
  );
}

/* ── 중앙: 챗 워크스페이스 — 조율의 전 과정이 한 스레드에 ── */
function ChatPane({ room, feed, liveCard, onApprove, onAlt, onSend, onCompose }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [room, feed, liveCard]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <section className="flex-1 min-w-0 bg-white rounded-[32px] shadow-[0_12px_40px_rgba(31,21,68,0.08)] flex flex-col overflow-hidden">
      {/* header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex flex-none">
          {room.members.slice(0, 4).map((pid, i) => (
            <img key={pid} src={TEAM[pid].img} alt={TEAM[pid].name} className={"w-8 h-8 rounded-full object-cover border-2 border-white " + (i > 0 ? "-ml-2.5" : "")} />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-extrabold text-gray-900 tracking-tight">{room.name}</div>
          <div className="text-[10.5px] font-semibold text-emerald-500">● 멤버 {room.members.length}명 온라인</div>
        </div>
        <button aria-label="영상통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Video size={17} /></button>
        <button aria-label="음성통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Phone size={16} /></button>
        <button aria-label="더보기" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><MoreHorizontal size={17} /></button>
      </header>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        <div className="text-center text-[10.5px] font-bold text-gray-300 py-1">오늘</div>
        {[...room.seed, ...feed].map((m, i) => {
          if (m.card) return <MeetingCard key={"c" + i} card={m.card} live={false} />;
          if (m.bot) return (
            <div key={i} className="animate-fadeup self-center text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-3.5 py-1.5">{m.text}</div>
          );
          if (m.side === "out") return (
            <div key={i} className="animate-fadeup bg-[#3182F6] text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[300px]">{m.text}</div>
          );
          const p = TEAM[m.who];
          return (
            <div key={i} className="animate-fadeup flex items-end gap-2 self-start max-w-[360px]">
              <img src={p.img} alt={p.name} className="w-7 h-7 rounded-full object-cover flex-none" />
              <div>
                <div className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1">{p.name} · {p.role.split(" ")[0]}</div>
                <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">{m.text}</div>
              </div>
            </div>
          );
        })}
        {liveCard && <MeetingCard card={liveCard} live onApprove={onApprove} onAlt={onAlt} />}
        <div ref={endRef} />
      </div>

      {/* floating pill input — [+]에서도 온/오프라인 회의 생성 */}
      <footer className="px-5 pb-5">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-2 py-2 shadow-[0_6px_24px_rgba(31,21,68,0.06)]">
          <button onClick={onCompose} aria-label="회의 잡기" title="회의 잡기 (온라인/오프라인)" className="w-9 h-9 rounded-full bg-[#E8F3FF] flex items-center justify-center text-[#3182F6] flex-none active:scale-95 transition"><Plus size={16} strokeWidth={2.5} /></button>
          <button aria-label="첨부" className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 flex-none"><Paperclip size={15} /></button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={`${room.name}에 메시지 보내기`}
            className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-gray-400 px-1"
          />
          <button aria-label="음성 입력" className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 flex-none"><Mic size={15} /></button>
          <button onClick={send} aria-label="보내기" className="w-9 h-9 rounded-full bg-[#3182F6] hover:bg-[#2272EB] flex items-center justify-center text-white flex-none active:scale-95 transition"><Send size={14} /></button>
        </div>
      </footer>
    </section>
  );
}

/* ── 우측: 채팅 목록 (다크) ── */
function RoomList({ activeId, unread, onPick, onCompose }) {
  return (
    <section className="w-[300px] flex-none bg-white border border-[#E5E8EB] rounded-[24px] shadow-[0_6px_20px_rgba(25,31,40,0.06)] flex flex-col overflow-hidden text-[#191F28]">
      <header className="flex items-center px-5 pt-5 pb-3">
        <div className="flex-1">
          <div className="text-[16px] font-extrabold tracking-tight">채팅</div>
          <div className="text-[10.5px] font-semibold text-gray-500 mt-0.5">일정 조율은 대화가 시작되는 곳에서</div>
        </div>
        {/* 여기서도 회의 생성 + 온/오프라인 선택 */}
        <button onClick={onCompose} aria-label="회의 잡기" title="회의 잡기 (온라인/오프라인)" className="w-9 h-9 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white flex items-center justify-center flex-none active:scale-90 transition">
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1.5">
        {ROOMS.map((r) => {
          const active = r.id === activeId;
          return (
            <button
              key={r.id} onClick={() => onPick(r.id)}
              className={"flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition " + (active ? "bg-[#F2F4F6]" : "hover:bg-[#F9FAFB]")}
            >
              {r.members.length > 2 ? (
                <div className="flex flex-none">
                  {r.members.slice(0, 2).map((pid, i) => (
                    <img key={pid} src={TEAM[pid].img} alt="" className={"w-9 h-9 rounded-full object-cover border-2 border-white " + (i > 0 ? "-ml-3" : "")} />
                  ))}
                </div>
              ) : (
                <img src={TEAM[r.members[0]].img} alt="" className="w-9 h-9 rounded-full object-cover flex-none" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-extrabold truncate">{r.name}</span>
                  {r.members.length > 2 && <span className="text-[10px] font-bold text-gray-500">{r.members.length}</span>}
                  <span className="flex-1" />
                  <span className="text-[10px] font-semibold text-gray-500 flex-none">{r.time}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11.5px] text-gray-400 truncate">{lastLine(r)}</span>
                  {unread[r.id] > 0 && (
                    <span className="flex-none min-w-[18px] h-[18px] px-1 rounded-full bg-[#3182F6] text-[#FFFFFF] text-[10px] font-extrabold flex items-center justify-center">{unread[r.id]}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ── 회의 생성 모달 — 모든 진입점이 여기로: 온라인/오프라인 선택 ── */
function ComposeModal({ open, onClose, onPost }) {
  const [type, setType] = useState("offline");
  const [title, setTitle] = useState("팀 킥오프");
  const [time, setTime] = useState("오후 3시");
  const [place, setPlace] = useState("강남역");
  /* 접근성: Esc로 닫기 (WCAG 키보드 조작) */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="animate-slidein w-[340px] bg-white rounded-[28px] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="회의 잡기">
        <div className="flex items-center mb-4">
          <h3 className="text-[16px] font-extrabold text-gray-900 flex-1">회의 잡기</h3>
          <button onClick={onClose} aria-label="닫기" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={14} /></button>
        </div>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="회의 이름"
          className="w-full border-b border-gray-200 focus:border-[#3182F6] outline-none text-[13.5px] py-2.5 placeholder:text-gray-300 transition-colors font-semibold"
        />
        <div className="flex gap-4">
          <label className="flex-1 flex items-center gap-1.5 border-b border-gray-200 py-2.5 text-[13px] text-gray-700">
            <span className="flex-1">7월 14일 (화)</span><Calendar size={13} className="text-gray-300" />
          </label>
          <label className="flex-1 flex items-center gap-1.5 border-b border-gray-200 py-2.5">
            <input value={time} onChange={(e) => setTime(e.target.value)} className="w-full outline-none text-[13px] text-gray-700" />
            <Clock size={13} className="text-gray-300" />
          </label>
        </div>
        <label className="flex items-center gap-1.5 border-b border-gray-200 py-2.5 text-[13px] text-gray-400">
          <span className="flex-1">서연, 준호 외 3명</span><Users size={13} className="text-gray-300" />
        </label>

        {/* 온라인/오프라인 — 어느 버튼으로 열어도 항상 여기서 고른다 */}
        <div className="mt-4 p-1 rounded-full bg-gray-100 flex" role="tablist" aria-label="미팅 방식">
          {[["online", "온라인"], ["offline", "오프라인"]].map(([v, label]) => (
            <button
              key={v} role="tab" aria-selected={type === v}
              onClick={() => setType(v)}
              className={
                "flex-1 h-9 rounded-full text-[12.5px] font-bold transition-all " +
                (type === v ? "bg-white text-[#3182F6] shadow-sm" : "text-gray-400")
              }
            >
              {label}
            </button>
          ))}
        </div>
        {type === "offline" && (
          <div className="animate-expand overflow-hidden">
            <label className="flex items-center gap-1.5 border-b border-gray-200 py-2.5 mt-1">
              <MapPin size={13} className="text-[#3182F6] flex-none" />
              <input
                value={place} onChange={(e) => setPlace(e.target.value)} placeholder="만날 장소"
                className="w-full outline-none text-[13px] text-gray-700 placeholder:text-gray-300"
              />
            </label>
            <p className="text-[10.5px] text-gray-400 pt-1.5">멤버 6명의 위치 기준으로 이동 시간을 계산해요</p>
          </div>
        )}

        <button
          onClick={() => onPost({ type, title: title.trim() || "팀 킥오프", time, place: place.trim() || "강남역" })}
          className="w-full mt-5 h-11 rounded-full bg-[#3182F6] hover:bg-[#2272EB] text-white text-[13.5px] font-bold shadow-lg shadow-black/25 active:scale-[.97] transition"
        >
          회의 카드 보내기
        </button>
      </div>
    </div>
  );
}

/* ── 확정 토스트 ── */
function Toast({ show }) {
  if (!show) return null;
  return (
    <div className="animate-slidein fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#333D4B] text-white text-[13px] font-bold px-6 py-3.5 rounded-full shadow-2xl">
      장소와 일정이 확정되었어요. 캘린더에 등록할게요! 🎉
    </div>
  );
}

/* ── 앱 루트 ── */
function App() {
  const [roomId, setRoomId] = useState("team");
  const [feeds, setFeeds] = useState({ team: [], design: [], junho11: [], notice: [] });
  const [liveCard, setLiveCard] = useState(null);
  const [unread, setUnread] = useState({ team: 0, design: 2, junho11: 0, notice: 1 });
  const [members, setMembers] = useState(Object.keys(TEAM));
  const [compose, setCompose] = useState(false);
  const [toast, setToast] = useState(false);

  const room = ROOMS.find((r) => r.id === roomId);
  const pick = (id) => { setRoomId(id); setUnread((u) => ({ ...u, [id]: 0 })); };

  /* 모달에서 회의 카드 게시 — 팀 방으로 */
  const post = useCallback(({ type, title, time, place }) => {
    setCompose(false);
    setRoomId("team");
    setLiveCard({
      type, title, place, date: "7월 14일 (화)", time,
      votes: { seoyeon: "yes", junho: "pending", jimin: "wait" },
      confirmed: false,
    });
  }, []);

  const approve = useCallback(() => {
    setLiveCard((c) => c && { ...c, votes: { ...c.votes, jimin: "yes" } });
    setTimeout(() => {
      setLiveCard((c) => c && { ...c, votes: { ...c.votes, junho: "yes" }, confirmed: true });
      setFeeds((f) => ({ ...f, team: [...f.team, { bot: true, text: "장소와 일정이 확정되었어요. 모두의 캘린더에 등록했어요 🎉" }] }));
      setToast(true);
      setTimeout(() => setToast(false), 3200);
    }, SIM_DELAY);
  }, []);

  const suggestAlt = useCallback(() => {
    setFeeds((f) => ({ ...f, team: [...f.team, { side: "out", text: "오후 4시는 어때요? 3시엔 리뷰가 하나 있어요." }] }));
    setTimeout(() => {
      setLiveCard((c) => c && { ...c, time: "오후 4시" });
      setFeeds((f) => ({ ...f, team: [...f.team, { who: "junho", text: "4시면 딱 좋아요. 감사해요 🙏" }] }));
    }, SIM_DELAY);
  }, []);

  const sendMessage = useCallback((text) => {
    setFeeds((f) => ({ ...f, [roomId]: [...f[roomId], { side: "out", text }] }));
    const replier = room.members.find((m) => !TEAM[m].me);
    setTimeout(() => {
      setFeeds((f) => ({ ...f, [roomId]: [...f[roomId], { who: replier, text: "넵, 확인했어요 👍" }] }));
    }, SIM_DELAY);
  }, [roomId, room]);

  /* 팀원 수정 */
  const [editMembers, setEditMembers] = useState(false);
  const removeMember = (pid) => setMembers((ms) => ms.filter((m) => m !== pid));
  const restoreMembers = () => setMembers(Object.keys(TEAM));

  /* 셸 Nav Rail의 [팀원 추가] — postMessage(openPicker)로 어느 화면에서든 팀원 수정 열림 */
  useEffect(() => {
    const h = (e) => { if (e.data && e.data.openPicker) setEditMembers(true); };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, []);

  /* 데모 딥링크 */
  useEffect(() => {
    if (DEMO === "compose") setCompose(true);
    else if (DEMO === "vote") post({ type: "offline", title: "팀 킥오프", time: "오후 3시", place: "강남역" });
    else if (DEMO === "members") setEditMembers(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#F9FAFB] via-[#F2F4F6] to-[#F9FAFB] flex gap-5 p-5 max-w-[1280px] mx-auto font-sans h-screen">
      <LeftPanel members={members} onRemove={removeMember} onRestore={restoreMembers} onCompose={() => setCompose(true)} edit={editMembers} setEdit={setEditMembers} />
      <ChatPane
        room={room} feed={feeds[roomId]} liveCard={roomId === "team" ? liveCard : null}
        onApprove={approve} onAlt={suggestAlt} onSend={sendMessage} onCompose={() => setCompose(true)}
      />
      <RoomList activeId={roomId} unread={unread} onPick={pick} onCompose={() => setCompose(true)} />
      <ComposeModal open={compose} onClose={() => setCompose(false)} onPost={post} />
      <Toast show={toast} />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
