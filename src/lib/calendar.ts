/**
 * 캘린더 엔진 — 다음 주 날짜 계산 · Google/Outlook/ICS 실동작
 * 오늘 기준 '다음 주 월–금'을 동적으로 계산해 화면 표기와 내보내기에 씁니다.
 */

export const DAYS_KO = ["월", "화", "수", "목", "금"] as const;

export function nextWeekday(monOffset: number): Date {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 월=0
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dow) + monOffset);
}

function at(d: Date, h: number, m = 0): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
}

export const SLOT = {
  tue: { day: 1, h: 11, label: "화요일 오전 11시", room: "11층 회의실 B" },
  wed: { day: 2, h: 14, label: "수요일 오후 2시", room: "" },
  thu: { day: 3, h: 10, label: "목요일 오전 10시", room: "10층 회의실 A" },
  fri: { day: 4, h: 16, label: "금요일 오후 4시", room: "" },
} as const;

export type SlotKey = keyof typeof SLOT;

export function slotDate(key: SlotKey): Date {
  return at(nextWeekday(SLOT[key].day), SLOT[key].h);
}

const pad = (n: number) => (n < 10 ? "0" : "") + n;

export function fmtShort(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export const when = {
  thuShort: () => `${fmtShort(slotDate("thu"))} (목)`,
  wedShort: () => `${fmtShort(slotDate("wed"))} (수)`,
  friShort: () => `${fmtShort(slotDate("fri"))} (금)`,
  thuLong: () => `${fmtShort(slotDate("thu"))} 목요일`,
  tueLong: () => `${fmtShort(slotDate("tue"))} 화요일`,
  range: () => `${fmtShort(nextWeekday(0))} – ${fmtShort(nextWeekday(4))}`,
};

/* ---------- 내보내기 ---------- */

export interface MeetingEvent {
  title: string;
  start: Date;
  end: Date;
  room: string;
  desc: string;
}

export function buildEvent(kind: SlotKey, title: string): MeetingEvent {
  const start = slotDate(kind);
  return {
    title: title.trim() || "디자인 리뷰 · 6명",
    start,
    end: new Date(start.getTime() + 60 * 60 * 1000),
    room: SLOT[kind].room,
    desc: "토스 회의 잡기로 잡은 회의예요.\n화상 참여: https://meet.toss.im/design-review",
  };
}

function stampLocal(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}
function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}
// RFC 5545 DTSTAMP must be genuine UTC when suffixed with "Z" — unlike
// DTSTART/DTEND (which are wall-clock time paired with TZID=Asia/Seoul),
// this one actually needs a real UTC conversion, not local clock digits.
function stampUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
// RFC 5545 §3.3.11: TEXT values must escape backslash, semicolon, comma,
// and newline — in that order, so escaping one doesn't get re-escaped by
// the next. Titles/locations are free-text the user types (e.g. "1:1, 지민"),
// so this isn't just theoretical: an unescaped comma or semicolon corrupts
// the property for any RFC-compliant parser.
function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function openGoogle(ev: MeetingEvent): void {
  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(ev.title)}` +
    `&dates=${stampLocal(ev.start)}/${stampLocal(ev.end)}` +
    "&ctz=Asia/Seoul" +
    `&location=${encodeURIComponent(ev.room)}` +
    `&details=${encodeURIComponent(ev.desc)}`;
  window.open(url, "_blank", "noopener");
}

export function openOutlook(ev: MeetingEvent): void {
  const url =
    "https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
    `&subject=${encodeURIComponent(ev.title)}` +
    `&startdt=${encodeURIComponent(isoLocal(ev.start))}` +
    `&enddt=${encodeURIComponent(isoLocal(ev.end))}` +
    `&location=${encodeURIComponent(ev.room)}` +
    `&body=${encodeURIComponent(ev.desc)}`;
  window.open(url, "_blank", "noopener");
}

function newUid(): string {
  const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${id}@meeting.toss.im`;
}

export function downloadICS(ev: MeetingEvent, alarmMin: number): void {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//toss meeting//KR",
    "CALSCALE:GREGORIAN",
    // Asia/Seoul has used a fixed +09:00 offset with no DST since 1961, so
    // a single STANDARD sub-component fully and correctly describes it —
    // this is what lets DTSTART/DTEND below reference TZID=Asia/Seoul and
    // still be understood by strict RFC 5545 parsers, not just calendar
    // apps that special-case well-known IANA zone names.
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Seoul",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900",
    "TZNAME:KST",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${newUid()}`,
    // DTSTAMP with a "Z" suffix must be real UTC, unlike DTSTART/DTEND
    // below — see stampUTC's comment.
    `DTSTAMP:${stampUTC(new Date())}`,
    `DTSTART;TZID=Asia/Seoul:${stampLocal(ev.start)}`,
    `DTEND;TZID=Asia/Seoul:${stampLocal(ev.end)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    ...(ev.room ? [`LOCATION:${icsEscape(ev.room)}`] : []),
    `DESCRIPTION:${icsEscape(ev.desc)}`,
    "BEGIN:VALARM",
    `TRIGGER:-PT${alarmMin}M`,
    "ACTION:DISPLAY",
    "DESCRIPTION:곧 회의가 시작돼요",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "회의.ics";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 400);
}
