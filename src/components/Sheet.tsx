import { motion, useDragControls } from "framer-motion";
import type { ReactNode } from "react";

export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const drag = useDragControls();
  return (
    <>
      <motion.div
        className="veil"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <div className="sheet-wrap">
        <motion.div
          className="sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.7 }}
          drag="y"
          dragListener={false}
          dragControls={drag}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.55 }}
          onDragEnd={(_, i) => {
            if (i.offset.y > 120 || i.velocity.y > 650) onClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="grip" onPointerDown={(e) => drag.start(e)} aria-hidden>
            <span />
          </div>
          <div className="sheet__b">{children}</div>
        </motion.div>
      </div>
    </>
  );
}
