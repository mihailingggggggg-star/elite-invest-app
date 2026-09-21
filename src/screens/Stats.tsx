import { motion } from "framer-motion";
import { assetById, assets, cash, equityCurve, holdings, ui } from "../lib/data";
import { money, pct, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { Brand } from "../components/Brand";

/** Smooth path through the equity points — no chart library needed. */
function spark(values: number[], w = 300, h = 120) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
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

export function Stats() {
  const t = useT();
  const { lang } = useApp();

  const rows = holdings.map((h) => {
    const a = assetById(h.id);
    return { a, units: h.units, value: h.units * a.price, spent: h.units * h.avg };
  });

  const invested = rows.reduce((s, r) => s + r.value, 0);
  const spent = rows.reduce((s, r) => s + r.spent, 0);
  const total = invested + cash;
  const profit = invested - spent;
  const wYield = rows.reduce((s, r) => s + r.a.yieldPct * r.value, 0) / (invested || 1);

  /* The fund's own internal marketplace sets the reference price. */
  const avgMarket =
    assets.reduce((s, a) => s + a.price, 0) / assets.length;

  const byCity = group(rows, (r) => r.a.city[lang]);
  const byStage = group(rows, (r) =>
    r.a.progress >= 70 ? stageLabel(lang, 2) : r.a.progress >= 40 ? stageLabel(lang, 1) : stageLabel(lang, 0)
  );

  const { d, area } = spark(equityCurve);

  return (
    <div className="screen">
      <Brand />
      <h1 className="h-screen">{t(ui.tabStats)}</h1>

      <div className="pad stack">
        <div className="kpis">
          <Kpi label={t(ui.statValue)} value={money(Math.round(total))} />
          <Kpi label={t(ui.statProfit)} value={`${profit > 0 ? "+" : ""}${money(Math.round(profit))}`} tone={profit >= 0 ? "up" : "down"} />
          <Kpi label={t(ui.statYield)} value={`${wYield.toFixed(1)}%`} />
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
            <span className="tnum">{money(equityCurve[0])}</span>
            <span className="tnum up">{pct(((equityCurve.at(-1)! - equityCurve[0]) / equityCurve[0]) * 100)}</span>
            <span className="tnum">{money(equityCurve.at(-1)!)}</span>
          </div>
        </Glass>

        <Glass className="kpi" radius={22}>
          <b>{t(ui.avgMarket)}</b>
          <span className="tnum">{money(Math.round(avgMarket))}</span>
          <div style={{ fontSize: 11.5, color: "var(--txt-3)", marginTop: 4, fontWeight: 600 }}>
            {lang === "ky"
              ? "Катышуучулар ортосундагы бардык объекттер боюнча орточо пай баасы"
              : "Средняя цена пая по всем объектам между участниками"}
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
              key={r.a.id}
              label={r.a.name[lang]}
              right={money(Math.round(r.value))}
              share={r.value / invested}
              color="linear-gradient(90deg, var(--brand), var(--brand-soft))"
            />
          ))}
      </div>

      <h2 className="h-sec">{t(ui.byCity)}</h2>
      <div className="pad split">
        {byCity.map(([k, v]) => (
          <Bar key={k} label={k} right={`${Math.round((v / invested) * 100)}%`} share={v / invested} color="linear-gradient(90deg, #6052dc, #a79bff)" />
        ))}
      </div>

      <h2 className="h-sec">{t(ui.byStage)}</h2>
      <div className="pad split">
        {byStage.map(([k, v]) => (
          <Bar key={k} label={k} right={`${Math.round((v / invested) * 100)}%`} share={v / invested} color="linear-gradient(90deg, #22c55e, #86efac)" />
        ))}
      </div>

      <div className="demo">{t(ui.demoNumbers)}</div>
    </div>
  );
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

function group<Tm>(rows: Tm[], key: (r: Tm) => string) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = (r as unknown as { value: number }).value;
    m.set(key(r), (m.get(key(r)) ?? 0) + v);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function stageLabel(lang: "ky" | "ru", i: number) {
  const ky = ["Эрте баскыч", "Курулуш жүрүүдө", "Тапшырууга жакын"];
  const ru = ["Ранняя стадия", "Идёт стройка", "Близко к сдаче"];
  return (lang === "ky" ? ky : ru)[i];
}
