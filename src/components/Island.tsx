import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { MarkEsmar } from "./Logo";
import { money, useT } from "../lib/app";
import { ui } from "../lib/data";

/**
 * «Динамический остров» вместо шапки: чёрная капсула с личным счётом,
 * по тапу раскрывается в карточку счёта. Анимация — тот же приём, что в
 * веб-клонах Dynamic Island на framer-motion (nithinpjohn/Dynamic-island-notifications,
 * Kurniakun17/dynamic-island-clone): плавный переход ширины/высоты/радиуса
 * пружиной + кроссфейд содержимого через AnimatePresence.
 */
export function AccountIsland({
  user,
  cash,
  onTopUp,
  onWithdraw,
  onKyc,
}: {
  user: boolean;
  cash: number;
  onTopUp: () => void;
  onWithdraw: () => void;
  onKyc: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  /* Ширина раскрытого острова подстраивается под узкие экраны. */
  const wide = Math.min(322, window.innerWidth - 36);

  return (
    <motion.div
      className="island"
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={t(ui.personal)}
      data-open={open}
      onClick={() => setOpen((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
      animate={{
        width: open ? wide : 216,
        height: open ? "auto" : 40,
        borderRadius: open ? 28 : 999,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
    >
      <motion.div className="island__row" layout="position">
        <span className="island__mark" aria-hidden>
          <MarkEsmar size={13} />
        </span>
        <span className="island__k">{t(ui.personal)}</span>
        <motion.span
          className="island__v tnum"
          data-off={!user}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.16 }}
        >
          {user ? money(cash) : "—"}
        </motion.span>
      </motion.div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="more"
            className="island__more"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, delay: open ? 0.06 : 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="island__head" data-solo={!user}>
              {user && <span className="island__acc">•••• 9047</span>}
              <button
                className="island__chev"
                type="button"
                aria-label={t(ui.collapse)}
                onClick={() => setOpen(false)}
              >
                <ChevronUp size={14} strokeWidth={2.2} />
              </button>
            </div>

            {user ? (
              <>
                <div className="island__big tnum">{money(cash, 2)}</div>
                <div className="island__sub">{t(ui.free)}</div>
                <div className="island__btns">
                  <button
                    className="island__btn"
                    data-p="true"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onTopUp();
                    }}
                  >
                    {t(ui.topUp)}
                  </button>
                  <button
                    className="island__btn"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onWithdraw();
                    }}
                  >
                    {t(ui.withdraw)}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="island__big island__big--s">{t(ui.islandGuest)}</div>
                <div className="island__sub">{t(ui.islandGuestSub)}</div>
                <div className="island__btns">
                  <button
                    className="island__btn"
                    data-p="true"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onKyc();
                    }}
                  >
                    {t(ui.kycStart)}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
