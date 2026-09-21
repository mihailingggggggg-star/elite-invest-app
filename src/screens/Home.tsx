import { motion } from "framer-motion";
import { assetById, cash, holdings, news, ui } from "../lib/data";
import { money, num, pct, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { IcArrow, IcClock, IcOut, IcPie } from "../components/Icons";
import { Brand } from "../components/Brand";

export function Home({
  onAsset,
  onStats,
}: {
  onAsset: (id: string) => void;
  onStats: () => void;
}) {
  const t = useT();
  const { lang } = useApp();

  const value = holdings.reduce((s, h) => s + h.units * assetById(h.id).price, 0) + cash;
  const spent = holdings.reduce((s, h) => s + h.units * h.avg, 0) + cash;
  const diff = value - spent;
  const diffPct = (diff / spent) * 100;

  return (
    <div className="screen">
      <Brand />
      <h1 className="h-screen">{t(ui.tabHome)}</h1>

      <div className="pad stack">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Glass className="pf" radius={26}>
            <div className="pf__k">{t(ui.portfolio)}</div>
            <div className="pf__v tnum">
              {money(Math.round(value))} <small>USD</small>
            </div>
            <div className={`pf__d ${diff < 0 ? "neg" : ""}`}>
              <span className={diff < 0 ? "down" : "up"}>
                {diff > 0 ? "+" : ""}
                {money(Math.round(diff))} ({pct(diffPct)})
              </span>
              <em>{t(ui.allTime)}</em>
            </div>
          </Glass>
        </motion.div>

        <div className="quick">
          <Glass className="tap" radius={20} style={{ padding: 0 }}>
            <button style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "14px 16px", fontWeight: 700, fontSize: 14 }}>
              <span className="quick__i"><IcClock /></span>
              {t(ui.history)}
            </button>
          </Glass>
          <Glass className="tap" radius={20} style={{ padding: 0 }}>
            <button onClick={onStats} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "14px 16px", fontWeight: 700, fontSize: 14 }}>
              <span className="quick__i"><IcPie /></span>
              {t(ui.analytics)}
            </button>
          </Glass>
        </div>

        <Glass className="pf" radius={22} style={{ padding: "16px 18px" }}>
          <div className="pf__k">{t(ui.free)}</div>
          <div className="tnum" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>
            {money(cash)}
          </div>
        </Glass>
      </div>

      <h2 className="h-sec">{t(ui.myShares)}</h2>
      <div className="pad rows">
        {holdings.map((h, i) => {
          const a = assetById(h.id);
          const val = h.units * a.price;
          const d = ((a.price - h.avg) / h.avg) * 100;
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Glass className="row tap" radius={20} as="div" onClick={() => onAsset(a.id)}>
                <img className="row__img" src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" />
                <span>
                  <span className="row__n">{a.name[lang]}</span>
                  <span className="row__s">
                    {num(h.units)} {t(ui.units)} · {a.ticker}
                  </span>
                </span>
                <span className="row__r">
                  <span className="row__p tnum">{money(val)}</span>
                  <span className={`row__c tnum ${d < 0 ? "down" : "up"}`}>{pct(d)}</span>
                </span>
              </Glass>
            </motion.div>
          );
        })}
      </div>

      <h2 className="h-sec">{t(ui.newsTitle)}</h2>
      <div className="pad news">
        {news.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Glass className="ncard" radius={20}>
              <div className="ncard__h">
                <span className="ncard__tag">{n.tag[lang]}</span>
                <span>{n.date}</span>
                <span>· {n.source}</span>
              </div>
              <h4>{n.title[lang]}</h4>
              <p>{n.text[lang]}</p>
              <a href={n.url} target="_blank" rel="noreferrer">
                {t(ui.readSource)} <IcOut />
              </a>
            </Glass>
          </motion.div>
        ))}
      </div>

      <div className="demo">{t(ui.demoNumbers)}</div>
    </div>
  );
}

export { IcArrow };
