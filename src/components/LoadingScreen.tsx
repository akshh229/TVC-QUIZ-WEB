// src/components/LoadingScreen.tsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface LoadingScreenProps {
  /** How long the loader stays before fading out (ms). */
  duration?: number;
}

/**
 * Full-screen boat-logo loader shown on each page entry. The cover is a
 * white-background JPEG, so `mix-blend-mode: multiply` drops the white and
 * lets only the artwork sit on the ivory backdrop — no transparent asset
 * needed. The logo bobs like a boat on a swell while a hairline progress
 * bar fills, then the whole screen fades away.
 */
export function LoadingScreen({ duration = 1400 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="paper-grain fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <motion.img
            src="/the_voyage_club_chandigarh_university_cover.jpg"
            alt=""
            className="w-full max-w-md select-none px-8 object-contain mix-blend-multiply"
            draggable={false}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 0, 6, 0],
              rotate: [0, 1.2, 0, -1.2, 0],
            }}
            transition={{
              opacity: { duration: 0.5, ease: "easeOut" },
              scale: { duration: 0.5, ease: "easeOut" },
              y: { duration: 4, ease: "easeInOut", repeat: Infinity },
              rotate: { duration: 4, ease: "easeInOut", repeat: Infinity },
            }}
          />

          {/* hairline progress bar */}
          <div className="mt-10 h-0.5 w-40 overflow-hidden rounded-full bg-ink/10">
            <motion.div
              className="h-full bg-terracotta"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
