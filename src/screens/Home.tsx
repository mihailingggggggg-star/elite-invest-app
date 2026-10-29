import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Coins,
  FileSignature,
  MapPin,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { assets, assetById, news, products, ui, type Asset as Obj } from "../lib/data";
import { accrued, contractValue, contractsWord, money, pct, useApp, useT } from "../lib/app";
import { eventDate, feed, type Event } from "../lib/feed";
import { ActionChip, Pill, RoundBtn, SectionHead, TxRow } from "../components/kit";
import { HeroBg } from "../components/Hero";

const ICONS = {
  sign: FileSignature,
  accrual: TrendingUp,
  payout: Coins,
  topup: ArrowDownLeft,
  terminate: ArrowUpRight,
} as const;

/** Объекты в шапке: сначала те, где есть договор. */
function heroObjects(ids: string[]) {
  /* В портфеле может быть несколько договоров по одному объекту — карточка
     должна быть одна, иначе в списке появятся дубли ключей. */
  const uniq = [...new Set(ids)];
  const mine = uniq.map((id) => assets.find((a) => a.id === id)).filter(Boolean);
  const rest = assets.filter((a) => !uniq.includes(a.id));
  return [...mine, ...rest].slice(0, 6) as typeof assets;
}

/**
 * Раскрытая карточка объекта. Морфит из маленькой карточки в ленте
 * (общий layoutId) — тот же приём, что в shared-layout примерах framer-motion.
 */
function ObjectExpanded({
  a,
  onClose,
  onOpen,
  onBuy,
}: {
  a: Obj;
  onClose: () => void;
  onOpen: () => void;
  onBuy: () => void;
}) {
  const t = useT();
  const { lang, contracts } = useApp();
  const mine = contracts.filter((c) => c.assetId === a.id);
  const val = mine.reduce((s, c) => s + contractValue(c), 0);

  return (
    <div className="expand">
      <motion.div
        className="expand__veil"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />
      <motion.div
        className="expand__card"
        layoutId={`obj-${a.id}`}
        transition={{ type: "spring", stiffness: 300, damping: 33 }}
        role="dialog"
        aria-modal="true"
        aria-label={a.name[lang]}
      >
        <img className="expand__img" src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" />
        <span className="expand__shade" aria-hidden />

        <motion.div
          className="expand__in"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.24 }}
        >
          <div className="expand__top">
            <span className="expand__tag">{a.kind[lang]}</span>
            <button className="expand__x" onClick={onClose} type="button" aria-label={t(ui.close)}>
              <X size={16} strokeWidth={2.4} />
            </button>
          </div>

          <div className="expand__body">
            <div>
              <h3>{a.name[lang]}</h3>
              <p className="expand__addr">
                <MapPin size={12} strokeWidth={2.2} />
                {a.address[lang]}
              </p>
            </div>

            <div className="expand__stats">
              <div>
                <span>{t(ui.rate)}</span>
                <b className="tnum">{a.rate}%</b>
              </div>
              <div>
                <span>{t(ui.term)}</span>
                <b>{a.term[lang]}</b>
              </div>
              <div>
                <span>{t(ui.minShort)}</span>
                <b className="tnum">{money(a.min)}</b>
              </div>
            </div>

            <div>
              <div className="expand__prow">
                <span>{t(ui.readiness)}</span>
                <b className="tnum">{a.progress}%</b>
              </div>
              <div className="progress progress--light">
                <i style={{ width: `${a.progress}%` }} />
              </div>
            </div>

            {mine.length > 0 && (
              <div className="expand__mine">
                <span>{t(ui.portfolio)}</span>
                <b className="tnum">{money(Math.round(val))}</b>
              </div>
            )}

            <div className="expand__foot">
              <button className="btn btn--s btn--sm" onClick={onOpen} type="button">
                {t(ui.details)}
              </button>
              <button className="btn btn--p btn--sm" onClick={onBuy} type="button">
                {t(ui.buy)}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Home({
  onAsset,
  onStats,
  onAll,
  onKyc,
  onBrowse,
  onAllNews,
  onTopUp,
  onWithdraw,
  onBuy,
}: {
  onAsset: (id: string) => void;
  onStats: () => void;
  onAll: () => void;
  onKyc: () => void;
  onBrowse: () => void;
  onAllNews: () => void;
  onTopUp: () => void;
  onWithdraw: () => void;
  onBuy: (id: string) => void;
}) {
  const t = useT();
  const { lang, user, contracts } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const now = new Date();

  const body = contracts.reduce((s, c) => s + c.amount, 0);
  const acc = contracts.reduce((s, c) => s + accrued(c, now), 0);
  const total = body + acc;
  const diffPct = body ? (acc / body) * 100 : 0;
  const events = feed(contracts, now);
  const all = heroObjects(contracts.map((c) => c.assetId));
  const opened = open ? all.find((a) => a.id === open) : null;
  const cards = all.filter((a) => a.id !== open);

  return (
    <div className="screen screen--home">
      <section className="hero">
        <HeroBg />

        <div className="hero__in">
          <header className="hdr">
            {user ? (
              <span className="hdr__ava" aria-hidden>
                {user.name
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            ) : (
              <span className="hdr__ava hdr__ava--ghost" aria-hidden>
                <ShieldCheck size={17} strokeWidth={2} />
              </span>
            )}
            <RoundBtn icon={Bell} onClick={onAll} label={t(ui.history)} />
          </header>

          <motion.div
            className="balance"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="balance__k">{user ? t(ui.portfolio) : t(ui.guestTitle)}</span>
            <span className="balance__v tnum">
              {user ? (
                money(total, 2)
              ) : (
                <>
                  до 55<small>%</small>
                </>
              )}
            </span>
            <Pill icon={user ? ArrowUpRight : ShieldCheck}>
              {user ? `${pct(diffPct)} ${t(ui.allTime)}` : `${t(ui.license)} № 88`}
            </Pill>
          </motion.div>

          <div className="cards" role="list">
            {cards.map((a, i) => (
              <motion.button
                key={a.id}
                className="ocard"
                type="button"
                role="listitem"
                layoutId={`obj-${a.id}`}
                onClick={() => setOpen(a.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" loading="lazy" />
                <span className="ocard__shade" aria-hidden />
                <span className="ocard__t">{a.name[lang]}</span>
                <span className="ocard__m tnum">
                  <b>{a.rate}%</b> {t(ui.perYear)} · {a.term[lang]}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="actions">
            {user ? (
              <>
                <ActionChip icon={ArrowUpRight} label={t(ui.topUp)} onClick={onTopUp} />
                <ActionChip icon={ArrowLeftRight} label={t(ui.buy)} onClick={onBrowse} />
                <ActionChip icon={ArrowDownLeft} label={t(ui.withdraw)} onClick={onWithdraw} />
              </>
            ) : (
              <>
                <ActionChip icon={ShieldCheck} label={t(ui.guestCtaShort)} onClick={onKyc} />
                <ActionChip icon={ArrowLeftRight} label={t(ui.tabMarket)} onClick={onBrowse} />
                <ActionChip icon={Coins} label={t(ui.manager)} onClick={onBrowse} />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="content">
        <SectionHead title={t(ui.recent)} action={t(ui.all)} onAction={onAll} />

        <div className="txs">
          {events.slice(0, 4).map((e: Event) => (
            <TxRow
              key={e.id}
              icon={ICONS[e.kind]}
              title={e.title[lang]}
              sub={`${e.sub[lang]} · ${eventDate(e.date, lang)}`}
              amount={`${e.amount > 0 ? "+" : "−"}${money(Math.abs(e.amount))}`}
              tone={e.amount > 0 ? "up" : undefined}
              onClick={() => {
                const id = contracts.find((c) => e.id.endsWith(c.no))?.assetId;
                onAsset(id ?? all[0]?.id ?? assets[0].id);
              }}
            />
          ))}

          {events.length === 0 && (
            <div className="empty">
              <b>{t(ui.noContractsYet)}</b>
              <span>{t(ui.noContractsHint)}</span>
              <button className="btn btn--p btn--sm" onClick={onBrowse}>
                {t(ui.guestBrowse)}
              </button>
            </div>
          )}
        </div>

        {user && contracts.length > 0 && (
          <>
            <SectionHead title={t(ui.myContracts)} action={contractsWord(contracts.length, lang)} />
            <div className="rows">
              {contracts.slice(0, 4).map((c, i) => {
                const a = assetById(c.assetId);
                const val = contractValue(c, now);
                const d = ((val - c.amount) / c.amount) * 100;
                return (
                  <motion.button
                    key={c.no}
                    className="hold"
                    onClick={() => onAsset(a.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                    type="button"
                  >
                    <img className="hold__img" src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" />
                    <span className="hold__b">
                      <span className="hold__n">{a.name[lang]}</span>
                      <span className="hold__s">
                        {products[c.product].name[lang]} · {c.rate}%
                      </span>
                    </span>
                    <span className="hold__r">
                      <b className="tnum">{money(Math.round(val))}</b>
                      <i className={`tnum ${d < 0 ? "down" : "up"}`}>{pct(d)}</i>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <button className="linkall" onClick={onStats} type="button">
              {t(ui.analytics)}
            </button>
          </>
        )}

        <SectionHead title={t(ui.newsTitle)} action={t(ui.allNews)} onAction={onAllNews} />
        <div className="news">
          {news.slice(0, 2).map((n, i) => (
            <article className="ncard" key={i}>
              <div className="ncard__img">
                <img src={`${import.meta.env.BASE_URL}obj/${n.img}`} alt="" loading="lazy" />
              </div>
              <div className="ncard__b">
                <div className="ncard__h">
                  <span className="ncard__tag" data-about={n.about}>
                    {n.tag[lang]}
                  </span>
                  <span>{n.date}</span>
                </div>
                <h4>{n.title[lang]}</h4>
              </div>
            </article>
          ))}
        </div>

        <p className="disclaimer">{t(ui.demoNames)}</p>
      </section>

      {createPortal(
        <AnimatePresence>
          {opened && (
            <ObjectExpanded
              key={opened.id}
              a={opened}
              onClose={() => setOpen(null)}
              onOpen={() => {
                setOpen(null);
                onAsset(opened.id);
              }}
              onBuy={() => {
                setOpen(null);
                onBuy(opened.id);
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
