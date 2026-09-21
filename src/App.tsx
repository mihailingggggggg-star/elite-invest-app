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

export default function Root() {
  const [lang, setLang] = useState<Lang>(() => {
    const v = localStorage.getItem("ei-lang");
    return v === "ru" || v === "ky" ? v : "ky";
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const v = localStorage.getItem("ei-theme");
    return v === "light" || v === "dark" ? v : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ei-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("ei-lang", lang);
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
          {tab === "home" && <Home onAsset={setAsset} onStats={() => setTab("stats")} />}
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
