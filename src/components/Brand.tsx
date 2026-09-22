import { Glass } from "./Glass";
import { LogoInvest } from "./Logo";

/**
 * Screen header. Language and theme used to live here as 32px pills pinned to
 * the very top edge — too small to hit reliably on a phone, and under the
 * status bar on a notched device. They now sit in the profile, where they
 * belong, and the header carries only the mark.
 */
export function Brand({ right }: { right?: React.ReactNode }) {
  return (
    <div className="top">
      <LogoInvest width={88} />
      <span className="sp" />
      {right ?? (
        <Glass className="chip-badge" radius={999} refractionHeight={5} refractionAmount={22} blur={10}>
          Demo
        </Glass>
      )}
    </div>
  );
}
