import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ui, type Contract } from "../lib/data";
import { money, portfolioIncome, useT, type IncomePeriod } from "../lib/app";

/**
 * «Примерный доход» под балансом. Свёрнуто — компактная капсула со значением
 * за месяц, по нажатию раскрывается пружиной (тот же приём, что у Dynamic
 * Island в components/Island.tsx), но светлая и небольшая: выбор периода
 * «в год / в месяц / в день». Все три значения считаются из одной базы
 * (ставка × сумма), поэтому сходятся между собой.
 */
export function IncomeChip({ contracts }: { contracts: Contract[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<IncomePeriod>("month");

  const sums = useMemo(
    () => ({
      year: portfolioIncome(contracts, "year"),
      month: portfolioIncome(contracts, "month"),
      day: portfolioIncome(contracts, "day"),
    }),
    [contracts]
  );

  const label: Record<IncomePeriod, string> = {
    year: t(ui.inYear),
    month: t(ui.anPerMonth),
    day: t(ui.inDay),
  };

  const wide = Math.min(222, (typeof window !== "undefined" ? window.innerWidth : 390) - 56);

  return (
    <motion.div
      className="inc"
      data-open={open}
      animate={{ width: open ? wide : "auto", borderRadius: open ? 22 : 999 }}
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
      style={{ overflow: "hidden" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="open"
            className="inc__body"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {/* сворачиваем нажатием на заголовок: без вложенных кнопок */}
            <button
              className="inc__tap"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-expanded={open}
              aria-label={t(ui.incomeApprox)}
            >
              <span className="inc__k">{t(ui.incomeApprox)}</span>
              <span className="inc__v tnum">
                {money(sums[period], period === "day" ? 2 : 0)}
                <i>{label[period]}</i>
              </span>
            </button>

            <div className="inc__seg" role="tablist" aria-label={t(ui.incomeApprox)}>
              {(["year", "month", "day"] as IncomePeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={p === period}
                  data-on={p === period}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPeriod(p);
                  }}
                >
                  {p === "year" ? t(ui.perYearShort) : p === "month" ? t(ui.perMonthShort) : t(ui.perDayShort)}
                </button>
              ))}
            </div>

          </motion.div>
        ) : (
          <motion.button
            key="closed"
            className="inc__row"
            type="button"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label={t(ui.incomeApprox)}
          >
            <span className="inc__dot" aria-hidden />
            <span className="inc__t tnum">
              {money(sums.month)} <i>{label.month}</i>
            </span>
            <ChevronDown size={14} strokeWidth={2.4} className="inc__chev" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
