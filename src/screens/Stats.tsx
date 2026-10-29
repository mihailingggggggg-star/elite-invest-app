import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Lock,
  Sprout,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { assetById, products, ui } from "../lib/data";
import { accrued, contractValue, money, pct, useApp, useT } from "../lib/app";
import { Seg } from "../components/Seg";

/**
 * Аналитика 1:1 по референсу: заголовок с круглыми кнопками, сегменты,
 * пончик со значением в центре, легенда в две колонки, карточка-инсайт
 * и столбчатый тренд. Диаграммы — recharts (Pie/PieChart с paddingAngle
 * и cornerRadius, BarChart со скруглёнными барами), анимации — framer-motion.
 */

type Group = "product" | "city" | "object";

/* Палитра пончика: хвоя → шалфей → крем, в духе бренда. */
const PALETTE = ["#2b3a1e", "#4a663a", "#6f8f55", "#96b177", "#c1d2a9", "#e0d2b8"];

function parts(rows: { name: string; value: number }[], other: string) {
  const merged = new Map<string, number>();
  for (const r of rows) merged.set(r.name, (merged.get(r.name) ?? 0) + r.value);
  const sorted = [...merged.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
  if (sorted.length <= 6) return sorted;
  const head = sorted.slice(0, 5);
  const tail = sorted.slice(5).reduce((s, r) => s + r.value, 0);
  return [...head, { name: other, value: Math.round(tail) }];
}

export function Stats({ onKyc, onBack }: { onKyc: () => void; onBack: () => void }) {
  const t = useT();
  const { lang, user, contracts } = useApp();
  const [group, setGroup] = useState<Group>("object");
  const [months, setMonths] = useState(12);
  const now = new Date();

  const rows = useMemo(
    () =>
      contracts.map((c) => {
        const a = assetById(c.assetId);
        return {
          a,
          c,
          value: contractValue(c, now),
          acc: accrued(c, now),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contracts]
  );

  const body = rows.reduce((s, r) => s + r.c.amount, 0);
  const acc = rows.reduce((s, r) => s + r.acc, 0);
  const total = body + acc;
  const avgRate = rows.reduce((s, r) => s + r.c.rate * r.c.amount, 0) / (body || 1);
  const monthly = rows.reduce((s, r) => s + (r.c.amount * r.c.rate) / 100 / 12, 0);

  const data = useMemo(() => {
    if (group === "product")
      return parts(
        rows.map((r) => ({ name: products[r.c.product].name[lang], value: r.value })),
        t(ui.anOther)
      );
    if (group === "city")
      return parts(
        rows.map((r) => ({ name: r.a.city[lang], value: r.value })),
        t(ui.anOther)
      );
    return parts(
      rows.map((r) => ({ name: r.a.name[lang], value: r.value })),
      t(ui.anOther)
    );
  }, [group, rows, lang, t]);

  /* Накопленное начисление по месяцам — кривая роста портфеля. */
  const series = useMemo(
    () =>
      Array.from({ length: months }, (_, i) => {
        /* первое число месяца: иначе 31-е «перепрыгивает» через короткий февраль */
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
        const v = contracts.reduce((s, c) => s + (new Date(c.opened) <= d ? accrued(c, d) : 0), 0);
        return {
          /* три буквы, иначе 12 подписей не влезают в мобильный график */
          label: d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "").slice(0, 3),
          value: Math.round(v),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contracts, months]
  );

  const peak = Math.max(...series.map((s) => s.value), 1);



  if (!user) {
    return (
      <div className="screen">
        <header className="an__top">
          <button className="an__round" onClick={onBack} type="button" aria-label={t(ui.back)}>
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>
          <span className="an__title">{t(ui.tabStats)}</span>
          <span />
        </header>
        <div className="pad" style={{ marginTop: 16 }}>
          <div className="cat__empty">
            <Lock size={22} strokeWidth={2} />
            <b>{t(ui.guestLocked)}</b>
            <span>{t(ui.kycWhy)}</span>
            <button className="btn btn--p btn--sm" onClick={onKyc} type="button" style={{ marginTop: 6 }}>
              {t(ui.guestCta)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="an__top">
        <button className="an__round" onClick={onBack} type="button" aria-label={t(ui.back)}>
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <span className="an__title">{t(ui.tabStats)}</span>
        <button
          className="an__round"
          onClick={() => setMonths((m) => (m === 12 ? 6 : 12))}
          type="button"
          aria-label={t(ui.anDynamics)}
        >
          <CalendarDays size={17} strokeWidth={2} />
        </button>
      </header>

      <div className="an__seg">
        <Seg
          value={group}
          name="an-group"
          wide
          onChange={setGroup}
          options={[
            { v: "object" as Group, label: t(ui.anByObject) },
            { v: "product" as Group, label: t(ui.anByProduct) },
            { v: "city" as Group, label: t(ui.anByCity) },
          ]}
        />
      </div>

      <div className="an__head">
        <h2>{t(ui.anStructure)}</h2>
        <button
          className="an__period"
          type="button"
          onClick={() => setMonths((m) => (m === 12 ? 6 : 12))}
        >
          {months === 12 ? t(ui.months12) : t(ui.months6)}
          <ChevronDown size={13} strokeWidth={2.4} />
        </button>
      </div>

      <div className="an__donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="63%"
              outerRadius="94%"
              paddingAngle={3}
              cornerRadius={7}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive
              animationDuration={700}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="an__center">
          <b className="tnum">{money(Math.round(total))}</b>
          <span>{t(ui.anInPortfolio)}</span>
        </div>
      </div>

      <div className="an__legend">
        {data.map((d, i) => (
          <div className="an__leg" key={d.name}>
            <span className="an__dot" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="an__leg-n">{d.name}</span>
            <b className="tnum">{total ? Math.round((d.value / total) * 100) : 0}%</b>
          </div>
        ))}
      </div>

      <motion.div
        className="an__insight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <span className="an__insight-i">
          <Sprout size={19} strokeWidth={2} />
        </span>
        <div>
          <b>
            {money(Math.round(monthly))} {t(ui.anPerMonth)}
          </b>
          <p>
            {avgRate.toFixed(1)}% {t(ui.perYear)} · {t(ui.anInsight)}
          </p>
        </div>
        <ChevronRight size={17} strokeWidth={2.2} />
      </motion.div>

      <div className="an__head">
        <h2>{t(ui.anDynamics)}</h2>
        <span className="an__period tnum">{pct(body ? (acc / body) * 100 : 0)}</span>
      </div>

      <div className="an__bars">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 26, right: 4, bottom: 0, left: 4 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10.5, fill: "var(--on-3)" }}
              interval={0}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} maxBarSize={26} isAnimationActive>
              {series.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === series.length - 1 ? "var(--bar-on)" : "var(--bar-idle)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <span
          className="an__tip tnum"
          style={{
            left: `${((series.length - 0.5) / series.length) * 100}%`,
            bottom: `calc(${((series[series.length - 1].value / peak) * 0.66) * 100}% + 30px)`,
          }}
        >
          {money(series[series.length - 1].value)}
        </span>
      </div>

      <p className="demo">{t(ui.demoNames)}</p>
    </div>
  );
}
