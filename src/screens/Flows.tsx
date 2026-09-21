import { useState } from "react";
import { motion } from "framer-motion";
import { assetById, cash, MIN_TICKET, PHONE, ui } from "../lib/data";
import { money, useApp, useT } from "../lib/app";
import { Sheet } from "../components/Sheet";
import { IcCheck } from "../components/Icons";

/* ------------------------------------------------------------- пополнение */

export function TopUp({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { lang } = useApp();
  const [amount, setAmount] = useState("100");
  const [done, setDone] = useState(false);
  const value = Number(amount.replace(/\D/g, "")) || 0;

  return (
    <Sheet onClose={onClose}>
      {done ? (
        <Success
          title={t(ui.done)}
          text={
            lang === "ky"
              ? `${money(value)} брокердик эсепке түштү.`
              : `${money(value)} зачислены на брокерский счёт.`
          }
          onClose={onClose}
        />
      ) : (
        <>
          <h3 className="sheet__t">{t(ui.topUp)}</h3>

          <div className="stack">
            <div className="mbank">
              <b>{t(ui.fromMbank)}</b>
              <span>{PHONE}</span>
            </div>

            <div style={{ padding: "0 4px" }}>
              <div style={{ fontSize: 12.5, color: "var(--txt-3)", fontWeight: 600, marginBottom: 6 }}>
                {t(ui.toAccount)}
              </div>
              <div className="tnum" style={{ fontSize: 20, fontWeight: 800 }}>{money(cash)}</div>
            </div>

            <div>
              <div style={{ fontSize: 12.5, color: "var(--txt-3)", fontWeight: 600, marginBottom: 8 }}>
                {t(ui.amount)}
              </div>
              <div className="amount">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  className="tnum"
                  aria-label={t(ui.amount)}
                />
                <span>$</span>
              </div>
            </div>

            <div className="chips">
              {[100, 500, 1000, 5000].map((v) => (
                <button key={v} data-on={value === v} onClick={() => setAmount(String(v))} className="tnum">
                  {v.toLocaleString("ru-RU")}
                </button>
              ))}
            </div>

            <div className="note note--dim">{t(ui.noFee)}</div>
            <div className="note">
              <IcCheck /> {t(ui.fast)}
            </div>

            <button className="btn btn--p" disabled={value <= 0} onClick={() => setDone(true)}>
              {t(ui.confirm)}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ----------------------------------------------------------- покупка пая */

export function Trade({
  id,
  side,
  onClose,
}: {
  id: string;
  side: "buy" | "sell";
  onClose: () => void;
}) {
  const a = assetById(id);
  const t = useT();
  const { lang } = useApp();
  const [amount, setAmount] = useState(String(Math.max(MIN_TICKET, Math.ceil(a.price))));
  const [done, setDone] = useState(false);

  const value = Number(amount.replace(/\D/g, "")) || 0;
  const units = Math.floor(value / a.price);
  const rest = value - units * a.price;
  const tooSmall = side === "buy" && value < MIN_TICKET;

  return (
    <Sheet onClose={onClose}>
      {done ? (
        <Success
          title={t(ui.done)}
          text={
            side === "buy"
              ? lang === "ky"
                ? `${a.name.ky}: ${units} пай сатып алынды.`
                : `${a.name.ru}: куплено ${units} паёв.`
              : lang === "ky"
                ? `${a.name.ky}: ${units} пай сатууга коюлду.`
                : `${a.name.ru}: ${units} паёв выставлено на продажу.`
          }
          onClose={onClose}
        />
      ) : (
        <>
          <h3 className="sheet__t">
            {side === "buy" ? t(ui.buy) : t(ui.sell)} · {a.name[lang]}
          </h3>

          <div className="stack">
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px", fontSize: 13.5 }}>
              <span style={{ color: "var(--txt-3)", fontWeight: 600 }}>{t(ui.perUnit)}</span>
              <b className="tnum">{money(a.price)}</b>
            </div>

            <div className="amount">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
                inputMode="numeric"
                className="tnum"
                aria-label={t(ui.amount)}
              />
              <span>$</span>
            </div>

            <div className="chips">
              {[500, 1000, 2500, 5000].map((v) => (
                <button key={v} data-on={value === v} onClick={() => setAmount(String(v))} className="tnum">
                  {v.toLocaleString("ru-RU")}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 8, padding: "4px 4px 0" }}>
              <Line k={t(ui.unitsToBuy)} v={String(units)} />
              <Line
                k={lang === "ky" ? "Калдык эсепке" : "Остаток на счёт"}
                v={money(Math.round(rest))}
              />
              <Line k={t(ui.expYield)} v={`${a.yieldPct}% ${t(ui.yieldY)}`} accent />
            </div>

            {tooSmall ? (
              <div className="note note--dim">{t(ui.minTicket)}</div>
            ) : (
              <div className="note note--dim">
                {side === "buy"
                  ? lang === "ky"
                    ? "Курулуш компаниясынан үлүш: ачык сатууга чыкканга чейин."
                    : "Доля от застройщика: до выхода объекта в открытую продажу."
                  : lang === "ky"
                    ? "Сатуу катышуучулардын ички рыногу аркылуу жүрөт."
                    : "Продажа проходит через внутренний рынок участников."}
              </div>
            )}

            <button className="btn btn--p" disabled={tooSmall || units < 1} onClick={() => setDone(true)}>
              {t(ui.confirm)}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

function Line({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "var(--txt-3)", fontWeight: 600 }}>{k}</span>
      <b className="tnum" style={{ color: accent ? "var(--brand-lit)" : undefined }}>{v}</b>
    </div>
  );
}

function Success({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  const t = useT();
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center", textAlign: "center", padding: "16px 0 4px" }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 18 }}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          background: "linear-gradient(160deg, #4ade80, #16a34a)",
        }}
      >
        <IcCheck size={30} />
      </motion.div>
      <h3 style={{ fontSize: 22 }}>{title}</h3>
      <p style={{ fontSize: 14.5, color: "var(--txt-2)", maxWidth: "30ch" }}>{text}</p>
      <button className="btn btn--s" onClick={onClose}>{t(ui.done)}</button>
    </div>
  );
}

/* ------------------------------------------------------------ заглушка */

export function DemoStub({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center", padding: "14px 0 6px" }}>
        <span
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "var(--brand-lit)",
            background: "rgba(237,107,6,0.14)",
          }}
        >
          {t(ui.demoBadge)}
        </span>
        <p style={{ fontSize: 15.5, color: "var(--txt-2)", maxWidth: "28ch" }}>{t(ui.demoText)}</p>
        <button className="btn btn--s" onClick={onClose}>{t(ui.done)}</button>
      </div>
    </Sheet>
  );
}
