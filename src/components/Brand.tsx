import { Glass } from "./Glass";
import { LogoEsmar } from "./Logo";

/**
 * Верхняя строка экрана: знак ESMAR и необязательный элемент справа.
 * Логотип подкрашивается цветом темы через `currentColor`.
 */
export function Brand({ right }: { right?: React.ReactNode }) {
  return (
    <div className="top">
      <span className="top__logo">
        <LogoEsmar width={104} />
      </span>
      <span className="sp" />
      {right ?? (
        <Glass className="chip-badge" radius={999} refractionHeight={5} refractionAmount={22} blur={10}>
          Демо
        </Glass>
      )}
    </div>
  );
}
