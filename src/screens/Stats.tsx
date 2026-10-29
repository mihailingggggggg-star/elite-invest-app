import { ArrowUpRight, CalendarDays, Lock } from "lucide-react";
import { assetById, products, ui } from "../lib/data";
import {
  accrued,
  contractValue,
  money,
  pct,
  shortDate,
  termIncome,
  useApp,
  useT,
} from "../lib/app";
import { lastMaturity } from "../lib/feed";
import { AccrualChart, ShareBubbles } from "../components/charts";
import { Glass } from "../components/Glass";
import { Pill, RoundBtn, SectionHead } from "../components/kit";

export function Stats({ onKyc }: { onKyc: () => void }) {
  const t = useT();
  const { lang, user, contracts } = useApp();
  const now = new Date();

  if (!user) {
    return (
      <div className="screen">
        <header className="hdr hdr--plain">
          <span className="hdr__title">{t(ui.tabStats)}</span>
        </header>
        <div className="pad">
          <Glass className="empty" radius={26}>
            <span className="empty__i">
              <Lock size={22} strokeWidth={2} />
            </span>
            <b>{t(ui.guestLocked)}</b>
            <span>{t(ui.kycWhy)}</span>
            <button className="btn btn--p btn--sm" onClick={onKyc}>
              {t(ui.guestCta)}
            </button>
          </Glass>
        </div>
      </div>
    );
  }

  const rows = contracts.map((c) => {
    const a = assetById(c.assetId);
    return { a, c, value: contractValue(c, now), accrued: accrued(c, now) };
  });

  const body = rows.reduce((s, r) => s + r.c.amount, 0);
  const acc = rows.reduce((s, r) => s + r.accrued, 0);
  const total = body + acc;
  const avgRate = rows.reduce((s, r) => s + r.c.rate * r.c.amount, 0) / (body || 1);
  const end = lastMaturity(contracts);

  /* Накопленный доход по месяцам — последняя точка равна текущему начислению. */
  const series = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (11 - i));
    const v = contracts.reduce((s, c) => s + (new Date(c.opened) <= d ? accrued(c, d) : 0), 0);
    return {
      label: d.toLocaleDateString(lang === "ky" ? "ru-RU" : "ru-RU", { month: "short" }).replace(".", ""),
      value: Math.round(v),
    };
  });

  const byObject = rows
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((r) => ({ name: r.a.name[lang], value: Math.round(r.value) }));

  const byProduct = group(rows, (r) => products[r.c.product].name[lang], (r) => r.value);
  const byCity = group(rows, (r) => r.a.city[lang], (r) => r.value);

  return (
    <div className="screen">
      <header className="hdr hdr--plain">
        <span className="hdr__title">{t(ui.tabStats)}</span>
        <RoundBtn icon={CalendarDays} onClick={() => {}} label={t(ui.months12)} />
      </header>

      <Glass className="statcard" radius={28}>
        <div className="statcard__h">
          <Pill icon={ArrowUpRight}>
            {pct((acc / (body || 1)) * 100)} {t(ui.allTime)}
          </Pill>
        </div>
        <span className="statcard__v tnum">{money(total, 2)}</span>
        <AccrualChart data={series} />
      </Glass>

      <div className="tiles">
        <Tile k={t(ui.statProfit)} v={`+${money(Math.round(acc))}`} tone="up" />
        <Tile k={t(ui.statYield)} v={`${avgRate.toFixed(1)}%`} />
        <Tile k={t(ui.statObjects)} v={String(rows.length)} />
      </div>

      <SectionHead title={t(ui.byObject)} />
      <Glass className="bubcard" radius={28}>
        <ShareBubbles data={byObject} />
      </Glass>

      <Glass className="cardlist" radius={26}>
        <div className="cardlist__h">
          <b>{t(ui.byProduct)}</b>
          <span>{t(ui.rate)}</span>
        </div>
        {byProduct.map(([k, v], i) => (
          <div className="brow" key={k}>
            <span className="brow__n">{k}</span>
            <span className="brow__bar">
              <i style={{ width: `${Math.round((v / (total || 1)) * 100)}%`, opacity: 1 - i * 0.16 }} />
            </span>
            <b className="tnum">{Math.round((v / (total || 1)) * 100)}%</b>
          </div>
        ))}
      </Glass>

      <Glass className="cardlist" radius={26}>
        <div className="cardlist__h">
          <b>{t(ui.byCity)}</b>
          <span>{t(ui.portfolio)}</span>
        </div>
        {byCity.map(([k, v], i) => (
          <div className="brow" key={k}>
            <span className="brow__n">{k}</span>
            <span className="brow__bar">
              <i style={{ width: `${Math.round((v / (total || 1)) * 100)}%`, opacity: 1 - i * 0.16 }} />
            </span>
            <b className="tnum">{Math.round((v / (total || 1)) * 100)}%</b>
          </div>
        ))}
      </Glass>

      {end && (
        <Glass className="cardlist" radius={26}>
          <div className="cardlist__h">
            <b>{t(ui.noPayouts)}</b>
            <span>{shortDate(end.toISOString())}</span>
          </div>
          <div className="brow">
            <span className="brow__n">{t(ui.calcTotal)}</span>
            <b className="tnum brand">
              {money(Math.round(rows.reduce((s, r) => s + r.c.amount + termIncome(r.c), 0)))}
            </b>
          </div>
        </Glass>
      )}

      <p className="disclaimer">{t(ui.demoNames)}</p>
    </div>
  );
}

function Tile({ k, v, tone }: { k: string; v: string; tone?: "up" }) {
  return (
    <div className="tile">
      <span>{k}</span>
      <b className={`tnum ${tone ?? ""}`}>{v}</b>
    </div>
  );
}

function group<Tm>(rows: Tm[], key: (r: Tm) => string, val: (r: Tm) => number) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + val(r));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
