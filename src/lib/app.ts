import { createContext, useContext } from "react";
import type { Lang, T } from "./data";

export type Theme = "light" | "dark";

export type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

export const AppCtx = createContext<Ctx>({
  lang: "ky",
  setLang: () => {},
  theme: "dark",
  setTheme: () => {},
});

export const useApp = () => useContext(AppCtx);
export const useT = () => {
  const { lang } = useApp();
  return (t: T) => t[lang];
};

const nf = new Intl.NumberFormat("ru-RU");

export const money = (v: number, frac = 0) =>
  "$" + v.toLocaleString("ru-RU", { minimumFractionDigits: frac, maximumFractionDigits: frac });

export const num = (v: number) => nf.format(v);

export const pct = (v: number, sign = true) =>
  `${sign && v > 0 ? "+" : ""}${v.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`;
