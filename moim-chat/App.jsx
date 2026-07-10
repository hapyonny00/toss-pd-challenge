/* ══════════════════════════════════════════════════════════════════
   Moim(모임) 챗 — 팀 대화 속에서 일정이 확정되는 채팅 허브
   좌: 팀 채팅(한국어 대화 + 회의 카드 투표) · 우: 채팅방 목록(다크 패널)
   아바타를 누르면 팀원 프로필 카드(다크)가 열린다 — 참고 이미지 1의 구조
   디자인 시스템: calendar.me — 다크 크롬 + 라이트 캔버스, 라벤더·라임
   토스 UX 라이팅: 해요체 · 구체적 수치 · 단문
   ══════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback } = React;
const {
  MoreHorizontal, Calendar, Clock, MapPin, Check, Loader2,
  Video, Phone, Mic, Send, Footprints, Plus, X, Mail, MessageCircle, FileText,
} = LucideReact;

/* ── 데모 딥링크: ?demo=card(카드 게시) | confirmed(확정) | profile(프로필) ── */
const DEMO = new URLSearchParams(location.search).get("demo");
const SIM_DELAY = DEMO ? 150 : 1400;

/* ── 팀 6명 — 캘린더 프로토타입과 같은 사람들 ── */
const TEAM = {
  jimin:  { name: "김지민", me: true,  role: "프로덕트 매니저", img: "https://i.pravatar.cc/160?img=12", tags: ["PM", "일정 오너"],    stat: [["진행 프로젝트","2"],["이번 주 회의","5"],["응답률","98%"]] },
  junho:  { name: "박준호", me: false, role: "프로덕트 기획",   img: "https://i.pravatar.cc/160?img=52", tags: ["기획", "외근 잦음"],   stat: [["진행 프로젝트","3"],["이번 주 회의","4"],["응답률","91%"]] },
  seoyeon:{ name: "이서연", me: false, role: "프로덕트 디자이너", img: "https://i.pravatar.cc/160?img=47", tags: ["디자인", "Figma"],   stat: [["진행 프로젝트","2"],["이번 주 회의","6"],["응답률","95%"]] },
  minji:  { name: "최민지", me: false, role: "데이터 분석가",   img: "https://i.pravatar.cc/160?img=25", tags: ["데이터", "오전 집중"], stat: [["진행 프로젝트","1"],["이번 주 회의","3"],["응답률","89%"]] },
  doyun:  { name: "정도윤", me: false, role: "프론트엔드 개발자", img: "https://i.pravatar.cc/160?img=33", tags: ["개발", "React"],    stat: [["진행 프로젝트","2"],["이번 주 회의","2"],["응답률","93%"]] },
  haeun:  { name: "한하은", me: false, role: "CX 매니저",      img: "https://i.pravatar.cc/160?img=44", tags: ["CX", "VOC"],        stat: [["진행 프로젝트","1"],["이번 주 회의","4"],["응답률","97%"]] },
};

/* ── 채팅방 목록 데이터 — 방마다 독립된 대화가 들어있다 ── */
const ROOMS = [
  {
    id: "team", name: "프로덕트 팀", members: ["jimin","junho","seoyeon","minji","doyun","haeun"],
    time: "오후 2:41", unread: 0,
    seed: [
      { who: "junho",   text: "다음 주 킥오프 언제 하죠? 저 화요일에 외근 있어요" },
      { who: "seoyeon", text: "저는 월·화 오후가 편해요! 디자인 리뷰만 피하면 돼요" },
      { who: "minji",   text: "저는 오전이 좋아요. 오후엔 분석 리뷰가 있어서요" },
      { who: "jimin",   text: "제가 시간 모아볼게요. 모임이 추천해주는 걸로 바로 물어볼게요 🙌" },
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
      { who: "jimin", text: "넵, 그 뒤로 회의 잡을게요. 이동 고생해요!" },
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
const lastLine = (room) => room.seed[room.seed.length - 1].text;

/* ── Moim 지오메트릭 로고 — 라벤더 사각 + 라임 원 ── */
function MoimLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-label="Moim">
      <rect x="2" y="2" width="17" height="17" rx="6" fill="#BCAAF6" />
      <circle cx="20" cy="20" r="8" fill="#D9F158" />
    </svg>
  );
}

/* ── 투표 상태 행 ── */
function VoteRow({ pid, state, onProfile }) {
  const p = TEAM[pid];
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <button onClick={() => onProfile(pid)} className="flex-none"><img src={p.img} alt={p.name} className="w-7 h-7 rounded-full object-cover" /></button>
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

/* ── 채팅에 게시되는 MEETING 카드 ── */
function MeetingCard({ card, onApprove, onAlt, onProfile }) {
  return (
    <div className="animate-slidein bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-[320px] self-start w-full">
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
        <div className="rounded-xl bg-[#EFEBFF] border border-[#DCD4FB] p-2.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
            <MapPin size={13} className="text-royal" /> {card.place}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-gray-500">
            <Footprints size={11} /> 전원 이동 시간 평균 12분 · 최대 18분
          </div>
        </div>
      )}
      <p className="text-[12.5px] leading-relaxed text-gray-600 mb-3">
        모두의 이동 시간을 최소화할 수 있는 {card.place} 근처 공간과 {card.time}를 찾았어요. 아래에서 의견을 모아보세요.
      </p>
      <div className="border-t border-gray-100 pt-1 mb-3">
        <VoteRow pid="seoyeon" state={card.votes.seoyeon} onProfile={onProfile} />
        <VoteRow pid="junho" state={card.votes.junho} onProfile={onProfile} />
        <VoteRow pid="jimin" state={card.votes.jimin} onProfile={onProfile} />
      </div>
      {!card.confirmed ? (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={card.votes.jimin === "yes"}
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
        <div className="h-10 rounded-xl bg-lime text-[#2A3105] text-[13px] font-extrabold flex items-center justify-center gap-1.5">
          <Check size={14} strokeWidth={3} /> 3명 전원 찬성 · 확정 — 캘린더에 등록했어요
        </div>
      )}
    </div>
  );
}

/* ── 팀원 프로필 카드 — 참고 이미지 1의 다크 프로필 패널 ── */
function ProfilePanel({ pid, onClose }) {
  const p = TEAM[pid];
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="animate-slidein w-[320px] bg-ink text-white rounded-[28px] p-6 shadow-2xl">
        <div className="flex justify-end -mt-1 -mr-1">
          <button onClick={onClose} aria-label="닫기" className="w-8 h-8 rounded-full bg-ink3 flex items-center justify-center text-gray-400 hover:text-white"><X size={14} /></button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <img src={p.img} alt={p.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-lav/60" />
          <div>
            <div className="text-[17px] font-extrabold">{p.name}{p.me ? " (나)" : ""}</div>
            <div className="text-[12px] font-semibold text-gray-400 mt-0.5">{p.role}</div>
            <div className="flex gap-1.5 mt-2">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] font-bold text-lav bg-lav/15 rounded-full px-2 py-0.5">{t}</span>
              ))}
            </div>
          </div>
        </div>
        {/* 스탯 — 점 구분선 위 수치 */}
        <div className="flex items-center border-y border-white/10 py-3.5 mb-4">
          {p.stat.map(([label, val], i) => (
            <div key={label} className={"flex-1 text-center " + (i > 0 ? "border-l border-white/10" : "")}>
              <div className="text-[15px] font-extrabold">{val}</div>
              <div className="text-[10px] font-semibold text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        {/* 연락 버튼 */}
        <div className="flex gap-2 mb-4">
          {[[MessageCircle, "채팅"], [Phone, "전화"], [Mail, "메일"]].map(([Icon, label]) => (
            <button key={label} className="flex-1 h-10 rounded-xl bg-ink2 hover:bg-ink3 flex items-center justify-center gap-1.5 text-[12px] font-bold text-gray-300 transition">
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        {/* 바로가기 타일 — 참고 이미지의 Shortcuts */}
        <div className="text-[10.5px] font-bold text-gray-500 mb-2">바로가기</div>
        <div className="grid grid-cols-3 gap-2">
          <button className="h-[74px] rounded-2xl bg-lav/90 text-[#2A2150] p-2.5 text-left active:scale-[.97] transition">
            <FileText size={15} />
            <div className="text-[11px] font-extrabold mt-2 leading-tight">문서<br/>보기</div>
          </button>
          <button onClick={() => { try { parent.postMessage({ nav: "calendar" }, "*"); } catch (e) {} }} className="h-[74px] rounded-2xl bg-lime text-[#2A3105] p-2.5 text-left active:scale-[.97] transition">
            <Calendar size={15} />
            <div className="text-[11px] font-extrabold mt-2 leading-tight">회의<br/>잡기</div>
          </button>
          <button className="h-[74px] rounded-2xl bg-[#F8D9E8] text-[#5C1F3E] p-2.5 text-left active:scale-[.97] transition">
            <Video size={15} />
            <div className="text-[11px] font-extrabold mt-2 leading-tight">화상<br/>통화</div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 좌측: 팀 채팅 (큰 화면) ── */
function ChatPane({ room, feed, card, onApprove, onAlt, onSend, onPostCard, onProfile }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [room, feed, card]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <section className="flex-1 min-w-0 bg-white rounded-[28px] flex flex-col overflow-hidden shadow-sm">
      {/* header: 멤버 아바타 스택 + 방 이름 — 아바타는 프로필로 */}
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
        <MoimLogo />
        <div className="flex">
          {room.members.slice(0, 4).map((pid, i) => (
            <button key={pid} onClick={() => onProfile(pid)} className={i > 0 ? "-ml-2.5" : ""}>
              <img src={TEAM[pid].img} alt={TEAM[pid].name} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold text-gray-900 tracking-tight">{room.name}</div>
          <div className="text-[10.5px] font-semibold text-gray-400">멤버 {room.members.length}명 · 아바타를 누르면 프로필</div>
        </div>
        <button aria-label="영상통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Video size={17} /></button>
        <button aria-label="음성통화" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><Phone size={16} /></button>
        <button aria-label="더보기" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><MoreHorizontal size={17} /></button>
      </header>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
        <div className="text-center text-[10.5px] font-bold text-gray-300 py-1">오늘</div>
        {[...room.seed, ...feed].map((m, i) => {
          if (m.card) return <MeetingCard key={"c" + i} card={m.card} onApprove={onApprove} onAlt={onAlt} onProfile={onProfile} />;
          const p = TEAM[m.who];
          const mine = p?.me || m.side === "out";
          return mine ? (
            <div key={i} className="animate-fadeup bg-royal text-white text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 self-end max-w-[300px]">{m.text}</div>
          ) : (
            <div key={i} className="animate-fadeup flex items-end gap-2 self-start max-w-[340px]">
              <button onClick={() => onProfile(m.who)} className="flex-none"><img src={p.img} alt={p.name} className="w-7 h-7 rounded-full object-cover" /></button>
              <div>
                <button onClick={() => onProfile(m.who)} className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1 block">{p.name} · {p.role.split(" ")[0]}</button>
                <div className="bg-gray-100 text-gray-700 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5">{m.text}</div>
              </div>
            </div>
          );
        })}
        {card && <MeetingCard card={card} onApprove={onApprove} onAlt={onAlt} onProfile={onProfile} />}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <footer className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <button
          onClick={onPostCard} aria-label="회의 카드 보내기" title="회의 카드 보내기"
          className="w-10 h-10 rounded-full bg-lav/25 flex items-center justify-center text-royal flex-none active:scale-95 transition"
        >
          <Plus size={17} strokeWidth={2.5} />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder={`${room.name}에 메시지 보내기`}
          className="flex-1 min-w-0 h-10 rounded-full bg-gray-100 px-4 text-[13px] outline-none placeholder:text-gray-400"
        />
        <button aria-label="음성 입력" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-none"><Mic size={16} /></button>
        <button onClick={send} aria-label="보내기" className="w-10 h-10 rounded-full bg-royal flex items-center justify-center text-white flex-none active:scale-95 transition"><Send size={15} /></button>
      </footer>
    </section>
  );
}

/* ── 우측: 채팅방 목록 (다크 패널) ── */
function RoomList({ activeId, unread, onPick, onProfile }) {
  return (
    <section className="w-[320px] flex-none bg-ink rounded-[28px] flex flex-col overflow-hidden text-white">
      <header className="px-5 pt-5 pb-3">
        <div className="text-[16px] font-extrabold tracking-tight">채팅</div>
        <div className="text-[11px] font-semibold text-gray-500 mt-0.5">일정 조율은 대화가 시작되는 곳에서</div>
      </header>
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5">
        {ROOMS.map((r) => {
          const active = r.id === activeId;
          const head = TEAM[r.members[0]];
          return (
            <button
              key={r.id} onClick={() => onPick(r.id)}
              className={"flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition " + (active ? "bg-ink3" : "hover:bg-ink2")}
            >
              {r.members.length > 2 ? (
                <div className="flex flex-none">
                  {r.members.slice(0, 2).map((pid, i) => (
                    <img key={pid} src={TEAM[pid].img} alt="" className={"w-9 h-9 rounded-full object-cover border-2 border-ink " + (i > 0 ? "-ml-3" : "")} />
                  ))}
                </div>
              ) : (
                <img src={head.img} alt="" className="w-9 h-9 rounded-full object-cover flex-none" />
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
                    <span className="flex-none min-w-[18px] h-[18px] px-1 rounded-full bg-lime text-[#2A3105] text-[10px] font-extrabold flex items-center justify-center">{unread[r.id]}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {/* 팀원 프로필 스트립 — 누르면 프로필 카드 */}
      <footer className="px-5 py-4 border-t border-white/10">
        <div className="text-[10.5px] font-bold text-gray-500 mb-2.5">팀원 프로필</div>
        <div className="flex gap-2">
          {Object.entries(TEAM).map(([pid, p]) => (
            <button key={pid} onClick={() => onProfile(pid)} title={p.name} className="active:scale-90 transition">
              <img src={p.img} alt={p.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20 hover:ring-lav" />
            </button>
          ))}
        </div>
      </footer>
    </section>
  );
}

/* ── 앱 루트 ── */
function App() {
  const [roomId, setRoomId] = useState("team");
  const [feeds, setFeeds] = useState({ team: [], design: [], junho11: [], notice: [] });
  const [card, setCard] = useState(null);
  const [unread, setUnread] = useState({ team: 0, design: 2, junho11: 0, notice: 1 });
  const [profile, setProfile] = useState(null);

  const room = ROOMS.find((r) => r.id === roomId);
  const pick = (id) => { setRoomId(id); setUnread((u) => ({ ...u, [id]: 0 })); };

  /* + 버튼 → 회의 카드 게시 (이동 시간이 계산된 오프라인 제안) */
  const postCard = useCallback(() => {
    setCard({
      type: "offline", title: "팀 킥오프", place: "강남역",
      date: "7월 14일 (화)", time: "오후 3시",
      votes: { seoyeon: "yes", junho: "pending", jimin: "wait" },
      confirmed: false,
    });
  }, []);

  const approve = useCallback(() => {
    setCard((c) => c && { ...c, votes: { ...c.votes, jimin: "yes" } });
    setTimeout(() => {
      setCard((c) => c && { ...c, votes: { ...c.votes, junho: "yes" }, confirmed: true });
      setFeeds((f) => ({ ...f, team: [...f.team, { who: "haeun", text: "오 잘됐다! 화요일에 봬요 👋" }] }));
    }, SIM_DELAY);
  }, []);

  const suggestAlt = useCallback(() => {
    setFeeds((f) => ({ ...f, team: [...f.team, { side: "out", text: "오후 4시는 어때요? 3시엔 리뷰가 하나 있어요." }] }));
    setTimeout(() => {
      setCard((c) => c && { ...c, time: "오후 4시" });
      setFeeds((f) => ({ ...f, team: [...f.team, { who: "seoyeon", text: "좋아요, 오후 4시로 다시 모을게요 👍" }] }));
    }, SIM_DELAY);
  }, []);

  /* 메시지 전송 — 보내면 그 방 멤버가 잠시 뒤 답장 */
  const sendMessage = useCallback((text) => {
    setFeeds((f) => ({ ...f, [roomId]: [...f[roomId], { side: "out", text }] }));
    const replier = room.members.find((m) => !TEAM[m].me);
    setTimeout(() => {
      setFeeds((f) => ({ ...f, [roomId]: [...f[roomId], { who: replier, text: "넵, 확인했어요 👍" }] }));
    }, SIM_DELAY);
  }, [roomId, room]);

  /* 데모 딥링크 자동 진행 */
  useEffect(() => {
    if (!DEMO) return;
    if (DEMO === "profile") { setProfile("junho"); return; }
    const t1 = setTimeout(() => {
      setCard({
        type: "offline", title: "팀 킥오프", place: "강남역",
        date: "7월 14일 (화)", time: "오후 3시",
        votes: { seoyeon: "yes", junho: "pending", jimin: "wait" }, confirmed: false,
      });
    }, 100);
    let t2;
    if (DEMO === "confirmed") {
      t2 = setTimeout(() => {
        setCard((c) => c && { ...c, votes: { seoyeon: "yes", junho: "yes", jimin: "yes" }, confirmed: true });
        setFeeds((f) => ({ ...f, team: [...f.team, { who: "haeun", text: "오 잘됐다! 화요일에 봬요 👋" }] }));
      }, 350);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <main className="h-screen flex gap-4 p-4 max-w-[1180px] mx-auto font-sans">
      <ChatPane
        room={room} feed={feeds[roomId]} card={roomId === "team" ? card : null}
        onApprove={approve} onAlt={suggestAlt}
        onSend={sendMessage} onPostCard={postCard} onProfile={setProfile}
      />
      <RoomList activeId={roomId} unread={unread} onPick={pick} onProfile={setProfile} />
      {profile && <ProfilePanel pid={profile} onClose={() => setProfile(null)} />}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
