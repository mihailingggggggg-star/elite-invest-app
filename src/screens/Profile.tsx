import { COMPANY, ui } from "../lib/data";
import { accrued, money, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { Seg } from "../components/Seg";
import { Settings2 } from "lucide-react";
import { RoundBtn } from "../components/kit";
import {
  IcArrow,
  IcChat,
  IcDoc,
  IcGlobe,
  IcMoon,
  IcOut,
  IcShield,
  IcSun,
  IcUser,
} from "../components/Icons";

export function Profile({ onKyc, onDemo }: { onKyc: () => void; onDemo: () => void }) {
  const t = useT();
  const { lang, setLang, theme, setTheme, user, contracts, cash, signOut } = useApp();
  const now = new Date();

  const body = contracts.reduce((s, c) => s + c.amount, 0);
  const acc = contracts.reduce((s, c) => s + accrued(c, now), 0);
  const initials = user
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div className="screen">
      <header className="hdr hdr--plain">
        <span className="hdr__title">{t(ui.tabProfile)}</span>
        <RoundBtn icon={Settings2} onClick={onDemo} label={t(ui.settings)} />
      </header>

      <div className="pad" style={{ marginTop: 6 }}>
        {user ? (
          <Glass className="acct" radius={26} refractionHeight={10} refractionAmount={44}>
            <div className="acct__top">
              <span className="avatar" aria-hidden>
                {initials}
              </span>
              <span className="acct__who">
                <span className="acct__n">{user.name}</span>
                <span className="acct__e">{user.email}</span>
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
                <b>{t(ui.portfolio)}</b>
                <i className="tnum">{money(Math.round(body + acc + cash))}</i>
              </span>
              <span>
                <b>{t(ui.inWork)}</b>
                <i className="tnum">{money(Math.round(body + acc))}</i>
              </span>
              <span>
                <b>{t(ui.freeShort)}</b>
                <i className="tnum">{money(cash)}</i>
              </span>
            </div>
          </Glass>
        ) : (
          <Glass className="acct acct--guest" radius={26} refractionHeight={10} refractionAmount={44}>
            <div className="acct__top">
              <span className="avatar avatar--ghost" aria-hidden>
                <IcUser size={22} />
              </span>
              <span className="acct__who">
                <span className="acct__n">{t(ui.kycTitle)}</span>
                <span className="acct__e">{t(ui.guestLocked)}</span>
              </span>
            </div>
            <button className="btn btn--p" onClick={onKyc}>
              {t(ui.guestCta)}
            </button>
          </Glass>
        )}
      </div>

      <h2 className="h-sec">{t(ui.settings)}</h2>
      <div className="pad plist">
        <Glass className="prow" radius={20} as="div">
          <span className="prow__i">
            <IcGlobe />
          </span>
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
          <span className="prow__i">
            <IcShield />
          </span>
          <span>
            <span className="prow__n">
              {t(ui.license)} {COMPANY.license.no}
            </span>
            <span className="prow__s">
              Финнадзор КР · {COMPANY.license.date}
            </span>
          </span>
          <span />
        </Glass>

        <a className="glass prow tap" style={{ borderRadius: 20 }} href={`${COMPANY.site}/dokumenty`} target="_blank" rel="noreferrer">
          <span className="prow__i">
            <IcDoc />
          </span>
          <span>
            <span className="prow__n">{t(ui.documents)}</span>
            <span className="prow__s">{t(ui.docsNote)}</span>
          </span>
          <IcOut />
        </a>

        <Glass className="prow tap" radius={20} as="div" onClick={onDemo}>
          <span className="prow__i">
            <IcDoc />
          </span>
          <span>
            <span className="prow__n">{t(ui.sample)}</span>
            <span className="prow__s">{t(ui.offerShort ?? ui.offer)}</span>
          </span>
          <IcArrow />
        </Glass>

        <a className="glass prow tap" style={{ borderRadius: 20 }} href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">
          <span className="prow__i">
            <IcChat />
          </span>
          <span>
            <span className="prow__n">{t(ui.support)}</span>
            <span className="prow__s">
              {COMPANY.phone} · {COMPANY.email}
            </span>
          </span>
          <IcOut />
        </a>
      </div>

      {user && (
        <div className="pad" style={{ marginTop: 18 }}>
          <button className="btn btn--s" onClick={signOut}>
            {t(ui.logout)}
          </button>
        </div>
      )}

      <div className="demo">
        {lang === "ky"
          ? "ESMAR — Кыргызстандын кыймылсыз мүлкүндөгү реалдуу долбоорлорго үлүштүк башкаруу. Демо-версия: маалымат сынама."
          : "ESMAR — долевое управление реальными проектами в недвижимости Кыргызстана. Демоверсия: данные ознакомительные."}
      </div>
    </div>
  );
}
