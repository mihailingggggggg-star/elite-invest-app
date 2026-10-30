import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronDown,
  Coins,
  Heart,
  MapPin,
  Share2,
  Star,
  Wallet,
} from "lucide-react";
import { assetById, COMPANY, stages, ui } from "../lib/data";
import { contractValue, money, useApp, useT } from "../lib/app";

/**
 * Карточка объекта 1:1 по референсу: галерея на весь верх со счётчиком кадров,
 * круглая кнопка «назад» и поделиться/избранное, белый лист со скруглением,
 * заголовок + ставка, четыре факта с иконками, цена и кнопка, «Об объекте»
 * с раскрытием, этапы проекта чипами и нижняя панель с итогом и CTA.
 */
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
  const { lang, contracts } = useApp();
  const [full, setFull] = useState(false);
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem("esmar-favs") || "[]") as string[]).includes(id);
    } catch {
      return false;
    }
  });
  const gal = useRef<HTMLDivElement>(null);

  const now = new Date();
  const mine = contracts.filter((c) => c.assetId === a.id);
  const funded = Math.round((a.raised / a.target) * 100);
  const cur = Math.min(Math.max(a.stage - 1, 0), stages.length - 1);
  const consultOnly = a.product === "partnership";

  /**
   * На сайте у объекта одна фотография. Чтобы галерею можно было листать,
   * к ней добавляются крупные фрагменты того же кадра (разный зум и точка
   * кадрирования) — когда появятся настоящие снимки, достаточно положить их
   * в photos[] у объекта.
   */
  const slides = useMemo(() => {
    const list = a.photos?.length ? a.photos : [a.img];
    if (list.length > 1) return list.map((src) => ({ src, pos: "50% 50%", scale: 1 }));
    return [
      { src: list[0], pos: "50% 50%", scale: 1 },
      { src: list[0], pos: "32% 78%", scale: 1.6 },
      { src: list[0], pos: "72% 74%", scale: 1.95 },
    ];
  }, [a]);

  const onGalScroll = () => {
    const el = gal.current;
    if (!el) return;
    setIdx(Math.min(slides.length - 1, Math.round(el.scrollLeft / el.clientWidth)));
  };

  const share = async () => {
    const url = `${COMPANY.site}/katalog`;
    const data = { title: a.name[lang], text: `${a.name[lang]} — ESMAR`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(url);
    } catch {
      /* пользователь закрыл шит — ничего не делаем */
    }
  };

  const toggleFav = () => {
    setFav((v) => {
      const next = !v;
      try {
        const cur = JSON.parse(localStorage.getItem("esmar-favs") || "[]") as string[];
        const list = next ? [...new Set([...cur, a.id])] : cur.filter((x) => x !== a.id);
        localStorage.setItem("esmar-favs", JSON.stringify(list));
      } catch {
        /* приватный режим */
      }
      return next;
    });
  };

  return (
    <motion.div
      className="det"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.7 }}
    >
      <div className="dt__scroll">
        <div className="dt__hero">
          <div className="dt__gal" ref={gal} onScroll={onGalScroll}>
            {slides.map((s, i) => (
              <div className="dt__slide" key={i}>
                <img
                  src={`${import.meta.env.BASE_URL}obj/${s.src}`}
                  alt={`${a.name[lang]} — ${i + 1}`}
                  style={{ objectPosition: s.pos, transform: `scale(${s.scale})` }}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <div className="dt__top">
            <button className="dt__round" onClick={onBack} type="button" aria-label={t(ui.back)}>
              <ArrowLeft size={18} strokeWidth={2.2} />
            </button>
            <div className="dt__acts">
              <button className="dt__round" onClick={share} type="button" aria-label={t(ui.shareAction)}>
                <Share2 size={17} strokeWidth={2.1} />
              </button>
              <button
                className="dt__round"
                data-on={fav}
                onClick={toggleFav}
                type="button"
                aria-pressed={fav}
                aria-label={t(ui.favorite)}
              >
                <Heart size={17} strokeWidth={2.1} fill={fav ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <span className="dt__count tnum">
            {idx + 1}/{slides.length}
          </span>
        </div>

        <div className="dt__sheet">
          <div className="dt__title">
            <div>
              <h1>{a.name[lang]}</h1>
              <span className="dt__loc">
                <MapPin size={12} strokeWidth={2.4} />
                {a.city[lang]}, {a.address[lang]}
              </span>
            </div>
            <div className="dt__rate">
              <b className="tnum">
                {a.rate}% <Star size={11} strokeWidth={2.4} fill="currentColor" />
              </b>
              <span>{t(ui.perYear)}</span>
            </div>
          </div>

          <div className="dt__facts">
            <div>
              <CalendarDays size={19} strokeWidth={1.9} />
              <b>{a.term[lang]}</b>
              <span>{t(ui.term)}</span>
            </div>
            <div>
              <Wallet size={19} strokeWidth={1.9} />
              <b>{a.payout[lang]}</b>
              <span>{t(ui.payout)}</span>
            </div>
            <div>
              <Coins size={19} strokeWidth={1.9} />
              <b className="tnum">{money(a.min)}</b>
              <span>{t(ui.minShort)}</span>
            </div>
            <div>
              <Building2 size={19} strokeWidth={1.9} />
              <b className="tnum">{a.progress}%</b>
              <span>{t(ui.readiness)}</span>
            </div>
          </div>

          <div className="dt__price">
            <div>
              <span>{t(ui.minTicket)}</span>
              <b className="tnum">{money(a.min)}</b>
            </div>
            {consultOnly ? (
              <a
                className="dt__cta"
                href={`https://wa.me/${COMPANY.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                {t(ui.manager)}
              </a>
            ) : (
              <button className="dt__cta" onClick={onBuy} type="button">
                {t(ui.buy)}
              </button>
            )}
          </div>

          <h2 className="dt__h2">{t(ui.aboutProperty)}</h2>
          <p className="dt__about" data-full={full}>
            {a.about[lang]}
          </p>
          <button className="dt__more" onClick={() => setFull((v) => !v)} type="button">
            {full ? t(ui.collapse) : t(ui.readMore)}
            <ChevronDown size={14} strokeWidth={2.4} data-full={full} />
          </button>

          <h2 className="dt__h2">{t(ui.buildProgress)}</h2>
          <div className="dt__chips">
            {stages.map((s, i) => (
              <span className="dt__chip" data-on={i === cur} data-done={i < cur} key={i}>
                <b>{i + 1}</b>
                {s[lang]}
              </span>
            ))}
          </div>
          <div className="dt__chips dt__chips--info">
            <span className="dt__chip dt__chip--info">{a.handover[lang]}</span>
            <span className="dt__chip dt__chip--info tnum">
              {funded}% {t(ui.collected)}
            </span>
            <span className="dt__chip dt__chip--info tnum">{money(a.target)}</span>
          </div>

          <div className="dt__fund">
            <div className="dt__fund-h">
              <span>{t(ui.progress)}</span>
              <b className="tnum">{funded}%</b>
            </div>
            <div className="progress">
              <i style={{ width: `${Math.min(100, funded)}%` }} />
            </div>
            <div className="dt__fund-f">
              <span className="tnum">
                {money(a.raised)} / {money(a.target)}
              </span>
              <span>{a.handover[lang]}</span>
            </div>
          </div>

          <a
            className="dt__doc"
            href={`${COMPANY.site}/dokumenty`}
            target="_blank"
            rel="noreferrer"
          >
            {t(ui.documents)}
            <ArrowUpRight size={14} strokeWidth={2.2} />
          </a>

          <p className="demo">{t(ui.demoNames)}</p>
        </div>
      </div>

      <div className="dt__bar">
        <div className="dt__bar-l">
          <span>{mine.length ? t(ui.portfolio) : t(ui.minTicket)}</span>
          <b className="tnum">
            {mine.length
              ? money(Math.round(mine.reduce((s, c) => s + contractValue(c, now), 0)))
              : money(a.min)}
          </b>
        </div>
        <div className="dt__bar-r">
          {mine.length > 0 && (
            <button className="dt__ghost" onClick={onTerminate} type="button">
              {t(ui.terminate)}
            </button>
          )}
          {consultOnly ? (
            <a
              className="dt__cta dt__cta--bar"
              href={`https://wa.me/${COMPANY.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              {t(ui.manager)}
              <ArrowRight size={15} strokeWidth={2.4} />
            </a>
          ) : (
            <button className="dt__cta dt__cta--bar" onClick={onBuy} type="button">
              {t(ui.buy)}
              <ArrowRight size={15} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
