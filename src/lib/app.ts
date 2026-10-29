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

export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

/* ------------------------------------------------------------------ */
/*  Математика договора                                                */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;

const days = (from: string, to: Date) =>
  Math.max(0, Math.floor((to.getTime() - new Date(from).getTime()) / DAY));

const addMonths = (iso: string, months: number) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d;
};

/** Дата окончания договора. */
export const maturity = (c: Contract) => addMonths(c.opened, c.months);

/** Прошло ли больше половины срока — для подписи «в работе / к выплате». */
export const isMature = (c: Contract, now = new Date()) => maturity(c) <= now;

/** Начислено по договору на дату, $. Ставка простая, база 365 дней. */
export const accrued = (c: Contract, now = new Date()) =>
  (c.amount * c.rate * days(c.opened, now)) / 100 / 365;

/** Выплачено по графику: у «Ренты» — равными долями каждый месяц. */
export const paidOut = (c: Contract, now = new Date()) => {
  if (c.product !== "rent") return 0;
  const monthsPassed = Math.floor(days(c.opened, now) / 30.44);
  return Math.min(c.months, monthsPassed) * monthlyPayout(c);
};

/** Ежемесячная выплата по «Ренте», $. */
export const monthlyPayout = (c: Contract) => (c.amount * c.rate) / 100 / 12;

/** Начислено, но ещё не выплачено. */
export const pending = (c: Contract, now = new Date()) =>
  Math.max(0, accrued(c, now) - paidOut(c, now));

/** Стоимость позиции: тело договора плюс всё начисленное. */
export const contractValue = (c: Contract, now = new Date()) => c.amount + accrued(c, now);

/** Срок в годах — для расчёта дохода за весь период. */
const termYears = (c: Contract) => c.months / 12;

/** «1 договор», «2 договора», «5 договоров» / «2 келишим». */
/** Только слово без числа: «договор / договора / договоров» — для подписи метрики. */
export const contractsUnit = (n: number, lang: "ru" | "ky") =>
  contractsWord(n, lang).split(" ").slice(1).join(" ");

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

/** Доход за весь срок по ставке договора. */
export const termIncome = (c: Contract) => (c.amount * c.rate * termYears(c)) / 100;

export const nextPayoutDate = (c: Contract, now = new Date()) => {
  const start = new Date(c.opened);
  const monthsPassed = Math.floor(days(c.opened, now) / 30.44);
  const d = new Date(start);
  d.setMonth(d.getMonth() + monthsPassed + 1);
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
