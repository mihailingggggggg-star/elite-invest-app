import { useState } from "react";
import { motion } from "framer-motion";
import { assetById, news, ui } from "../lib/data";
import { money, num, pct, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { IcBack, IcOut } from "../components/Icons";

type Tab = "overview" | "figures" | "news" | "book";

export function Asset({
  id,
  onBack,
  onTrade,
}: {
  id: string;
  onBack: () => void;
  onTrade: (side: "buy" | "sell") => void;
}) {
  const a = assetById(id);
  const t = useT();
  const { lang } = useApp();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t(ui.tabOverview) },
    { id: "figures", label: t(ui.tabFigures) },
    { id: "news", label: t(ui.tabNews) },
    { id: "book", label: t(ui.tabBook) },
  ];

  const bestBid = a.book.bid[0][0];
  const bestAsk = a.book.ask[0][0];
  const maxVol = Math.max(...[...a.book.bid, ...a.book.ask].map(([, v]) => v));

  return (
    <motion.div
      className="det"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.7 }}
    >
      <div className="det__scroll">
        <div className="det__hero">
          <img src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" />
          <button className="det__back" onClick={onBack} aria-label="back">
            <IcBack />
          </button>
        </div>

        <div className="det__head">
          <h2 className="det__name">{a.name[lang]}</h2>
          <div className="det__sub">
            {a.ticker} · {a.city[lang]} · {a.kind[lang]}
          </div>
          <div className="det__price">
            <b className="tnum">{money(a.price)}</b>
            <span className={`tnum ${a.change < 0 ? "down" : "up"}`}>{pct(a.change)}</span>
            <span style={{ color: "var(--txt-3)", fontSize: 12.5, fontWeight: 600 }}>{t(ui.perUnit)}</span>
          </div>
        </div>

        <div className="tabs">
          {tabs.map((x) => (
            <button key={x.id} data-on={tab === x.id} onClick={() => setTab(x.id)}>
              {tab === x.id && (
                <motion.span className="tabs__pill" layoutId="asset-tab" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              {x.label}
            </button>
          ))}
        </div>

        <div className="pad" style={{ marginTop: 16 }}>
          {tab === "overview" && (
            <div className="stack">
              <p style={{ fontSize: 14.5, color: "var(--txt-2)" }}>{a.about[lang]}</p>

              <Glass className="kpi" radius={20}>
                <b>{t(ui.readiness)}</b>
                <span className="tnum">{a.progress}%</span>
                <div className="progress" style={{ marginTop: 10 }}>
                  <motion.i initial={{ width: 0 }} animate={{ width: `${a.progress}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--txt-3)", marginTop: 8, fontWeight: 600 }}>
                  <span>{a.stage[lang]}</span>
                  <span>{t(ui.handover)}: {a.handover[lang]}</span>
                </div>
              </Glass>

              <div className="facts">
                {a.facts.map((f, i) => (
                  <Glass className="fact" radius={14} key={i}>
                    <b>{f.k[lang]}</b>
                    <span>{f.v}</span>
                  </Glass>
                ))}
              </div>
            </div>
          )}

          {tab === "figures" && (
            <div className="facts">
              <Glass className="fact" radius={14}>
                <b>{t(ui.expYield)}</b>
                <span className="tnum">{a.yieldPct}%</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.collected)}</b>
                <span className="tnum">{Math.round((a.raised / a.target) * 100)}%</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{lang === "ky" ? "Чогултулду" : "Привлечено"}</b>
                <span className="tnum">{money(a.raised)}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{lang === "ky" ? "Максат" : "Цель"}</b>
                <span className="tnum">{money(a.target)}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.bid)}</b>
                <span className="tnum up">{money(bestBid)}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.ask)}</b>
                <span className="tnum down">{money(bestAsk)}</span>
              </Glass>
            </div>
          )}

          {tab === "news" && (
            <div className="news">
              {news.slice(0, 3).map((n, i) => (
                <Glass className="ncard" radius={20} key={i}>
                  <div className="ncard__h">
                    <span className="ncard__tag">{n.tag[lang]}</span>
                    <span>{n.date} · {n.source}</span>
                  </div>
                  <h4>{n.title[lang]}</h4>
                  <p>{n.text[lang]}</p>
                  <a href={n.url} target="_blank" rel="noreferrer">
                    {t(ui.readSource)} <IcOut />
                  </a>
                </Glass>
              ))}
            </div>
          )}

          {tab === "book" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "var(--txt-3)", padding: "0 13px 8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                <span>{t(ui.price)}</span>
                <span>{t(ui.volume)}</span>
              </div>

              <div className="book">
                {a.book.ask.slice().reverse().map(([p, v]) => (
                  <div className="book__row" key={`a${p}`}>
                    <span className="book__fill" style={{ width: `${(v / maxVol) * 100}%`, background: "var(--down)" }} />
                    <span className="tnum down">{money(p)}</span>
                    <span className="tnum book__vol">{num(v)}</span>
                  </div>
                ))}
              </div>

              <div className="spread">
                <span>{t(ui.spread)}</span>
                <span className="tnum">
                  {money(bestAsk - bestBid)} ({pct(((bestAsk - bestBid) / bestBid) * 100, false)})
                </span>
              </div>

              <div className="book">
                {a.book.bid.map(([p, v]) => (
                  <div className="book__row" key={`b${p}`}>
                    <span className="book__fill" style={{ width: `${(v / maxVol) * 100}%`, background: "var(--up)" }} />
                    <span className="tnum up">{money(p)}</span>
                    <span className="tnum book__vol">{num(v)}</span>
                  </div>
                ))}
              </div>

              <div className="note note--dim" style={{ marginTop: 12 }}>
                {lang === "ky"
                  ? "Бул катышуучулардын өз ара рыногу: пайларды бири-бирине сатышат. Демо-маалымат."
                  : "Это внутренний рынок участников: паи продаются между собой. Демоданные."}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="det__bottom">
        <button className="btn btn--s" onClick={() => onTrade("sell")}>{t(ui.sell)}</button>
        <button className="btn btn--p" onClick={() => onTrade("buy")}>{t(ui.buy)}</button>
      </div>
    </motion.div>
  );
}
