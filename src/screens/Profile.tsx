import { assetById, cash, EMAIL, holdings, LICENSE, PHONE, ui, WHATSAPP } from "../lib/data";
import { money, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { Brand } from "../components/Brand";
import { IcArrow, IcChat, IcDoc, IcOut, IcShield } from "../components/Icons";

export function Profile({ onDemo }: { onDemo: () => void }) {
  const t = useT();
  const { lang } = useApp();
  const invested = holdings.reduce((s, h) => s + h.units * assetById(h.id).price, 0);

  return (
    <div className="screen">
      <Brand />
      <h1 className="h-screen">{t(ui.tabProfile)}</h1>

      <div className="pad stack">
        <Glass className="pf" radius={26}>
          <div className="pf__k">{t(ui.account)}</div>
          <div className="tnum" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.035em", marginTop: 4 }}>
            {money(Math.round(invested + cash))}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--txt-3)", marginTop: 6, fontWeight: 600 }}>
            ID 4471 · {lang === "ky" ? "Демо-аккаунт" : "Демоаккаунт"}
          </div>
        </Glass>

        <Glass className="prow" radius={20} as="div">
          <span className="prow__i"><IcShield /></span>
          <span>
            <span className="prow__n">{t(ui.license)} {LICENSE.no}</span>
            <span className="prow__s">{t(ui.licenseFull)} · {LICENSE.date}</span>
          </span>
          <span />
        </Glass>

        <div className="plist">
          <Glass className="prow tap" radius={20} as="div" onClick={onDemo}>
            <span className="prow__i"><IcDoc /></span>
            <span>
              <span className="prow__n">{t(ui.documents)}</span>
              <span className="prow__s">{lang === "ky" ? "Келишимдер жана отчеттор" : "Договоры и отчёты"}</span>
            </span>
            <IcArrow />
          </Glass>

          <a
            className="glass prow tap"
            style={{ borderRadius: 20 }}
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="prow__i"><IcChat /></span>
            <span>
              <span className="prow__n">{t(ui.support)}</span>
              <span className="prow__s">{PHONE} · {EMAIL}</span>
            </span>
            <IcOut />
          </a>
        </div>
      </div>

      <div className="demo">
        {lang === "ky"
          ? "Elite Invest — Elite House тобунун инвестициялык компаниясы. Демо-версия: маалымат сынама."
          : "Elite Invest — инвестиционная компания группы Elite House. Демоверсия: данные ознакомительные."}
      </div>
    </div>
  );
}
