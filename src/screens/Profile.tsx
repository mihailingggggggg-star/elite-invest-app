import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Coins,
  LogOut,
  MoreVertical,
  Plus,
  Settings,
  ShieldCheck,
  Sprout,
  TrendingUp,
  X,
} from "lucide-react";
import { COMPANY, ui } from "../lib/data";
import {
  accrued,
  contractsUnit,
  daysWord,
  money,
  monthlyPayout,
  nextPayoutDate,
  pct,
  useApp,
  useT,
} from "../lib/app";
import { Seg } from "../components/Seg";
import { IcChat, IcDoc, IcGlobe, IcMoon, IcOut, IcShield, IcSun } from "../components/Icons";

/**
 * Личный кабинет 1:1 по референсу: пилюли сверху, строка инструментов и баланса,
 * аватар в пунктирном кольце, имя и @ник, три метрики с разделителями,
 * недельная полоса с выделенным сегодня, пара карточек и широкая карточка.
 * Иконки — lucide-react, появление — framer-motion.
 */
export function Profile({
  onKyc,
  onDemo,
  onTopUp,
  onFeed,
  onBrowse,
  onBack,
}: {
  onKyc: () => void;
  onDemo: () => void;
  onTopUp: () => void;
  onFeed: () => void;
  onBrowse: () => void;
  onBack: () => void;
}) {
  const t = useT();
  const { lang, setLang, theme, setTheme, user, contracts, cash, signOut } = useApp();
  const now = new Date();

  const body = contracts.reduce((s, c) => s + c.amount, 0);
  const acc = contracts.reduce((s, c) => s + accrued(c, now), 0);
  const total = body + acc + cash;
  const yieldPct = body ? (acc / body) * 100 : 0;

  const initials = user
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";
  const handle = user ? "@" + (user.email.split("@")[0] || "esmar") : "@esmar";

  const firstOpened = contracts.length
    ? contracts.map((c) => new Date(c.opened).getTime()).sort((a, b) => a - b)[0]
    : null;
  const daysIn = firstOpened ? Math.max(1, Math.floor((now.getTime() - firstOpened) / 86_400_000) + 1) : 0;

  /* Ближайшая арендная выплата: дата и сумма по самому раннему договору. */
  const rent = contracts.filter((c) => c.product === "rent");
  const next = useMemo(() => {
    if (!rent.length) return null;
    const sorted = [...rent].sort(
      (a, b) => nextPayoutDate(a, now).getTime() - nextPayoutDate(b, now).getTime()
    );
    const c = sorted[0];
    const date = nextPayoutDate(c, now);
    return {
      date,
      amount: monthlyPayout(c),
      days: Math.max(1, Math.ceil((date.getTime() - now.getTime()) / 86_400_000)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts]);

  /* Неделя: понедельник — воскресенье, сегодня выделено. */
  const week = useMemo(() => {
    const shift = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - shift);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return {
        wd: d.toLocaleDateString("ru-RU", { weekday: "short" }).slice(0, 2),
        day: d.getDate(),
        today:
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Точки-«стрик»: чем ближе выплата, тем больше зажжённых. */
  const lit = next ? Math.min(7, Math.max(1, 7 - Math.ceil(next.days / 7))) : 0;

  return (
    <div className="screen">
      <header className="pf__bar">
        <button className="pf__pill" onClick={onBack} type="button">
          <X size={14} strokeWidth={2.6} />
          {t(ui.close)}
        </button>
        <button className="pf__pill pf__pill--icons" onClick={onDemo} type="button" aria-label={t(ui.settings)}>
          <ChevronDown size={16} strokeWidth={2.2} />
          <MoreVertical size={16} strokeWidth={2.2} />
        </button>
      </header>

      <div className="pf__tools">
        <button className="pf__tool" onClick={onDemo} type="button" aria-label={t(ui.settings)}>
          <Settings size={19} strokeWidth={2} />
        </button>
        <button className="pf__tool pf__tool--dot" onClick={onFeed} type="button" aria-label={t(ui.history)}>
          <Bell size={19} strokeWidth={2} />
        </button>

        <span className="pf__money">
          <Coins size={15} strokeWidth={2.2} />
          <b className="tnum">{money(Math.round(total))}</b>
          <button className="pf__add" onClick={onTopUp} type="button" aria-label={t(ui.topUp)}>
            <Plus size={17} strokeWidth={2.6} />
          </button>
        </span>
      </div>

      <motion.div
        className="pf__ava"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <span className="pf__ring">
          {user ? initials : <ShieldCheck size={26} strokeWidth={1.8} />}
        </span>
      </motion.div>

      <h1 className="pf__name">{user ? user.name : t(ui.pfGuest)}</h1>
      <span className="pf__handle">{handle}</span>

      {user ? (
        <div className="pf__stats">
          <div>
            <span className="pf__si">
              <TrendingUp size={15} strokeWidth={2.4} />
            </span>
            <b className="tnum">{pct(yieldPct)}</b>
            <span>{t(ui.pfYield)}</span>
          </div>
          <div>
            <span className="pf__si">
              <Boxes size={15} strokeWidth={2.2} />
            </span>
            <b className="tnum">{contracts.length}</b>
            <span>{contractsUnit(contracts.length, lang)}</span>
          </div>
          <div>
            <span className="pf__si">
              <CalendarDays size={15} strokeWidth={2.2} />
            </span>
            <b className="tnum">{daysIn}</b>
            <span>
              {daysWord(daysIn)} {t(ui.pfDaysIn)}
            </span>
          </div>
        </div>
      ) : (
        <button className="pf__cta" onClick={onKyc} type="button">
          <ShieldCheck size={18} strokeWidth={2} />
          {t(ui.guestCta)}
        </button>
      )}

      <div className="pf__week">
        {week.map((d) => (
          <div className="pf__day" data-on={d.today} key={d.day} aria-current={d.today ? "date" : undefined}>
            <i aria-hidden />
            <span>{d.wd}</span>
            <b className="tnum">{d.day}</b>
          </div>
        ))}
      </div>

      <div className="pf__duo">
        <a className="pf__card" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">
          <span className="pf__face" aria-hidden>
            <Sprout size={17} strokeWidth={2.2} />
            <i className="pf__on" />
          </span>
          <b>{t(ui.manager)}</b>
          <span className="pf__sub">{t(ui.pfOnline)}</span>
        </a>

        <div className="pf__card pf__card--next">
          <span className="pf__cardico" aria-hidden>
            <CalendarDays size={17} strokeWidth={2} />
          </span>
          <b>{t(ui.pfNext)}</b>
          <span className="pf__sub tnum">
            {next
              ? `${money(Math.round(next.amount))} · ${t(ui.pfIn)} ${next.days} ${t(ui.pfDaysShort)}`
              : "—"}
          </span>
          <span className="pf__dots" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} data-on={i < lit} />
            ))}
          </span>
        </div>
      </div>

      <button className="pf__wide" onClick={onBrowse} type="button">
        <span className="pf__wide-i">
          <Plus size={19} strokeWidth={2.4} />
        </span>
        <span>
          <b>
            {cash > 0 ? `${money(cash)} ${t(ui.pfFreeShort)}` : t(ui.pfTopUp)}
          </b>
          <span>{cash > 0 ? t(ui.pfFreeSub) : t(ui.pfNoFunds)}</span>
        </span>
        <ChevronRight size={18} strokeWidth={2.2} />
      </button>

      <div className="pf__list">
        <div className="pf__row">
          <span className="pf__row-i">
            <IcGlobe />
          </span>
          <span className="pf__row-b">
            <b>{t(ui.language)}</b>
            <span>{lang === "ky" ? "Кыргызча" : "Русский"}</span>
          </span>
          <Seg
            name="lang"
            value={lang}
            onChange={setLang}
            options={[
              { v: "ky" as const, label: "KG" },
              { v: "ru" as const, label: "RU" },
            ]}
          />
        </div>

        <div className="pf__row">
          <span className="pf__row-i">{theme === "dark" ? <IcMoon /> : <IcSun />}</span>
          <span className="pf__row-b">
            <b>{t(ui.theme)}</b>
            <span>{theme === "dark" ? t(ui.themeDark) : t(ui.themeLight)}</span>
          </span>
          <Seg
            name="theme"
            value={theme}
            onChange={setTheme}
            options={[
              { v: "dark" as const, label: <IcMoon /> },
              { v: "light" as const, label: <IcSun /> },
            ]}
          />
        </div>

        <div className="pf__row">
          <span className="pf__row-i">
            <IcShield />
          </span>
          <span className="pf__row-b">
            <b>
              {t(ui.license)} {COMPANY.license.no}
            </b>
            <span>Финнадзор КР · {COMPANY.license.date}</span>
          </span>
        </div>

        <a
          className="pf__row"
          href={`${COMPANY.site}/dokumenty`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="pf__row-i">
            <IcDoc />
          </span>
          <span className="pf__row-b">
            <b>{t(ui.documents)}</b>
            <span>{t(ui.docsNote)}</span>
          </span>
          <IcOut />
        </a>

        <button className="pf__row" onClick={onDemo} type="button">
          <span className="pf__row-i">
            <IcDoc />
          </span>
          <span className="pf__row-b">
            <b>{t(ui.sample)}</b>
            <span>{t(ui.offer)}</span>
          </span>
          <ChevronRight size={16} strokeWidth={2.2} />
        </button>

        <a className="pf__row" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">
          <span className="pf__row-i">
            <IcChat />
          </span>
          <span className="pf__row-b">
            <b>{t(ui.support)}</b>
            <span>
              {COMPANY.phone} · {COMPANY.email}
            </span>
          </span>
          <IcOut />
        </a>

        {user && (
          <button className="pf__row pf__row--out" onClick={signOut} type="button">
            <span className="pf__row-i">
              <LogOut size={16} strokeWidth={2} />
            </span>
            <span className="pf__row-b">
              <b>{t(ui.logout)}</b>
            </span>
          </button>
        )}
      </div>

      <p className="demo">{t(ui.demoNames)}</p>
    </div>
  );
}
