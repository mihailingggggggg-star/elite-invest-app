import { useEffect } from "react";
import { motion } from "framer-motion";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";
import { LogoEsmar, MarkEsmar } from "./Logo";

/**
 * Быстрый экран загрузки: эмблема ESMAR, золотой ободок вокруг неё и
 * спиннер под начертанием. Сам спиннер — Ring из ldrs
 * (github.com/GriffinJohnston/ldrs, MIT), всё остальное — framer-motion
 * поверх уже существующих токенов бренда.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 1650);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <motion.div
      className="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
      onClick={onDone}
      role="status"
      aria-label="ESMAR загружается"
    >
      <span className="splash__glow" aria-hidden />

      <div className="splash__mark">
        <motion.span
          className="splash__ring"
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.i
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          />
        </motion.span>

        <motion.span
          className="splash__glyph"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          <MarkEsmar size={86} />
        </motion.span>
      </div>

      <motion.div
        className="splash__word"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <LogoEsmar width={214} />
      </motion.div>

      <motion.p
        className="splash__tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.42 }}
      >
        Растим ваш капитал для будущего
      </motion.p>

      <motion.div
        className="splash__load"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        aria-hidden
      >
        <Ring size={30} stroke={2.4} speed={1.6} color="var(--brand-lit)" />
      </motion.div>

      <motion.span
        className="splash__bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.45, ease: [0.35, 0.9, 0.35, 1] }}
        aria-hidden
      />
    </motion.div>
  );
}
