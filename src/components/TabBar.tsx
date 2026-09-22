import { motion } from "framer-motion";
import { ui } from "../lib/data";
import { useT } from "../lib/app";
import { IcHome, IcMarket, IcPlus, IcStats, IcUser } from "./Icons";

export type Tab = "home" | "market" | "stats" | "profile";

/**
 * Bottom bar with the round top-up button in the middle — the one control
 * that is always one thumb away, on every screen.
 */
export function TabBar({
  tab,
  onTab,
  onAdd,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onAdd: () => void;
}) {
  const t = useT();
  const items: { id: Tab; label: string; Icon: typeof IcHome }[] = [
    { id: "home", label: t(ui.tabHome), Icon: IcHome },
    { id: "market", label: t(ui.tabMarket), Icon: IcMarket },
    { id: "stats", label: t(ui.tabStats), Icon: IcStats },
    { id: "profile", label: t(ui.tabProfile), Icon: IcUser },
  ];

  return (
    <>
      <nav className="bar">
        {items.slice(0, 2).map((i) => (
          <Item key={i.id} {...i} on={tab === i.id} onClick={() => onTab(i.id)} />
        ))}
        <span />
        {items.slice(2).map((i) => (
          <Item key={i.id} {...i} on={tab === i.id} onClick={() => onTab(i.id)} />
        ))}
      </nav>

      {/* Плоская кнопка: framer-motion переписывает transform целиком и
          сбивает центрирующий translateX(-50%), из-за чего «плюс» уезжал
          вправо после каждого нажатия. Отклик даём тенью в CSS. */}
      <button className="fab" onClick={onAdd} aria-label={t(ui.tabAdd)}>
        <IcPlus size={26} />
      </button>
      <span className="fab__label">{t(ui.tabAdd)}</span>
    </>
  );
}

function Item({
  label,
  Icon,
  on,
  onClick,
}: {
  label: string;
  Icon: typeof IcHome;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button className="bar__item" data-on={on} onClick={onClick}>
      {on && (
        <motion.span
          className="bar__dot"
          layoutId="tab-dot"
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      )}
      <Icon size={23} />
      {label}
    </button>
  );
}
