import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, ReferenceDot } from "recharts";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { money, pct, useApp } from "../lib/app";

/* Готовые библиотеки: recharts для кривой, @nivo/circle-packing для пузырей.
   Ни одного нарисованного вручную пути — только конфигурация компонентов. */

export type Point = { label: string; value: number };

/** Кривая начислений — карточка со спарклайном в референсе. */
export function AccrualChart({ data, height = 132 }: { data: Point[]; height?: number }) {
  const { lang } = useApp();
  /* карточка всегда градиентная — линия и подписи всегда светлые */
  const line = "#ffffff";
  const last = data[data.length - 1];
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);

  return (
    <div className="chartbox" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 14, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.34} />
              <stop offset="70%" stopColor={line} stopOpacity={0.05} />
              <stop offset="100%" stopColor={line} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={26}
            tick={{ fill: "var(--on-grad-2)", fontSize: 10, fontWeight: 600 }}
            dy={6}
          />

          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="tip">
                  <b className="tnum">{money(Math.round(p.value))}</b>
                  <span>
                    {lang === "ky" ? "мезгил ичинде" : "за период"} · {p.label}
                  </span>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={line}
            strokeWidth={2}
            strokeLinecap="round"
            fill="url(#areaFill)"
            dot={false}
            activeDot={{ r: 4, fill: line, stroke: "rgba(255,255,255,.45)", strokeWidth: 4 }}
            isAnimationActive
            animationDuration={900}
          />

          {last && last.value > 0 && (
            <ReferenceDot
              x={peak.label}
              y={peak.value}
              r={3.5}
              fill={line}
              stroke="rgba(255,255,255,.35)"
              strokeWidth={4}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type Bubble = { name: string; value: number };

/* пузыри живут на градиентной карточке — полупрозрачные светлые круги */
const PALETTE = [
  "rgba(255,255,255,0.92)",
  "rgba(255,255,255,0.62)",
  "rgba(255,255,255,0.42)",
  "rgba(255,255,255,0.28)",
  "rgba(255,255,255,0.2)",
  "rgba(255,255,255,0.14)",
];

/** Пузырьковая диаграмма долей — карточка справа снизу в референсе. */
export function ShareBubbles({ data, height = 250 }: { data: Bubble[]; height?: number }) {
  /* на светлых пузырях подпись тёмная, на прозрачных — белая */
  const labelFor = (id: unknown) => {
    const i = data.findIndex((d) => d.name === id);
    return i >= 0 && i < 2 ? "#2A1F10" : "#FFFFFF";
  };
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colorOf = (name: string) => {
    const i = data.findIndex((d) => d.name === name);
    return PALETTE[(i < 0 ? 0 : i) % PALETTE.length];
  };

  return (
    <div>
      <div style={{ height }}>
        <ResponsiveCirclePacking
          data={{ name: "", children: data }}
          id="name"
          value="value"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          colors={(node) => (node.depth === 0 ? "transparent" : colorOf(String(node.id)))}
          padding={7}
          borderWidth={0}
          labelsSkipRadius={34}
          labelTextColor={(node) => labelFor(node.id)}
          enableLabels
          animate
          motionConfig="gentle"
          tooltip={({ id, value }) => (
            <div className="tip tip--dark">
              <b>{id}</b>
              <span className="tnum">
                {money(Math.round(Number(value)))} · {pct((Number(value) / total) * 100, false)}
              </span>
            </div>
          )}
          theme={{ text: { fontSize: 10, fontWeight: 700 } }}
        />
      </div>

      <div className="legend">
        {data.map((d, i) => (
          <span className="legend__i" key={d.name}>
            <i style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.name}
            <b className="tnum">{Math.round((d.value / total) * 100)}%</b>
          </span>
        ))}
      </div>
    </div>
  );
}
