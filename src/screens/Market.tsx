import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { assets, ui, type Market as M } from "../lib/data";
import { money, pct, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { IcSearch } from "../components/Icons";
import { Brand } from "../components/Brand";

export function Market({ onAsset }: { onAsset: (id: string) => void }) {
  const t = useT();
  const { lang } = useApp();
  const [mode, setMode] = useState<M>("primary");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return assets
      .filter((a) => a.markets.includes(mode))
      .filter(
        (a) =>
          !term ||
          a.ticker.toLowerCase().includes(term) ||
          a.name[lang].toLowerCase().includes(term) ||
          a.city[lang].toLowerCase().includes(term)
      )
      /* Primary sorts by what is still open; the internal market by momentum. */
      .sort((a, b) =>
        mode === "primary" ? a.progress - b.progress : b.change - a.change
      );
  }, [mode, q, lang]);

  return (
    <div className="screen">
      <Brand />
      <h1 className="h-screen">{t(ui.tabMarket)}</h1>

      <Glass className="search" radius={20}>
        <IcSearch />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(ui.search)}
          inputMode="search"
        />
      </Glass>

      <div className="pills">
        <button className="pill" data-on={mode === "primary"} onClick={() => setMode("primary")}>
          {t(ui.primary)}
        </button>
        <button className="pill" data-on={mode === "secondary"} onClick={() => setMode("secondary")}>
          {t(ui.secondary)}
        </button>
      </div>

      <div className="pad stack" style={{ marginTop: 12 }}>
        {list.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Glass className="mcard tap" radius={26} as="div" onClick={() => onAsset(a.id)}>
              <div className="mcard__img">
                <img src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" loading="lazy" />
                <div className="mcard__tags">
                  <span className="tag tag--y">
                    <b>{a.yieldPct}%</b> {t(ui.yieldY)}
                  </span>
                  <span className="tag">{a.city[lang]}</span>
                  <span className="tag">{a.kind[lang]}</span>
                </div>
              </div>
              <div className="mcard__b">
                <div className="mcard__t">
                  <div>
                    <div className="mcard__n">{a.name[lang]}</div>
                    <div className="mcard__meta">
                      {a.ticker} · {a.stage[lang]}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mcard__p tnum">{money(a.price)}</div>
                    <div className={`row__c tnum ${a.change < 0 ? "down" : "up"}`}>{pct(a.change)}</div>
                  </div>
                </div>

                <div className="progress">
                  <motion.i
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.round((a.raised / a.target) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <div className="mcard__f">
                  <span>
                    {money(a.raised)} / {money(a.target)} {t(ui.collected)}
                  </span>
                  <span>
                    {t(ui.handover)}: {a.handover[lang]}
                  </span>
                </div>
              </div>
            </Glass>
          </motion.div>
        ))}
      </div>

      <div className="demo">
        {t(ui.minTicket)}
      </div>
    </div>
  );
}
