import { motion } from "framer-motion";
import { assetById, products, ui, type ProductId } from "../lib/data";
import {
  accrued,
  contractValue,
  maturity,
  money,
  monthlyPayout,
  nextPayoutDate,
  pct,
  shortDate,
  termIncome,
  useApp,
  useT,
} from "../lib/app";
import { Glass } from "../components/Glass";
import { Brand } from "../components/Brand";
import { IcLock } from "../components/Icons";

/** Гладкий путь через точки — без библиотеки графиков. */
function spark(values: number[], w = 300, h = 120) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / Math.max(1, values.length - 1)) * w,
    h - ((v - min) / span) * (h - 10) - 5,
  ]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const cx = (px + x) / 2;
    d += ` C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }
  return { d, area: `${d} L ${w} ${h} L 0 ${h} Z` };
}

export function Stats({ onKyc }: { onKyc: () => void }) {
  const t = useT();
  const { lang, user, contracts } = useApp();
  const now = new Date();

  if (!user) {
    return (
      <div className="screen">
        <Brand />
        <h1 className="h-screen">{t(ui.tabStats)}</h1>
        <div className="pad">
          <Glass className="locked" radius={26}>
            <span className="locked__i">
              <IcLock size={26} />
            </span>
            <b>{t(ui.guestLocked)}</b>
            <p>{t(ui.kycWhy)}</p>
            <button className="btn btn--p" onClick={onKyc}>
              {t(ui.guestCta)}
            </button>
          </Glass>
        </div>
        <div className="demo">{t(ui.demoNames)}</div>
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

  /* Накопленный доход по месяцам — последняя точка равна текущему начислению. */
  const series = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (11 - i));
    return contracts.reduce((s, c) => s + (new Date(c.opened) <= d ? accrued(c, d) : 0), 0);
  });

  /* Последний по сроку договор — дедлайн выплат «в конце срока». */
  const lastMaturity = contracts.length
    ? `${t(ui.maturity)}: ${shortDate(
        contracts
          .map((c) => maturity(c))
          .sort((a, b) => b.getTime() - a.getTime())[0]
          .toISOString()
      )}`
    : t(ui.zero);

  /* Ближайшая выплата по графику — только у «Ренты». */
  const nextRent = contracts
    .filter((c) => c.product === "rent")
    .map((c) => ({ c, at: nextPayoutDate(c, now) }))
    .filter((x) => x.at >= now)
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];

  const byCity = group(rows, (r) => r.a.city[lang], (r) => r.value);
  const byProduct = group(rows, (r) => products[r.c.product].name[lang], (r) => r.value);

  const { d, area } = spark(series);

  return (
    <div className="screen">
      <Brand />
      <h1 className="h-screen">{t(ui.tabStats)}</h1>

      <div className="pad stack">
        <div className="kpis">
          <Kpi label={t(ui.statValue)} value={money(Math.round(total))} />
          <Kpi label={t(ui.statProfit)} value={`+${money(Math.round(acc))}`} tone="up" />
          <Kpi label={t(ui.statYield)} value={`${avgRate.toFixed(1)}%`} />
          <Kpi label={t(ui.statObjects)} value={String(rows.length)} />
        </div>

        <Glass className="chart" radius={26}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <b style={{ fontSize: 14 }}>{t(ui.growth)}</b>
            <span style={{ fontSize: 11.5, color: "var(--txt-3)", fontWeight: 700 }}>{t(ui.months12)}</span>
          </div>
          <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={area}
              fill="url(#g)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.25 }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke="var(--brand-lit)"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--txt-3)", fontWeight: 700, marginTop: 4 }}>
            <span className="tnum">{money(0)}</span>
            <span className="tnum up">{pct((acc / (body || 1)) * 100)}</span>
            <span className="tnum">{money(Math.round(acc))}</span>
          </div>
        </Glass>

        <Glass className="kpi" radius={22}>
          <b>{nextRent ? t(ui.nextPayoutCard) : t(ui.noPayouts)}</b>
          <span className="tnum brand">
            {nextRent
              ? money(Math.round(monthlyPayout(nextRent.c)))
              : money(Math.round(rows.reduce((s, r) => s + r.c.amount + termIncome(r.c), 0)))}
          </span>
          <div style={{ fontSize: 11.5, color: "var(--txt-3)", marginTop: 4, fontWeight: 600 }}>
            {nextRent
              ? `${shortDate(nextRent.at.toISOString())} · ${assetById(nextRent.c.assetId).name[lang]}`
              : lastMaturity}
          </div>
        </Glass>
      </div>

      <h2 className="h-sec">{t(ui.byObject)}</h2>
      <div className="pad split">
        {rows
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((r) => (
            <Bar
              key={r.c.no}
              label={r.a.name[lang]}
              right={money(Math.round(r.value))}
              share={r.value / (total || 1)}
              color="linear-gradient(90deg, var(--brand), var(--brand-soft))"
            />
          ))}
      </div>

      <h2 className="h-sec">{t(ui.byProduct)}</h2>
      <div className="pad split">
        {byProduct.map(([k, v]) => (
          <Bar
            key={k}
            label={k}
            right={`${Math.round((v / (total || 1)) * 100)}%`}
            share={v / (total || 1)}
            color={productColor(k, lang)}
          />
        ))}
      </div>

      <h2 className="h-sec">{t(ui.byCity)}</h2>
      <div className="pad split">
        {byCity.map(([k, v]) => (
          <Bar
            key={k}
            label={k}
            right={`${Math.round((v / (total || 1)) * 100)}%`}
            share={v / (total || 1)}
            color="linear-gradient(90deg, #35502c, #7d9a6a)"
          />
        ))}
      </div>

      <div className="demo">{t(ui.demoNames)}</div>
    </div>
  );
}

function productColor(name: string, lang: "ru" | "ky") {
  const map: Record<ProductId, string> = {
    rent: "linear-gradient(90deg, #bb7a36, #e4d8ca)",
    development: "linear-gradient(90deg, #6f8a5e, #a9c095)",
    partnership: "linear-gradient(90deg, #8a6a3f, #cbb07e)",
  };
  const found = Object.values(products).find((p) => p.name[lang] === name);
  return map[found?.id ?? "rent"];
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <Glass className="kpi" radius={20}>
      <b>{label}</b>
      <span className={`tnum ${tone ?? ""}`}>{value}</span>
    </Glass>
  );
}

function Bar({ label, right, share, color }: { label: string; right: string; share: number; color: string }) {
  return (
    <div className="split__row">
      <div className="split__t">
        <span>{label}</span>
        <b className="tnum">{right}</b>
      </div>
      <div className="split__bar">
        <motion.i
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.round(share * 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function group<Tm>(rows: Tm[], key: (r: Tm) => string, val: (r: Tm) => number) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + val(r));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
