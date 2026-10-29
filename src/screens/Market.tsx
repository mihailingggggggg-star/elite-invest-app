import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { assets, products, ui, type ProductId } from "../lib/data";
import { useApp, useT } from "../lib/app";

type Filter = "all" | ProductId;

/**
 * Каталог 1:1 по референсу: крупный двухстрочный заголовок, круглая кнопка
 * профиля справа, поиск с иконкой фильтра, ряд чипов-категорий, заголовок
 * секции и сетка фото-карточек 2×N с ценой, прогрессом, названием и адресом.
 * Иконки — lucide-react, анимации появления — framer-motion.
 */
export function Market({
  onAsset,
  onProfile,
}: {
  onAsset: (id: string) => void;
  onProfile: () => void;
}) {
  const t = useT();
  const { lang, user } = useApp();
  const [mode, setMode] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return assets
      .filter((a) => mode === "all" || a.product === mode || a.extra?.includes(mode))
      .filter((a) => !openOnly || a.raised / a.target < 0.95)
      .filter(
        (a) =>
          !term ||
          a.name[lang].toLowerCase().includes(term) ||
          a.address[lang].toLowerCase().includes(term) ||
          a.city[lang].toLowerCase().includes(term) ||
          a.kind[lang].toLowerCase().includes(term) ||
          products[a.product].name[lang].toLowerCase().includes(term)
      )
      /* Сначала объекты, где финансирование ещё открыто. */
      .sort((a, b) => a.raised / a.target - b.raised / b.target);
  }, [mode, q, openOnly, lang]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t(ui.all) },
    ...Object.values(products).map((p) => ({ id: p.id as Filter, label: p.name[lang] })),
  ];

  const initials = user
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div className="screen">
      <header className="cat__top">
        <h1 className="cat__title">
          {t(ui.catTitle1)}
          <br />
          {t(ui.catTitle2)}
        </h1>
        <button className="cat__ava" onClick={onProfile} type="button" aria-label={t(ui.tabProfile)}>
          {user ? initials : <ShieldCheck size={19} strokeWidth={2} />}
        </button>
      </header>

      <div className="cat__search">
        <Search size={19} strokeWidth={2} aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(ui.searchShort)}
          inputMode="search"
          aria-label={t(ui.search)}
        />
        <button
          className="cat__filter"
          type="button"
          data-on={openOnly}
          onClick={() => setOpenOnly((v) => !v)}
          aria-pressed={openOnly}
          aria-label={t(ui.catOpenOnly)}
        >
          <SlidersHorizontal size={17} strokeWidth={2} />
        </button>
      </div>

      <div className="pills pills--cat">
        {filters.map((f) => (
          <button key={f.id} className="pill" data-on={mode === f.id} onClick={() => setMode(f.id)} type="button">
            {f.label}
          </button>
        ))}
      </div>

      <div className="cat__head">
        <h2>{t(ui.catNearby)}</h2>
        <span className="cat__count tnum">{list.length}</span>
      </div>

      <div className="cat__grid">
        {list.map((a, i) => (
          <motion.button
            key={a.id}
            className="pcard"
            type="button"
            onClick={() => onAsset(a.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={`${import.meta.env.BASE_URL}obj/${a.img}`} alt="" loading="lazy" />
            <span className="pcard__shade" aria-hidden />

            <span className="pcard__check" aria-label={t(ui.verified)}>
              <Check size={12} strokeWidth={3.2} />
            </span>

            <span className="pcard__price tnum">
              {a.rate}% <i>{t(ui.perYear)}</i>
            </span>

            <span className="pcard__fund tnum">
              <TrendingUp size={11} strokeWidth={2.6} />
              {Math.round((a.raised / a.target) * 100)}%
            </span>

            <span className="pcard__n">{a.name[lang]}</span>
            <span className="pcard__loc">
              <MapPin size={11} strokeWidth={2.4} />
              {a.city[lang]} · {a.term[lang]}
            </span>
          </motion.button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="cat__empty">
          <b>{t(ui.tabMarket)}</b>
          <span>{t(ui.zero)}</span>
        </div>
      )}

      <div className="demo">{t(ui.demoNames)}</div>
    </div>
  );
}

/** Строка-ссылка «Перейти в каталог» — используется на главной и в профиле. */
export function CatalogLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="linkbtn" onClick={onClick} type="button">
      {children}
    </button>
  );
}
