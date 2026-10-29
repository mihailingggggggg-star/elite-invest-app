import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Contract, Lang } from "./lib/data";
import { AppCtx, seedCash, seedContracts, useApp, type Theme, type User } from "./lib/app";
import { Nav, type Tab } from "./components/Nav";
import { Splash } from "./components/Splash";
import { Home } from "./screens/Home";
import { Market } from "./screens/Market";
import { Profile } from "./screens/Profile";
import { Asset } from "./screens/Asset";
import { Deal, DemoStub, FeedSheet, NewsSheet, Terminate, TopUp } from "./screens/Flows";

/* Проверка личности и аналитика тянут камеру и графики — грузим по требованию,
   чтобы первый экран открывался быстрее. */
const Kyc = lazy(() => import("./components/Kyc").then((m) => ({ default: m.Kyc })));
const Stats = lazy(() => import("./screens/Stats").then((m) => ({ default: m.Stats })));

const LS = {
  lang: "esmar-lang",
  theme: "esmar-theme",
  user: "esmar-user",
  contracts: "esmar-contracts",
  cash: "esmar-cash",
};

/** localStorage бросает исключение в приватной вкладке — старт от этого не падает. */
function read(key: string, allowed: string[], fallback: string) {
  try {
    const v = localStorage.getItem(key);
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* приватный режим — настройка просто не переживёт перезапуск */
  }
}

export default function Root() {
  const [lang, setLang] = useState<Lang>(() => read(LS.lang, ["ru", "ky"], "ru") as Lang);
  const [theme, setTheme] = useState<Theme>(() => read(LS.theme, ["light", "dark"], "light") as Theme);
  const [user, setUser] = useState<User | null>(() => readJson<User | null>(LS.user, null));
  const [contracts, setContracts] = useState<Contract[]>(() => readJson<Contract[]>(LS.contracts, []));
  const [cash, setCash] = useState<number>(() => readJson<number>(LS.cash, 0));
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#fbf7ef" : "#0b0e06");
    write(LS.theme, theme);
    write(LS.lang, lang);
  }, [theme, lang]);

  useEffect(() => write(LS.user, user), [user]);
  useEffect(() => write(LS.contracts, contracts), [contracts]);
  useEffect(() => write(LS.cash, cash), [cash]);

  const verify = useCallback((name: string) => {
    setUser({ name, email: "m.bandurin@demo.kg", verifiedAt: new Date().toISOString() });
    /* Демо-портфель: в приложении-презентации инвестор уже с договорами. */
    setContracts((prev) => (prev.length ? prev : seedContracts()));
    setCash((prev) => (prev > 0 ? prev : seedCash()));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setContracts([]);
    setCash(0);
  }, []);

  const addContract = useCallback((c: Contract) => {
    setContracts((prev) => [c, ...prev]);
  }, []);

  const removeContract = useCallback((no: string) => {
    setContracts((prev) => prev.filter((c) => c.no !== no));
  }, []);

  const ctx = useMemo(
    () => ({
      lang,
      setLang,
      theme,
      setTheme,
      user,
      contracts,
      cash,
      verify,
      signOut,
      addContract,
      removeContract,
      setCash,
    }),
    [lang, theme, user, contracts, cash, verify, signOut, addContract, removeContract]
  );

  return (
    <AppCtx.Provider value={ctx}>
      {booting ? (
        <div className="app">
          <AnimatePresence>
            <Splash key="splash" onDone={() => setBooting(false)} />
          </AnimatePresence>
        </div>
      ) : (
        <Shell />
      )}
    </AppCtx.Provider>
  );
}

function Shell() {
  const { user, contracts } = useApp();
  const [tab, setTab] = useState<Tab>("home");
  const [asset, setAsset] = useState<string | null>(null);
  const [topUp, setTopUp] = useState(false);
  const [deal, setDeal] = useState<string | null>(null);
  const [term, setTerm] = useState<string | null>(null);
  const [kyc, setKyc] = useState(false);
  const [newsAll, setNewsAll] = useState(false);
  const [stub, setStub] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

  /* Действие, отложенное до прохождения проверки личности. */
  const pending = useRef<null | (() => void)>(null);

  /** Покупка, расторжение и пополнение требуют подтверждённой личности. */
  const gate = useCallback(
    (run: () => void) => {
      if (user) {
        run();
        return;
      }
      pending.current = run;
      setKyc(true);
    },
    [user]
  );

  const onKycDone = useCallback(() => {
    setKyc(false);
    const run = pending.current;
    pending.current = null;
    /* Даём оверлею проверки уйти, иначе лист открывается под ним. */
    if (run) window.setTimeout(run, 320);
  }, []);

  return (
    <div className="app">
      <div className="bg" aria-hidden>
        <span />
        <span />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          {tab === "home" && (
            <Home
              onAsset={setAsset}
              onStats={() => setTab("stats")}
              onAll={() => setFeedOpen(true)}
              onKyc={() => setKyc(true)}
              onBrowse={() => setTab("market")}
              onAllNews={() => setNewsAll(true)}
              onTopUp={() => gate(() => setTopUp(true))}
              onWithdraw={() => gate(() => setStub(true))}
              onBuy={(id) => gate(() => setDeal(id))}
            />
          )}
          {tab === "market" && <Market onAsset={setAsset} onBell={() => setFeedOpen(true)} />}
          {tab === "stats" && (
            <Suspense fallback={<div className="screen" />}>
              <Stats onKyc={() => setKyc(true)} />
            </Suspense>
          )}
          {tab === "profile" && <Profile onKyc={() => setKyc(true)} onDemo={() => setStub(true)} />}
        </motion.div>
      </AnimatePresence>

      <Nav tab={tab} onTab={setTab} onTopUp={() => gate(() => setTopUp(true))} />

      <AnimatePresence>
        {asset && (
          <Asset
            key={asset}
            id={asset}
            onBack={() => setAsset(null)}
            onBuy={() => gate(() => setDeal(asset))}
            onTerminate={() => {
              /* Проверка личности нужна только если есть что расторгать. */
              if (contracts.some((c) => c.assetId === asset)) gate(() => setTerm(asset));
              else setTerm(asset);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{topUp && <TopUp key="topup" onClose={() => setTopUp(false)} />}</AnimatePresence>
      <AnimatePresence>{deal && <Deal key="deal" id={deal} onClose={() => setDeal(null)} />}</AnimatePresence>
      <AnimatePresence>
        {term && <Terminate key="term" assetId={term} onClose={() => setTerm(null)} />}
      </AnimatePresence>
      <AnimatePresence>{newsAll && <NewsSheet key="news" onClose={() => setNewsAll(false)} />}</AnimatePresence>
      <AnimatePresence>{feedOpen && <FeedSheet key="feed" onClose={() => setFeedOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{stub && <DemoStub key="stub" onClose={() => setStub(false)} />}</AnimatePresence>
      <AnimatePresence>
        {kyc && (
          <Suspense key="kyc" fallback={null}>
            <Kyc
              onClose={() => {
                pending.current = null;
                setKyc(false);
              }}
              onDone={onKycDone}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
