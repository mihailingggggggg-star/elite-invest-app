import { useState } from "react";
import { motion } from "framer-motion";
import { assetById, COMPANY, news, products, stages, ui, type Contract } from "../lib/data";
import {
  accrued,
  contractValue,
  maturity,
  money,
  monthlyPayout,
  nextPayoutDate,
  shortDate,
  termIncome,
  useApp,
  useT,
} from "../lib/app";
import { Glass } from "../components/Glass";
import { IcBack, IcDoc, IcOut, IcSeal, IcArrow } from "../components/Icons";

type Tab = "overview" | "figures" | "news" | "deal";

export function Asset({
  id,
  onBack,
  onBuy,
  onTerminate,
}: {
  id: string;
  onBack: () => void;
  onBuy: () => void;
  onTerminate: () => void;
}) {
  const a = assetById(id);
  const t = useT();
  const { lang, contracts, user } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const now = new Date();

  const p = products[a.product];
  const mine = contracts.filter((c) => c.assetId === a.id);
  const funded = Math.round((a.raised / a.target) * 100);
  const consultOnly = a.product === "partnership";

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t(ui.tabOverview) },
    { id: "figures", label: t(ui.tabFigures) },
    { id: "news", label: t(ui.tabNews) },
    { id: "deal", label: t(ui.tabDeal) },
  ];

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
          <button className="det__back" onClick={onBack} aria-label={t(ui.back)}>
            <IcBack />
          </button>
          <div className="det__tags">
            <span className="tag tag--y">{p.name[lang]}</span>
            <span className="tag">{a.city[lang]}</span>
          </div>
        </div>

        <div className="det__head">
          <h2 className="det__name">{a.name[lang]}</h2>
          <div className="det__sub">
            {a.kind[lang]} · {a.address[lang]}
            {a.area !== "—" ? ` · ${a.area}` : ""}
          </div>
          <div className="det__price">
            <b className="tnum brand">
              {p.upTo ? "до " : ""}
              {a.rate}%
            </b>
            <span className="det__per">{t(ui.perYear)}</span>
          </div>
          <div className="det__meta">
            <span>
              {t(ui.term)}: {a.term[lang]}
            </span>
            <span>
              {t(ui.payout)}: {a.payout[lang]}
            </span>
          </div>
        </div>

        <div className="tabs">
          {tabs.map((x) => (
            <button key={x.id} data-on={tab === x.id} onClick={() => setTab(x.id)}>
              {tab === x.id && (
                <motion.span
                  className="tabs__pill"
                  layoutId="asset-tab"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {x.label}
            </button>
          ))}
        </div>

        <div className="pad" style={{ marginTop: 16 }}>
          {tab === "overview" && (
            <div className="stack">
              <p className="det__about">{a.about[lang]}</p>

              <Glass className="kpi" radius={20}>
                <b>{t(ui.progress)}</b>
                <span className="tnum">
                  {money(a.raised)} <i className="dim">/ {money(a.target)}</i>
                </span>
                <div className="progress" style={{ marginTop: 10 }}>
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: `${funded}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="kpi__f">
                  <span>
                    {funded}% {t(ui.collected)}
                  </span>
                  <span>{a.handover[lang]}</span>
                </div>
              </Glass>

              <Glass className="kpi" radius={20}>
                <b>{t(ui.buildProgress)}</b>
                <span className="tnum">{a.progress}%</span>
                <Track index={a.stage} />
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
                <b>{t(ui.rate)}</b>
                <span className="tnum brand">
                  {p.upTo ? "до " : ""}
                  {a.rate}% {t(ui.perYear)}
                </span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.term)}</b>
                <span className="tnum">{a.term[lang]}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.payout)}</b>
                <span>{a.payout[lang]}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.minTicket)}</b>
                <span className="tnum">{money(a.min)}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.raised)}</b>
                <span className="tnum">{money(a.raised)}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.goal)}</b>
                <span className="tnum">{money(a.target)}</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.readiness)}</b>
                <span className="tnum">{a.progress}%</span>
              </Glass>
              <Glass className="fact" radius={14}>
                <b>{t(ui.handover)}</b>
                <span>{a.handover[lang]}</span>
              </Glass>
            </div>
          )}

          {tab === "news" && (
            <div className="news">
              {news.slice(0, 3).map((n, i) => (
                <Glass className="ncard" radius={20} key={i}>
                  <div className="ncard__img">
                    <img src={`${import.meta.env.BASE_URL}obj/${n.img}`} alt="" loading="lazy" />
                  </div>
                  <div className="ncard__b">
                    <div className="ncard__h">
                      <span className="ncard__tag" data-about={n.about}>
                        {n.tag[lang]}
                      </span>
                      <span>
                        {n.date} · {n.source}
                      </span>
                    </div>
                    <h4>{n.title[lang]}</h4>
                    <p>{n.text[lang]}</p>
                    <a href={n.url} target="_blank" rel="noreferrer">
                      {t(ui.readSource)} <IcOut />
                    </a>
                  </div>
                </Glass>
              ))}
            </div>
          )}

          {tab === "deal" && (
            <div className="stack">
              {user && mine.length > 0 && (
                <Glass className="kpi" radius={20}>
                  <b>{t(ui.myContractHere)}</b>
                  {mine.map((c) => (
                    <div key={c.no} className="ctr">
                      <div className="ctr__t">
                        <span className="tnum">{c.no}</span>
                        <span className="badge">
                          <IcSeal size={13} /> {shortDate(c.opened)}
                        </span>
                      </div>
                      <div className="ctr__f">
                        <span>
                          <b>{money(c.amount)}</b>
                          <i>{t(ui.bodyShort)}</i>
                        </span>
                        <span>
                          <b className="up tnum">+{money(Math.round(accrued(c, now)))}</b>
                          <i>{t(ui.accrued)}</i>
                        </span>
                        <span>
                          <b className="tnum">{money(Math.round(contractValue(c, now)))}</b>
                          <i>{t(ui.portfolio)}</i>
                        </span>
                      </div>
                      <div className="ctr__n">{t(ui.maturity)}: {shortDate(maturity(c).toISOString())}</div>
                      <Schedule c={c} />
                    </div>
                  ))}
                </Glass>
              )}

              <Glass className="kpi" radius={20}>
                <b>{t(ui.offer)}</b>
                <div className="dl">
                  <Row k={t(ui.rate)} v={`${p.upTo ? "до " : ""}${a.rate}% ${t(ui.perYear)}`} accent />
                  <Row k={t(ui.term)} v={a.term[lang]} />
                  <Row k={t(ui.payout)} v={a.payout[lang]} />
                  <Row k={t(ui.minTicket)} v={money(a.min)} />
                  <Row k={t(ui.share)} v={`1% = ${money(Math.round(a.target / 100))}`} />
                </div>
              </Glass>

              <Calculator rate={a.rate} min={a.min} months={a.product === "rent" ? 12 : 24} />

              <div className="note note--dim">{t(ui.offerNote)}</div>

              <a className="glass prow tap" style={{ borderRadius: 20 }} href={`${COMPANY.site}/dokumenty`} target="_blank" rel="noreferrer">
                <span className="prow__i">
                  <IcDoc />
                </span>
                <span>
                  <span className="prow__n">{t(ui.documents)}</span>
                  <span className="prow__s">Договор доверительного управления · генеральное соглашение</span>
                </span>
                <IcOut />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="det__bottom" style={consultOnly ? { gridTemplateColumns: "1fr" } : undefined}>
        {!consultOnly && (
          <button className="btn btn--s" onClick={onTerminate}>
            {t(ui.terminate)}
          </button>
        )}
        {consultOnly ? (
          <a className="btn btn--p" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">
            {t(ui.contactManager)} <IcArrow size={15} />
          </a>
        ) : (
          <button className="btn btn--p" onClick={onBuy}>
            {t(ui.buy)}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/** График выплат: у «Ренты» — ближайшие три месяца, у остальных — дата расчёта. */
function Schedule({ c }: { c: Contract }) {
  const t = useT();
  const { lang } = useApp();
  const now = new Date();

  if (c.product !== "rent") {
    return (
      <div className="sched">
        <div className="sched__k">{t(ui.scheduled)}</div>
        <div className="sched__row">
          <span>{shortDate(maturity(c).toISOString())}</span>
          <b className="tnum">{money(Math.round(c.amount + termIncome(c)))}</b>
        </div>
      </div>
    );
  }

  const first = nextPayoutDate(c, now);
  return (
    <div className="sched">
      <div className="sched__k">{t(ui.scheduled)}</div>
      {[0, 1, 2].map((i) => {
        const d = new Date(first);
        d.setMonth(d.getMonth() + i);
        return (
          <div className="sched__row" key={i}>
            <span>{shortDate(d.toISOString())}</span>
            <b className="tnum">{money(Math.round(monthlyPayout(c)))}</b>
          </div>
        );
      })}
      <div className="sched__n">{lang === "ky" ? "ай сайын" : "ежемесячно"}</div>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="dl__row">
      <span>{k}</span>
      <b className={`tnum ${accent ? "brand" : ""}`}>{v}</b>
    </div>
  );
}

/** Полоса этапов строительства — как на карточке проекта esmar.kg. */
function Track({ index }: { index: number }) {
  const { lang } = useApp();
  return (
    <div className="track">
      {stages.map((s, i) => (
        <span key={i} data-on={i <= index} data-cur={i === index}>
          <i />
          <em>{s[lang]}</em>
        </span>
      ))}
    </div>
  );
}

function Calculator({ rate, min, months }: { rate: number; min: number; months: number }) {
  const t = useT();
  const [amount, setAmount] = useState(String(Math.max(min, 1000)));
  const value = Number(amount.replace(/\D/g, "")) || 0;
  const income = (value * rate * (months / 12)) / 100;

  return (
    <Glass className="kpi" radius={20}>
      <b>{t(ui.calc)}</b>

      <div className="amount amount--sm">
        <input
          value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))}
          inputMode="numeric"
          aria-label={t(ui.amount)}
          className="tnum"
        />
        <span>$</span>
      </div>

      <div className="chips" style={{ marginTop: 10 }}>
        {[500, 1000, 5000, 10_000].map((v) => (
          <button key={v} data-on={value === v} onClick={() => setAmount(String(v))} className="tnum">
            {v.toLocaleString("ru-RU")}
          </button>
        ))}
      </div>

      <div className="dl" style={{ marginTop: 12 }}>
        <Row k={t(ui.calcIncome)} v={money(Math.round(income))} accent />
        <Row k={t(ui.calcTotal)} v={money(Math.round(value + income))} />
      </div>

      <div className="kpi__f" style={{ marginTop: 8 }}>
        <span>{t(ui.calcNote)}</span>
      </div>
    </Glass>
  );
}
