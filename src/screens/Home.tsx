import { motion } from "framer-motion";
import { assetById, news, products, ui } from "../lib/data";
import { accrued, contractValue, contractsWord, money, pct, shortDate, useApp, useT, maturity } from "../lib/app";
import { Glass } from "../components/Glass";
import { IcClock, IcPie, IcOut, IcShield, IcArrow } from "../components/Icons";
import { Brand } from "../components/Brand";

export function Home({
  onAsset,
  onStats,
  onHistory,
  onKyc,
  onBrowse,
  onAllNews,
}: {
  onAsset: (id: string) => void;
  onStats: () => void;
  onHistory: () => void;
  onKyc: () => void;
  onBrowse: () => void;
  onAllNews: () => void;
}) {
  const t = useT();
  const { lang, user, contracts, cash } = useApp();
  const now = new Date();

  const body = contracts.reduce((s, c) => s + c.amount, 0);
  const acc = contracts.reduce((s, c) => s + accrued(c, now), 0);
  const total = body + acc;
  const diffPct = body ? (acc / body) * 100 : 0;

  return (
    <div className="screen">
      <Brand />
      <h1 className="h-screen">{t(ui.tabHome)}</h1>

      <div className="pad stack">
        {user ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Glass className="pf" radius={26}>
                <div className="pf__k">{t(ui.portfolio)}</div>
                <div className="pf__v tnum">
                  {money(Math.round(total))} <small>USD</small>
                </div>
                <div className="pf__d">
                  <span className="up">
                    +{money(Math.round(acc))} ({pct(diffPct)})
                  </span>
                  <em>{t(ui.allTime)}</em>
                </div>
              </Glass>
            </motion.div>

            <div className="quick">
              <Glass className="tap" radius={20} style={{ padding: 0 }}>
                <button
                  onClick={onHistory}
                  style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "14px 16px", fontWeight: 700, fontSize: 14 }}
                >
                  <span className="quick__i"><IcClock /></span>
                  {t(ui.history)}
                </button>
              </Glass>
              <Glass className="tap" radius={20} style={{ padding: 0 }}>
                <button
                  onClick={onStats}
                  style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "14px 16px", fontWeight: 700, fontSize: 14 }}
                >
                  <span className="quick__i"><IcPie /></span>
                  {t(ui.analytics)}
                </button>
              </Glass>
            </div>

            <Glass className="pf" radius={22} style={{ padding: "16px 18px" }}>
              <div className="pf__k">{t(ui.personal)}</div>
              <div className="tnum" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>
                {money(cash)}
              </div>
            </Glass>
          </>
        ) : (
          <GuestHero onKyc={onKyc} onBrowse={onBrowse} />
        )}
      </div>

      {user ? (
        <>
          <h2 className="h-sec">
            {t(ui.myContracts)}
            <span>{contractsWord(contracts.length, lang)}</span>
          </h2>
          <div className="pad rows">
            {contracts.map((c, i) => {
              const a = assetById(c.assetId);
              const val = contractValue(c, now);
              const d = ((val - c.amount) / c.amount) * 100;
              return (
                <motion.div
                  key={c.no}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Glass className="row tap" radius={20} as="div" onClick={() => onAsset(a.id)}>
                    <img className="row__img" src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" />
                    <span>
                      <span className="row__n">{a.name[lang]}</span>
                      <span className="row__s">
                        {products[c.product].name[lang]} · {c.rate}% · {lang === "ky" ? "мөөнөтү" : "до"}{" "}
                        {shortDate(maturity(c).toISOString())}
                      </span>
                    </span>
                    <span className="row__r">
                      <span className="row__p tnum">{money(Math.round(val))}</span>
                      <span className="row__c tnum up">{pct(d)}</span>
                    </span>
                  </Glass>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <h2 className="h-sec">
            {t(ui.tabMarket)}
            <button className="hsec__more" onClick={onBrowse}>
              {t(ui.all)} <IcArrow size={13} />
            </button>
          </h2>
          <div className="pad stack">
            {Object.values(products).map((p) => (
              <Glass className="mcard tap" radius={22} key={p.id} as="div" onClick={onBrowse}>
                <div className="mcard__b mcard__b--tight">
                  <div className="mcard__t">
                    <div>
                      <div className="mcard__n">{p.name[lang]}</div>
                      <div className="mcard__meta">
                        {t(ui.term)}: {p.term[lang]} · {t(ui.payout)}: {p.payout[lang]}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mcard__p tnum brand">
                        {p.upTo ? "до " : ""}
                        {p.rate}%
                      </div>
                      <div className="mcard__meta">{t(ui.perYear)}</div>
                    </div>
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        </>
      )}

      <h2 className="h-sec">
        {t(ui.newsTitle)}
        <button className="hsec__more" onClick={onAllNews}>
          {t(ui.allNews)} <IcArrow size={13} />
        </button>
      </h2>
      <div className="pad news">
        {news.slice(0, 3).map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Glass className="ncard" radius={20}>
              <div className="ncard__img">
                <img src={`${import.meta.env.BASE_URL}obj/${n.img}`} alt="" loading="lazy" />
              </div>
              <div className="ncard__b">
                <div className="ncard__h">
                  <span className="ncard__tag" data-about={n.about}>
                    {n.tag[lang]}
                  </span>
                  <span>{n.date}</span>
                  <span>· {n.source}</span>
                </div>
                <h4>{n.title[lang]}</h4>
                <p>{n.text[lang]}</p>
                <a href={n.url} target="_blank" rel="noreferrer">
                  {t(ui.readSource)} <IcOut />
                </a>
              </div>
            </Glass>
          </motion.div>
        ))}
      </div>

      <div className="demo">{t(ui.demoNames)}</div>
    </div>
  );
}

/** Экран для неавторизованной зоны: ставка, лицензия и вход в проверку. */
function GuestHero({ onKyc, onBrowse }: { onKyc: () => void; onBrowse: () => void }) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Glass className="hero" radius={26} refractionHeight={10} refractionAmount={44}>
        <div className="hero__k">{t(ui.guestTitle)}</div>
        <div className="hero__rate tnum">
          до 55% <small>{t(ui.perYear)}</small>
        </div>
        <p className="hero__t">{t(ui.guestText)}</p>

        <div className="hero__lic">
          <IcShield size={15} />
          {t(ui.licenseFull)} · {t(ui.license)} № 88
        </div>

        <div className="hero__b">
          <button className="btn btn--p" onClick={onKyc}>
            {t(ui.guestCta)}
          </button>
          <button className="btn btn--s" onClick={onBrowse}>
            {t(ui.guestBrowse)}
          </button>
        </div>
      </Glass>
    </motion.div>
  );
}
