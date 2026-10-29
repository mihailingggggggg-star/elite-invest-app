import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { assets, products, ui, type Asset, type ProductId } from "../lib/data";
import { money, useApp, useT } from "../lib/app";
import { Glass } from "../components/Glass";
import { IcArrow, IcPin, IcSearch, IcClock } from "../components/Icons";
import { Brand } from "../components/Brand";

type Filter = "all" | ProductId;

export function Market({ onAsset }: { onAsset: (id: string) => void }) {
  const t = useT();
  const { lang } = useApp();
  const [mode, setMode] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return assets
      .filter((a) => mode === "all" || a.product === mode || a.extra?.includes(mode))
      .filter(
        (a) =>
          !term ||
          a.name[lang].toLowerCase().includes(term) ||
          a.address[lang].toLowerCase().includes(term) ||
          a.kind[lang].toLowerCase().includes(term) ||
          products[a.product].name[lang].toLowerCase().includes(term)
      )
      /* Сначала объекты, где финансирование ещё открыто. */
      .sort((a, b) => a.raised / a.target - b.raised / b.target);
  }, [mode, q, lang]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t(ui.all) },
    ...Object.values(products).map((p) => ({ id: p.id as Filter, label: p.name[lang] })),
  ];

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
        {filters.map((f) => (
          <button key={f.id} className="pill" data-on={mode === f.id} onClick={() => setMode(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="pad stack" style={{ marginTop: 12 }}>
        {list.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card a={a} onClick={() => onAsset(a.id)} />
          </motion.div>
        ))}

        {list.length === 0 && (
          <Glass className="kpi" radius={20}>
            <b>{t(ui.tabMarket)}</b>
            <span style={{ fontSize: 15 }}>{t(ui.zero)}</span>
          </Glass>
        )}
      </div>

      <div className="demo">{t(ui.demoNames)}</div>
    </div>
  );
}

function Card({ a, onClick }: { a: Asset; onClick: () => void }) {
  const t = useT();
  const { lang } = useApp();
  const p = products[a.product];
  const funded = Math.round((a.raised / a.target) * 100);

  return (
    <Glass className="mcard tap" radius={26} as="div" onClick={onClick}>
      <div className="mcard__img">
        <img src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" loading="lazy" />
        <div className="mcard__tags">
          <span className="tag tag--y">
            <b>{p.upTo ? "до " : ""}{a.rate}%</b> {t(ui.perYear)}
          </span>
          <span className="tag">{p.name[lang]}</span>
        </div>
      </div>

      <div className="mcard__b">
        <div className="mcard__t">
          <div>
            <div className="mcard__n">{a.name[lang]}</div>
            <div className="mcard__meta mcard__meta--row">
              <IcPin size={13} /> {a.address[lang]}
            </div>
          </div>
          {a.area !== "—" && <span className="mcard__area tnum">{a.area}</span>}
        </div>

        <div className="progress">
          <motion.i
            initial={{ width: 0 }}
            whileInView={{ width: `${funded}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="mcard__f">
          <span>
            {money(a.raised)} / {money(a.target)} {t(ui.collected)}
          </span>
          <span className="mcard__hand">
            <IcClock size={13} /> {a.handover[lang]}
          </span>
        </div>
      </div>
    </Glass>
  );
}

/** Строка-ссылка «Перейти в каталог» — используется на главной и в профиле. */
export function CatalogLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="linkbtn" onClick={onClick}>
      {children} <IcArrow size={14} />
    </button>
  );
}
