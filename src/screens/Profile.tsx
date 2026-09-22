import { motion } from "framer-motion";
import { assetById, cash, DEMO_EMAIL, EMAIL, holdings, LICENSE, PHONE, ui, WHATSAPP } from "../lib/data";
import { money, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { LogoInvest } from "../components/Logo";
import { IcArrow, IcChat, IcDoc, IcGlobe, IcMoon, IcOut, IcShield, IcSun } from "../components/Icons";

const NAME = "Михаил Бандурин";

/**
 * The account header mirrors the cabinet top bar of the trading web app:
 * mark, then who you are — avatar, name, contact and the status that would
 * otherwise be buried in settings.
 */
export function Profile({ onDemo }: { onDemo: () => void }) {
  const t = useT();
  const { lang, setLang, theme, setTheme } = useApp();
  const inObjects = holdings.reduce((s, h) => s + h.units * assetById(h.id).price, 0);
  const initials = NAME.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div className="screen">
      <div className="top">
        <LogoInvest width={88} />
        <span className="sp" />
        <Glass className="chip-badge" radius={999} refractionHeight={5} refractionAmount={22} blur={10}>
          Demo
        </Glass>
      </div>

      <div className="pad" style={{ marginTop: 6 }}>
        <Glass className="acct" radius={26} refractionHeight={10} refractionAmount={44}>
          <div className="acct__top">
            <span className="avatar" aria-hidden>{initials}</span>
            <span className="acct__who">
              <span className="acct__n">{NAME}</span>
              <span className="acct__e">{DEMO_EMAIL}</span>
            </span>
          </div>

          <div className="acct__badges">
            <span className="badge">
              <IcShield /> {t(ui.investor)}
            </span>
            <span className="badge">{t(ui.sinceYear)}</span>
          </div>

          <div className="acct__split">
            <span>
              <b>{t(ui.portfolioShort)}</b>
              <i className="tnum">{money(Math.round(inObjects + cash))}</i>
            </span>
            <span>
              <b>{t(ui.inWork)}</b>
              <i className="tnum">{money(Math.round(inObjects))}</i>
            </span>
            <span>
              <b>{t(ui.freeShort)}</b>
              <i className="tnum">{money(cash)}</i>
            </span>
          </div>
        </Glass>
      </div>

      <h2 className="h-sec">{t(ui.settings)}</h2>
      <div className="pad plist">
        <Glass className="prow" radius={20} as="div">
          <span className="prow__i"><IcGlobe /></span>
          <span>
            <span className="prow__n">{t(ui.language)}</span>
            <span className="prow__s">{lang === "ky" ? "Кыргызча" : "Русский"}</span>
          </span>
          <Seg
            name="lang"
            value={lang}
            onChange={setLang}
            options={[
              { v: "ky" as const, label: "KG" },
              { v: "ru" as const, label: "RU" },
            ]}
          />
        </Glass>

        <Glass className="prow" radius={20} as="div">
          <span className="prow__i">{theme === "dark" ? <IcMoon /> : <IcSun />}</span>
          <span>
            <span className="prow__n">{t(ui.theme)}</span>
            <span className="prow__s">{theme === "dark" ? t(ui.themeDark) : t(ui.themeLight)}</span>
          </span>
          <Seg
            name="theme"
            value={theme}
            onChange={setTheme}
            options={[
              { v: "dark" as const, label: <IcMoon /> },
              { v: "light" as const, label: <IcSun /> },
            ]}
          />
        </Glass>
      </div>

      <h2 className="h-sec">{t(ui.documents)}</h2>
      <div className="pad plist">
        <Glass className="prow" radius={20} as="div">
          <span className="prow__i"><IcShield /></span>
          <span>
            <span className="prow__n">{t(ui.license)} {LICENSE.no}</span>
            <span className="prow__s">{t(ui.licenseFull)} · {LICENSE.date}</span>
          </span>
          <span />
        </Glass>

        <Glass className="prow tap" radius={20} as="div" onClick={onDemo}>
          <span className="prow__i"><IcDoc /></span>
          <span>
            <span className="prow__n">{t(ui.documents)}</span>
            <span className="prow__s">{lang === "ky" ? "Келишимдер жана отчеттор" : "Договоры и отчёты"}</span>
          </span>
          <IcArrow />
        </Glass>

        <a className="glass prow tap" style={{ borderRadius: 20 }} href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
          <span className="prow__i"><IcChat /></span>
          <span>
            <span className="prow__n">{t(ui.support)}</span>
            <span className="prow__s">{PHONE} · {EMAIL}</span>
          </span>
          <IcOut />
        </a>
      </div>

      <div className="demo">
        {lang === "ky"
          ? "Elite Invest — Elite House тобунун инвестициялык компаниясы. Демо-версия: маалымат сынама."
          : "Elite Invest — инвестиционная компания группы Elite House. Демоверсия: данные ознакомительные."}
      </div>
    </div>
  );
}

/** Tap targets are 44px tall here — the old 32px pills at the screen edge
 *  were the reason the switches felt dead on a phone. */
function Seg<V extends string>({
  value,
  options,
  onChange,
  name,
}: {
  value: V;
  options: { v: V; label: React.ReactNode }[];
  onChange: (v: V) => void;
  name: string;
}) {
  return (
    <div className="seg seg--lg">
      {options.map((o) => (
        <button key={o.v} data-on={o.v === value} onClick={() => onChange(o.v)} aria-label={String(o.v)}>
          {o.v === value && (
            <motion.span className="seg__pill" layoutId={`seg-${name}`} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
          )}
          {o.label}
        </button>
      ))}
    </div>
  );
}
