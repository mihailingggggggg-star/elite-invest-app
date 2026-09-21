import { motion } from "framer-motion";
import { ui } from "../lib/data";
import { useApp, useT } from "../lib/app";
import { IcMoon, IcSun } from "./Icons";
import { LogoInvest } from "./Logo";

/** App header: the mark, then the two switches people look for first. */
export function Brand() {
  const { lang, setLang, theme, setTheme } = useApp();
  const t = useT();

  return (
    <div className="top">
      <LogoInvest width={88} />
      <span className="sp" />

      <div className="seg" role="group" aria-label={t(ui.language)}>
        {(["ky", "ru"] as const).map((v) => (
          <button key={v} data-on={lang === v} onClick={() => setLang(v)} aria-label={v}>
            {lang === v && <motion.span className="seg__pill" layoutId="seg-lang" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            {v === "ky" ? "KG" : "RU"}
          </button>
        ))}
      </div>

      <div className="seg" role="group" aria-label={t(ui.theme)}>
        {(["dark", "light"] as const).map((v) => (
          <button key={v} data-on={theme === v} onClick={() => setTheme(v)} aria-label={v}>
            {theme === v && <motion.span className="seg__pill" layoutId="seg-theme" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            {v === "dark" ? <IcMoon /> : <IcSun />}
          </button>
        ))}
      </div>
    </div>
  );
}
