import { createContext, useContext } from "react";
import type { Contract, Lang, T } from "./data";
import { demoCash, demoContracts } from "./data";

export type Theme = "light" | "dark";

export type User = {
  name: string;
  email: string;
  /** Когда пройдена проверка личности, ISO */
  verifiedAt: string;
};

export type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** null — неавторизованная зона */
  user: User | null;
  contracts: Contract[];
  cash: number;
  /** Проверка личности: возвращает Promise, чтобы флоу покупки дождался её. */
  verify: (name: string) => void;
  signOut: () => void;
  addContract: (c: Contract) => void;
  removeContract: (no: string) => void;
  setCash: (v: number) => void;
};

export const AppCtx = createContext<Ctx>({
  lang: "ky",
  setLang: () => {},
  theme: "dark",
  setTheme: () => {},
  user: null,
  contracts: [],
  cash: 0,
  verify: () => {},
  signOut: () => {},
  addContract: () => {},
  removeContract: () => {},
  setCash: () => {},
});

export const useApp = () => useContext(AppCtx);
export const useT = () => {
  const { lang } = useApp();
  return (t: T) => t[lang];
};

/* ------------------------------------------------------------------ */
/*  Форматирование                                                     */
/* ------------------------------------------------------------------ */

const nf = new Intl.NumberFormat("ru-RU");

export const money = (v: number, frac = 0) =>
  "$" + v.toLocaleString("ru-RU", { minimumFractionDigits: frac, maximumFractionDigits: frac });

export const num = (v: number) => nf.format(v);

export const pct = (v: number, sign = true) =>
  `${sign && v > 0 ? "+" : ""}${v.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`;

/** Число с фиксированной точностью в русской записи: 23,7 (а не 23.7). */
export const fixed = (v: number, digits = 1) =>
  v.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

/* ------------------------------------------------------------------ */
/*  Математика договора                                                */
/* ------------------------------------------------------------------ */

/** Период, за который показываем примерный доход. */
export type IncomePeriod = "year" | "month" | "day";

const DAY = 86_400_000;

/**
 * Дата договора приходит как "2026-02-12" — без времени. Конструктор `new
 * Date(строка)` читает такую строку как UTC, и на UTC+6 сдвиг съедал сутки:
 * начисление занижалось ровно на день. Разбираем как локальное начало дня.
 */
export const parseDate = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);

const days = (from: string, to: Date) =>
  Math.max(0, Math.floor((to.getTime() - parseDate(from).getTime()) / DAY));

const addMonths = (iso: string, months: number) => {
  const d = parseDate(iso);
  d.setMonth(d.getMonth() + months);
  return d;
};

/** Дата окончания договора. */
export const maturity = (c: Contract) => addMonths(c.opened, c.months);

/** Сколько целых месяцев прошло с начала договора (по календарю). */
export const monthsPassed = (c: Contract, now = new Date()) => {
  const start = parseDate(c.opened);
  if (now <= start) return 0;
  const total =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, Math.min(c.months, total + (now.getDate() >= start.getDate() ? 0 : -1)));
};

/** Сколько целых месяцев осталось до конца срока (0, если срок истёк). */
export const monthsLeft = (c: Contract, now = new Date()) => {
  const m = maturity(c);
  if (m <= now) return 0;
  const total = (m.getFullYear() - now.getFullYear()) * 12 + (m.getMonth() - now.getMonth());
  const rest = m.getDate() - now.getDate();
  return Math.max(0, total + (rest >= 0 ? 0 : -1));
};

/** Прошло ли больше половины срока — для подписи «в работе / к выплате». */
export const isMature = (c: Contract, now = new Date()) => maturity(c) <= now;

/** Дней в сроке договора по календарю — база всех денежных расчётов. */
const termDays = (c: Contract) => {
  const d = days(c.opened, maturity(c));
  return d > 0 ? d : Math.round(c.months * 30.44);
};

/** Начислено по договору на дату, $. Ставка простая, база 365 дней.
 *  После окончания срока начисление останавливается. */
export const accrued = (c: Contract, now = new Date()) =>
  (c.amount * c.rate * Math.min(days(c.opened, now), termDays(c))) / 100 / 365;

/** Выплачено по графику: у «Ренты» — равными долями каждый месяц. */
export const paidOut = (c: Contract, now = new Date()) => {
  if (c.product !== "rent") return 0;
  return monthsPassed(c, now) * monthlyPayout(c);
};

/** Ежемесячная выплата по «Ренте»: доход за срок, поделённый на число месяцев. */
export const monthlyPayout = (c: Contract) => termIncome(c) / c.months;

/** Начислено, но ещё не выплачено. */
export const pending = (c: Contract, now = new Date()) =>
  Math.max(0, accrued(c, now) - paidOut(c, now));

/** Стоимость позиции: тело договора плюс всё начисленное. */
export const contractValue = (c: Contract, now = new Date()) => c.amount + accrued(c, now);


/** «1 договор», «2 договора», «5 договоров» / «2 келишим». */
/** Только слово без числа: «договор / договора / договоров» — для подписи метрики. */
/** «1 день», «2 дня», «232 дня» — числительное уже стоит рядом с метрикой. */
export const daysWord = (n: number) => {
  const t = Math.abs(n) % 100;
  const u = t % 10;
  if (t > 10 && t < 20) return "дней";
  if (u === 1) return "день";
  if (u >= 2 && u <= 4) return "дня";
  return "дней";
};

export const contractsUnit = (n: number, lang: "ru" | "ky") =>
  contractsWord(n, lang).split(" ").slice(1).join(" ");

/** «1 объект», «2 объекта», «5 объектов» — по числу уникальных объектов. */
export const objectsWord = (n: number, lang: "ru" | "ky") => {
  if (lang === "ky") return `${n} объект`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "объект"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "объекта"
        : "объектов";
  return `${n} ${word}`;
};

export const contractsWord = (n: number, lang: "ru" | "ky") => {
  if (lang === "ky") return `${n} келишим`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "договор"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "договора"
        : "договоров";
  return `${n} ${word}`;
};

/** «1 год», «2 года», «3 года» / «1 жыл», «2 жыл», «3 жыл». */
export const termLabel = (months: number, lang: "ru" | "ky") => {
  const y = months / 12;
  if (lang === "ky") return `${y} жыл`;
  return `${y} ${y === 1 ? "год" : "года"}`;
};

/** Годовой доход по договору, $ (ставка от суммы). */
export const annualIncome = (c: Contract) => (c.amount * c.rate) / 100;

/**
 * Примерный доход за период по одному договору.
 * Год = ставка от суммы, месяц = год / 12, день = год / 365 —
 * поэтому год, месяц и день всегда сходятся между собой.
 */
export const incomeFor = (c: Contract, period: IncomePeriod, now = new Date()) => {
  if (isMature(c, now)) return 0;
  const year = annualIncome(c);
  if (period === "year") return year;
  if (period === "month") return year / 12;
  return year / 365;
};

/** Примерный доход по портфелю за период. */
export const portfolioIncome = (contracts: Contract[], period: IncomePeriod, now = new Date()) =>
  contracts.reduce((sum, c) => sum + incomeFor(c, period, now), 0);

/** Доход за весь срок по ставке договора. */
export const termIncome = (c: Contract) => (c.amount * c.rate * termDays(c)) / 100 / 365;

export const nextPayoutDate = (c: Contract, now = new Date()) => {
  const d = parseDate(c.opened);
  d.setMonth(d.getMonth() + Math.min(monthsPassed(c, now) + 1, c.months));
  return d;
};

/**
 * Условия расторжения. Правила демонстрационные, но повторяют логику
 * продуктов с esmar.kg: доход пересчитывается по факту, тело возвращается
 * на личный счёт, у девелопмента при досрочном выходе удерживается комиссия.
 */
export function termination(c: Contract, now = new Date()) {
  const acc = accrued(c, now);
  const paid = paidOut(c, now);
  const matured = isMature(c, now);

  if (c.product === "rent") {
    return {
      fee: 0,
      refund: c.amount + acc - paid,
      note: {
        ru: "Возврат тела договора и начисленного дохода за фактический период. Уже выплаченный доход не пересчитывается.",
        ky: "Келишимдин негизги суммасы жана фактылык мезгил үчүн эсептелген киреше кайтарылат. Төлөнгөн киреше кайра эсептелбейт.",
      } as T,
    };
  }

  if (c.product === "development") {
    if (matured) {
      return {
        fee: 0,
        refund: c.amount + acc,
        note: {
          ru: "Срок договора истёк — возвращается тело и весь начисленный доход.",
          ky: "Келишимдин мөөнөтү бүттү — негизги сумма жана бардык эсептелген киреше кайтарылат.",
        } as T,
      };
    }
    const fee = Math.round(c.amount * 0.05);
    return {
      fee,
      refund: c.amount - fee,
      note: {
        ru: "Досрочное расторжение: удерживается 5% суммы договора, начисленный доход не выплачивается. Возврат — до 10 рабочих дней.",
        ky: "Мөөнөтүнөн мурун бузуу: келишим суммасынын 5%ы кармалат, эсептелген киреше төлөнбөйт. Кайтаруу — 10 жумушчу күнгө чейин.",
      } as T,
    };
  }

  return {
    fee: 0,
    refund: c.amount,
    note: {
      ru: "Партнёрский договор расторгается по согласованию сторон: прибыль распределяется по результатам этапа, тело возвращается после оценки объекта.",
      ky: "Өнөктөштүк келишими тараптардын макулдашуусу боюнча бузулат: пайда этаптын жыйынтыгы боюнча бөлүштүрүлөт, негизги сумма объект баалангандан кийин кайтарылат.",
    } as T,
  };
}

/** Ставка девелопмента от срока: 20% за год, 25% за два, 30% за три. */
export const developmentRate = (months: number) =>
  months >= 36 ? 30 : months >= 24 ? 25 : 20;

/* ------------------------------------------------------------------ */
/*  Демо-портфель                                                      */
/* ------------------------------------------------------------------ */

export const seedContracts = () => demoContracts.map((c) => ({ ...c }));
export const seedCash = () => demoCash;
