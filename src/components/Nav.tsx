import { ArrowUpDown, ChartPie, House, LayoutGrid, User } from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "../lib/app";
import { ui } from "../lib/data";

export type Tab = "home" | "market" | "stats" | "profile";

/**
 * Нижняя панель как в референсе: плавающая тёмная пилюля на пять позиций,
 * активный раздел — заливка на всю высоту, подписи нет. Иконки — lucide.
 * Центральная позиция не раздел, а действие: пополнение личного счёта.
 */
export function Nav({
  tab,
  onTab,
  onTopUp,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onTopUp: () => void;
}) {
  const t = useT();

  const left: { id: Tab; label: string; Icon: typeof House }[] = [
    { id: "home", label: t(ui.tabHome), Icon: House },
    { id: "market", label: t(ui.tabMarket), Icon: LayoutGrid },
  ];
  const right: { id: Tab; label: string; Icon: typeof House }[] = [
    { id: "stats", label: t(ui.tabStats), Icon: ChartPie },
    { id: "profile", label: t(ui.tabProfile), Icon: User },
  ];

  return (
    <nav className="nav" aria-label={t(ui.tabHome)}>
      {left.map((i) => (
        <Item key={i.id} {...i} on={tab === i.id} onClick={() => onTab(i.id)} />
      ))}

      <button className="nav__item nav__item--act" onClick={onTopUp} aria-label={t(ui.tabAdd)} type="button">
        <ArrowUpDown size={21} strokeWidth={2} />
      </button>

      {right.map((i) => (
        <Item key={i.id} {...i} on={tab === i.id} onClick={() => onTab(i.id)} />
      ))}
    </nav>
  );
}

function Item({
  label,
  Icon,
  on,
  onClick,
}: {
  label: string;
  Icon: typeof House;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="nav__item"
      data-on={on}
      onClick={onClick}
      aria-label={label}
      aria-current={on ? "page" : undefined}
      type="button"
    >
      {on && (
        <motion.span
          className="nav__pill"
          layoutId="nav-pill"
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
        />
      )}
      <Icon size={21} strokeWidth={on ? 2.2 : 1.8} />
    </button>
  );
}
