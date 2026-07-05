export interface Person {
  initial: string;
  name: string;
  role: string;
  must: boolean;
  answered: boolean;
}

export const PEOPLE: Person[] = [
  { initial: "김", name: "김민준", role: "팀장", must: true, answered: true },
  { initial: "이", name: "이서연", role: "기획 PM", must: true, answered: true },
  { initial: "박", name: "박지후", role: "개발", must: true, answered: true },
  { initial: "정", name: "정하은", role: "디자인", must: true, answered: true },
  { initial: "최", name: "최도윤", role: "마케팅", must: false, answered: false },
  { initial: "강", name: "강수아", role: "데이터", must: false, answered: false },
];

export const DIRECTORY = {
  team: [
    { initial: "김", name: "김민준", role: "팀장", picked: true },
    { initial: "이", name: "이서연", role: "기획 PM", picked: true },
    { initial: "박", name: "박지후", role: "개발", picked: true },
    { initial: "정", name: "정하은", role: "디자인", picked: true },
    { initial: "한", name: "한도경", role: "개발", picked: false },
  ],
  recent: [
    { initial: "최", name: "최도윤", role: "마케팅", picked: true },
    { initial: "강", name: "강수아", role: "데이터", picked: true },
    { initial: "윤", name: "윤재호", role: "영업", picked: false },
  ],
};
