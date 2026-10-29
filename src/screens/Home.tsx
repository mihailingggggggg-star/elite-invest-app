import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Coins,
  FileSignature,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { assetById, news, products, ui } from "../lib/data";
import { accrued, contractValue, contractsWord, money, pct, shortDate, useApp, useT, maturity } from "../lib/app";
import { eventDate, feed, type Event } from "../lib/feed";
import { AccountCard, ActionChip, Pill, RoundBtn, SectionHead, TxRow } from "../components/kit";
import { Glass } from "../components/Glass";

const ICONS = {
  sign: FileSignature,
  accrual: TrendingUp,
  payout: Coins,
  topup: ArrowDownLeft,
  terminate: ArrowUpRight,
} as const;

/** Последние 4 цифры номера личного счёта — стабильны для пользователя. */
const accountTail = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9000;
  return String(1000 + h).slice(-4);
};

export function Home({
  onAsset,
  onStats,
  onAll,
  onKyc,
  onBrowse,
  onAllNews,
  onTopUp,
  onWithdraw,
}: {
  onAsset: (id: string) => void;
  onStats: () => void;
  onAll: () => void;
  onKyc: () => void;
  onBrowse: () => void;
  onAllNews: () => void;
  onTopUp: () => void;
  onWithdraw: () => void;
}) {
  const t = useT();
  const { lang, user, contracts } = useApp();
  const now = new Date();

  const body = contracts.reduce((s, c) => s + c.amount, 0);
  const acc = contracts.reduce((s, c) => s + accrued(c, now), 0);
  const total = body + acc;
  const diffPct = body ? (acc / body) * 100 : 0;
  const events = feed(contracts, now);

  return (
    <div className="screen screen--home">
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

      {user ? (
        <>
          <motion.div
            className="balance"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="balance__k">{t(ui.portfolio)}</span>
            <span className="balance__v tnum">{money(total, 2)}</span>
            {body > 0 && (
              <Pill icon={ArrowUpRight}>
                {pct(diffPct)} {t(ui.allTime)}
              </Pill>
            )}
          </motion.div>

          <AccountCard
            holder={t(ui.personal)}
            brand="ESMAR"
            number={accountTail(user.email)}
            exp={`12/${String(now.getFullYear() + 3).slice(2)}`}
          />

          <div className="actions">
            <ActionChip icon={ArrowUpRight} label={t(ui.topUp)} onClick={onTopUp} />
            <ActionChip icon={ArrowLeftRight} label={t(ui.buy)} onClick={onBrowse} />
            <ActionChip icon={ArrowDownLeft} label={t(ui.withdraw)} onClick={onWithdraw} />
          </div>

          <SectionHead title={t(ui.recent)} action={t(ui.all)} onAction={onAll} />

          <div className="txs">
            {events.slice(0, 3).map((e: Event) => (
              <TxRow
                key={e.id}
                icon={ICONS[e.kind]}
                title={e.title[lang]}
                sub={`${e.sub[lang]} · ${eventDate(e.date, lang)}`}
                amount={`${e.amount > 0 ? "+" : "−"}${money(Math.abs(e.amount))}`}
                tone={e.amount > 0 ? "up" : undefined}
                onClick={() => onAsset(contracts.find((c) => e.id.endsWith(c.no))?.assetId ?? contracts[0]?.assetId ?? "")}
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
                      {products[c.product].name[lang]} · {c.rate}% · {shortDate(maturity(c).toISOString())}
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
      ) : (
        <>
          <motion.div
            className="balance"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="balance__k">{t(ui.guestTitle)}</span>
            <span className="balance__v tnum">
              до 55<small>%</small>
            </span>
            <Pill icon={ShieldCheck}>
              {t(ui.license)} № 88 · {lang === "ky" ? "нотариалдык күбөлөндүрүү" : "нотариальное заверение"}
            </Pill>
          </motion.div>

          <Glass className="guestcard" radius={26}>
            <p>{t(ui.guestText)}</p>
            <div className="guestcard__b">
              <button className="btn btn--p" onClick={onKyc}>
                {t(ui.guestCta)}
              </button>
              <button className="btn btn--s" onClick={onBrowse}>
                {t(ui.guestBrowse)}
              </button>
            </div>
          </Glass>

          <SectionHead title={t(ui.tabMarket)} action={t(ui.all)} onAction={onBrowse} />
          <div className="rows">
            {Object.values(products).map((p) => (
              <button className="hold" key={p.id} onClick={onBrowse} type="button">
                <span className="hold__ico">
                  <TrendingUp size={17} strokeWidth={2} />
                </span>
                <span className="hold__b">
                  <span className="hold__n">{p.name[lang]}</span>
                  <span className="hold__s">
                    {t(ui.term)}: {p.term[lang]} · {p.payout[lang]}
                  </span>
                </span>
                <span className="hold__r">
                  <b className="tnum brand">
                    {p.upTo ? "до " : ""}
                    {p.rate}%
                  </b>
                  <i>{t(ui.perYear)}</i>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <SectionHead title={t(ui.newsTitle)} action={t(ui.allNews)} onAction={onAllNews} />
      <div className="news">
        {news.slice(0, 2).map((n, i) => (
          <Glass className="ncard" radius={24} key={i}>
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
          </Glass>
        ))}
      </div>

      <p className="disclaimer">{t(ui.demoNames)}</p>
    </div>
  );
}
