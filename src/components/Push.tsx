import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";
import { MarkEsmar } from "./Logo";
import { IcCheck, IcClose } from "./Icons";
import { money, shortDate } from "../lib/app";

/**
 * Подтверждение договора по push-уведомлению — «цифровая подпись».
 * Сценарий повторяет подписание в documenso/documenso (AGPL-3.0):
 * уведомление приходит на устройство, подписант подтверждает его,
 * после чего ставится отметка о подписании с датой и временем.
 */
export function PushConfirm({
  contractNo,
  assetName,
  amount,
  rate,
  productLabel,
  onSigned,
  onCancel,
}: {
  contractNo: string;
  assetName: string;
  amount: number;
  rate: number;
  productLabel: string;
  onSigned: () => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<"idle" | "signing" | "signed">("idle");
  const [code] = useState(() => String(1000 + Math.floor(Math.random() * 8999)));
  const now = new Date();

  /* Цепочку таймеров держим в ref: через useEffect она сбрасывалась на каждом
     ре-рендере (родитель пересоздаёт onSigned), и договор не сохранялся.
     Колбэк берём свежий в момент клика — подпись отрабатывает ровно один раз. */
  const timers = useRef<number[]>([]);
  const busy = useRef(false);

  useEffect(() => {
    const list = timers;
    return () => list.current.forEach(window.clearTimeout);
  }, []);

  const confirm = () => {
    if (busy.current) return;
    busy.current = true;
    const done = onSigned;
    setState("signing");
    timers.current.push(
      window.setTimeout(() => {
        setState("signed");
        timers.current.push(window.setTimeout(done, 700));
      }, 850)
    );
  };

  return (
    <div className="push-layer" role="dialog" aria-modal="true" aria-label="Подтверждение договора">
      <motion.div
        className="veil"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={state === "idle" ? onCancel : undefined}
      />

      <motion.div
        className="push"
        initial={{ y: -140, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <div className="push__head">
          <span className="push__icon" aria-hidden>
            <MarkEsmar size={20} />
          </span>
          <span className="push__app">ESMAR</span>
          <span className="push__now">сейчас</span>
          {state === "idle" && (
            <button className="push__x" onClick={onCancel} aria-label="Закрыть">
              <IcClose size={15} />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {state === "signed" ? (
            <motion.div
              key="ok"
              className="push__ok"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="seal"
                initial={{ scale: 0.4, rotate: -18, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
              >
                <MarkEsmar size={26} />
                <i>
                  <IcCheck size={11} />
                </i>
              </motion.span>
              <b>Договор подписан</b>
              <span className="tnum">
                {contractNo} · {shortDate(now.toISOString())} ·{" "}
                {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="push__title">Подтверждение договора</p>
              <p className="push__body">
                {assetName} · {productLabel} · {money(amount)} под {rate}% годовых
              </p>
              <p className="push__code">
                Договор {contractNo} · код <b className="tnum">{code}</b>
              </p>

              <div className="push__act">
                {state === "signing" ? (
                  <span className="push__wait">
                    <Ring size={20} stroke={2.4} color="var(--brand-lit)" />
                    Подписываем…
                  </span>
                ) : (
                  <>
                    <button className="btn btn--s btn--sm" onClick={onCancel}>
                      Отклонить
                    </button>
                    <button className="btn btn--p btn--sm" onClick={confirm}>
                      Подтвердить
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

