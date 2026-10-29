import type { Contract, T } from "./data";
import { assetById } from "./data";
import { accrued, maturity, monthlyPayout, shortDate } from "./app";

/**
 * Лента операций для главного экрана: подписания договоров, начисления
 * и выплаты. Собирается из тех же договоров, поэтому всегда сходится
 * с портфелем и не требует отдельного стора.
 */

export type EventKind = "sign" | "accrual" | "payout" | "topup" | "terminate";

export type Event = {
  id: string;
  kind: EventKind;
  title: T;
  sub: T;
  /** Со знаком: пополнение и начисление — плюс, подписание — минус */
  amount: number;
  date: string;
};

export function feed(contracts: Contract[], now = new Date()): Event[] {
  const out: Event[] = [];

  /* Начисление показываем одной строкой на весь портфель: по каждому
     договору оно приходится на сегодня и превращало ленту в три одинаковых. */
  const totalAccrued = contracts.reduce((s, c) => s + accrued(c, now), 0);
  if (totalAccrued >= 1) {
    out.push({
      id: "accrual",
      kind: "accrual",
      title: { ru: "Портфель", ky: "Портфель" },
      sub: { ru: "Начисление по договорам", ky: "Келишимдер боюнча эсептөө" },
      amount: Math.round(totalAccrued),
      date: now.toISOString().slice(0, 10),
    });
  }

  for (const c of contracts) {
    const a = assetById(c.assetId);
    out.push({
      id: `sign-${c.no}`,
      kind: "sign",
      title: a.name,
      sub: { ru: "Договор подписан", ky: "Келишимге кол коюлду" },
      amount: -c.amount,
      date: c.opened,
    });

    if (c.product === "rent") {
      /* Ближайшая прошедшая выплата по графику; будущие в ленту не попадают. */
      const passed = Math.floor(
        (now.getTime() - new Date(c.opened).getTime()) / 86_400_000 / 30.44
      );
      if (passed >= 1) {
        const d = new Date(c.opened);
        d.setMonth(d.getMonth() + Math.min(passed, c.months));
        out.push({
          id: `pay-${c.no}`,
          kind: "payout",
          title: a.name,
          sub: { ru: "Арендная выплата", ky: "Ижара төлөмү" },
          amount: Math.round(monthlyPayout(c)),
          date: d.toISOString().slice(0, 10),
        });
      }
    }
  }

  return out.sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0));
}

/** Подпись под операцией: «Сегодня, 11:42» / «12.02.2026». */
export const eventDate = (iso: string, lang: "ru" | "ky") => {
  const d = new Date(iso);
  const today = new Date();
  const same =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (same) return lang === "ky" ? "Бүгүн" : "Сегодня";
  return shortDate(iso);
};

/** Ближайшая дата окончания договора — для карточки «к выплате». */
export const lastMaturity = (contracts: Contract[]) =>
  contracts.length
    ? contracts
        .map((c) => maturity(c))
        .sort((a, b) => b.getTime() - a.getTime())[0]
    : null;
