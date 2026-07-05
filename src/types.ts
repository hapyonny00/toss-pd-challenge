import type { ScreenId } from "./rationale";

export interface ScreenProps {
  nav: (id: ScreenId) => void;
  toast: (msg: string) => void;
}
