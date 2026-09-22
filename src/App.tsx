import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Lang } from "./lib/data";
import { AppCtx, type Theme } from "./lib/app";
import { TabBar, type Tab } from "./components/TabBar";
import { Home } from "./screens/Home";
import { Market } from "./screens/Market";
import { Stats } from "./screens/Stats";
import { Profile } from "./screens/Profile";
import { Asset } from "./screens/Asset";
import { DemoStub, TopUp, Trade } from "./screens/Flows";

/** localStorage бросает исключение в приватной вкладке — старт от этого не падает. */
function read(key: string, allowed: string[], fallback: string) {
  try {
    const v = localStorage.getItem(key);
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export default function Root() {
  const [lang, setLang] = useState<Lang>(() => read("ei-lang", ["ru", "ky"], "ky") as Lang);
  const [theme, setTheme] = useState<Theme>(() => read("ei-theme", ["light", "dark"], "dark") as Theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f1f0f3" : "#08080b");
    try {
      localStorage.setItem("ei-theme", theme);
    } catch {
      /* приватный режим — настройка просто не переживёт перезапуск */
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("ei-lang", lang);
    } catch {
      /* см. выше */
    }
  }, [lang]);

  const ctx = useMemo(() => ({ lang, setLang, theme, setTheme }), [lang, theme]);

  return (
    <AppCtx.Provider value={ctx}>
      <Shell />
    </AppCtx.Provider>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("home");
  const [asset, setAsset] = useState<string | null>(null);
  const [topUp, setTopUp] = useState(false);
  const [trade, setTrade] = useState<{ id: string; side: "buy" | "sell" } | null>(null);
  const [stub, setStub] = useState(false);

  return (
    <div className="app">
      <div className="bgfx" aria-hidden>
        <i /><i /><i />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          {tab === "home" && <Home onAsset={setAsset} onStats={() => setTab("stats")} onHistory={() => setStub(true)} />}
          {tab === "market" && <Market onAsset={setAsset} />}
          {tab === "stats" && <Stats />}
          {tab === "profile" && <Profile onDemo={() => setStub(true)} />}
        </motion.div>
      </AnimatePresence>

      <TabBar tab={tab} onTab={setTab} onAdd={() => setTopUp(true)} />

      <AnimatePresence>
        {asset && (
          <Asset
            key={asset}
            id={asset}
            onBack={() => setAsset(null)}
            onTrade={(side) => setTrade({ id: asset, side })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{topUp && <TopUp key="topup" onClose={() => setTopUp(false)} />}</AnimatePresence>
      <AnimatePresence>
        {trade && <Trade key="trade" id={trade.id} side={trade.side} onClose={() => setTrade(null)} />}
      </AnimatePresence>
      <AnimatePresence>{stub && <DemoStub key="stub" onClose={() => setStub(false)} />}</AnimatePresence>
    </div>
  );
}
