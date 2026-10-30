import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { assetById, products, ui, type Contract } from "../lib/data";
import { contractValue, money, monthlyPayout, pct, useApp, useT } from "../lib/app";

/**
 * Слайдер договоров. Карусель — embla-carousel-react
 * (github.com/davidjerleke/embla-carousel, MIT): та же библиотека, на которой
 * построен Carousel из shadcn/ui. Эффект «глубины» — готовый рецепт из
 * документации embla (Scale): соседние карточки чуть уменьшены и притушены,
 * активная — в полный размер. Никакой собственной физики скролла.
 */
export function ContractsRail({
  contracts,
  onOpen,
  onAnalytics,
}: {
  contracts: Contract[];
  onOpen: (id: string) => void;
  onAnalytics: () => void;
}) {
  const t = useT();
  const { lang } = useApp();
  const now = new Date();

  const [ref, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: true,
  });

  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const start = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!embla) return;

    /* глубина: масштаб и прозрачность зависят от расстояния до текущей позиции */
    const depth = () => {
      const p = Math.max(0, Math.min(1, embla.scrollProgress()));
      const snaps = embla.scrollSnapList();
      snaps.forEach((snap, i) => {
        const el = cards.current[i];
        if (!el) return;
        const k = Math.min(Math.abs(snap - p), 1);
        el.style.transform = `scale(${(1 - k * 0.07).toFixed(4)})`;
        el.style.opacity = (1 - k * 0.32).toFixed(3);
      });
    };

    /* активная точка: ближайший слайд к текущей позиции */
    const mark = () => {
      const p = Math.max(0, Math.min(1, embla.scrollProgress()));
      let best = 0;
      let dist = Infinity;
      embla.scrollSnapList().forEach((snap, i) => {
        const d = Math.abs(snap - p);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setActive(best);
    };

    depth();
    embla.on("scroll", depth);
    embla.on("select", mark);
    embla.on("reInit", depth);
    return () => {
      embla.off("scroll", depth);
      embla.off("select", mark);
      embla.off("reInit", depth);
    };
  }, [embla]);

  return (
    <div className="ctr">
      <div
        className="ctr__viewport"
        ref={ref}
        onPointerDown={(e) => {
          start.current = { x: e.clientX, y: e.clientY };
          dragged.current = false;
        }}
        onPointerMove={(e) => {
          if (dragged.current) return;
          if (Math.abs(e.clientX - start.current.x) > 6 || Math.abs(e.clientY - start.current.y) > 6) {
            dragged.current = true;
          }
        }}
      >
        <div className="ctr__track" data-single={contracts.length === 1}>
          {contracts.map((c, i) => {
            const a = assetById(c.assetId);
            const val = contractValue(c, now);
            const d = ((val - c.amount) / c.amount) * 100;
            const left = Math.max(
              0,
              Math.ceil(
                (new Date(new Date(c.opened).setMonth(new Date(c.opened).getMonth() + c.months)).getTime() -
                  now.getTime()) /
                  2_629_800_000
              )
            );

            return (
              <div className="ctr__slide" key={c.no}>
                <div
                  className="ctr__card"
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  onClick={() => {
                    /* после свайпа или вертикального скролла клик не открывает объект */
                    if (!dragged.current) onOpen(a.id);
                  }}
                >

                  {/* крупное фото объекта — во всю ширину карточки */}
                  <div className="ctr__photo">
                    <img
                      className="ctr__img"
                      src={`${import.meta.env.BASE_URL}obj/${a.img}`}
                      alt=""
                      loading="lazy"
                    />
                    <span className="ctr__rate tnum">{c.rate}%</span>
                    <div className="ctr__head">
                      <span className="ctr__no tnum">
                        {t(ui.contractNo)} {c.no}
                      </span>
                      <span className="ctr__name">{a.name[lang]}</span>
                      <span className="ctr__sub">
                        {products[c.product].name[lang]} · {c.months} {t(ui.monthsShort)}
                      </span>
                    </div>
                  </div>

                  <div className="ctr__body">
                    <div className="ctr__sum">
                      <b className="tnum">{money(Math.round(val))}</b>
                      <i className={`tnum ${d < 0 ? "down" : "up"}`}>{pct(d)}</i>
                    </div>

                    <span className="ctr__perf" aria-hidden />

                    <div className="ctr__facts">
                      <span>
                        <i>{t(ui.accrued)}</i>
                        <b className="tnum">{money(Math.round(val - c.amount))}</b>
                      </span>
                      <span>
                        <i>{t(ui.payout)}</i>
                        <b className="tnum">{money(Math.round(monthlyPayout(c)))}</b>
                      </span>
                      <span>
                        <i>{t(ui.ctrLeft)}</i>
                        <b className="tnum">
                          {left} {t(ui.monthsShort)}
                        </b>
                      </span>
                    </div>

                    <div className="ctr__foot">
                      {c.signed ? (
                        <span className="ctr__stamp" aria-hidden>
                          <ShieldCheck size={11} strokeWidth={2.6} />
                          {t(ui.esign)}
                        </span>
                      ) : (
                        <span />
                      )}
                      <button className="ctr__open" type="button" onClick={() => onOpen(a.id)}>
                        {t(ui.openObject)}
                        <ChevronRight size={14} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ctr__bar">
        <div className="ctr__dots" role="tablist" aria-label={t(ui.myObjects)}>
          {contracts.length > 1 &&
            contracts.map((c, i) => (
              <button
                key={c.no}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`${i + 1}`}
                data-on={i === active}
                onClick={() => embla?.scrollTo(i)}
              />
            ))}
        </div>
        <button className="ctr__more" type="button" onClick={onAnalytics}>
          {t(ui.analytics)}
          <ChevronRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
