import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { MarkEsmar } from "./Logo";

/**
 * Мелкие блоки нового домашнего экрана. Всё, что рисуется внутри —
 * иконки lucide-react, остальное это раскладка на токенах.
 */

/** Таблетка-бейдж: «↗ 2,46% за месяц». */
export function Pill({
  icon: Icon,
  children,
  tone = "neutral",
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  tone?: "neutral" | "up" | "down";
}) {
  return (
    <span className="pill-badge" data-tone={tone}>
      {Icon && <Icon size={13} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

/** Круглая кнопка в шапке — уведомления, календарь. */
export function RoundBtn({
  icon: Icon,
  onClick,
  label,
}: {
  icon: LucideIcon;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button className="roundbtn" onClick={onClick} aria-label={label} type="button">
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}

/** Кнопка быстрого действия: «Пополнить», «Купить», «Вывести». */
export function ActionChip({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button className="action" data-primary={!!primary} onClick={onClick} type="button">
      <span className="action__i">
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span className="action__t">{label}</span>
    </button>
  );
}

/** Строка операции: иконка, название, дата, сумма. */
export function TxRow({
  icon: Icon,
  title,
  sub,
  amount,
  tone,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  amount: string;
  tone?: "up" | "down";
  onClick?: () => void;
}) {
  return (
    <button className="tx" onClick={onClick} type="button">
      <span className="tx__i" data-tone={tone}>
        <Icon size={15} strokeWidth={2.1} />
      </span>
      <span className="tx__b">
        <span className="tx__t">{title}</span>
        <span className="tx__s">{sub}</span>
      </span>
      <span className={`tx__a tnum ${tone === "up" ? "up" : ""}`}>{amount}</span>
    </button>
  );
}

/**
 * «Карточка счёта» — та же роль, что банковская карта в референсе:
 * маска номера, срок, знак бренда.
 */
export function AccountCard({
  number,
  holder,
  brand,
  exp,
}: {
  number: string;
  holder: string;
  brand: string;
  exp: string;
}) {
  return (
    <div className="acard">
      <div className="acard__top">
        <span className="acard__k">{holder}</span>
        <span className="acard__brand">
          <MarkEsmar size={16} />
          {brand}
        </span>
      </div>
      <div className="acard__num tnum">
        <span className="acard__dots" aria-hidden>
          ••••
        </span>
        {number}
        <span className="acard__exp tnum">{exp}</span>
      </div>
      <span className="acard__sheen" aria-hidden />
    </div>
  );
}

/** Заголовок секции с действием справа. */
export function SectionHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="sechead">
      <h2>{title}</h2>
      {action && (
        <button className="sechead__a" onClick={onAction} type="button">
          {action}
          <ArrowUpRight size={13} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}
