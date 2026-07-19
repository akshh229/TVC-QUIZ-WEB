// src/components/IdleWarningOverlay.tsx
import { motion } from "framer-motion";

interface IdleWarningOverlayProps {
  /** Duration of the warning countdown in ms (drives the CSS animation). */
  durationMs?: number;
}

/**
 * Full-screen overlay with a 10-second countdown ring.
 *
 * Shown by Layout when the idle timer enters its warning phase. Tapping
 * anywhere on the page resets the idle timer (handled by `useIdleTimeout`
 * in the parent), which in turn sets `visible={false}` via `onDismiss`.
 *
 * The countdown ring is a pure CSS `conic-gradient` animation — no JS
 * interval needed.
 */
export function IdleWarningOverlay({ durationMs = 10_000 }: IdleWarningOverlayProps) {
  const durationS = durationMs / 1000;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
      aria-live="assertive"
      role="alertdialog"
      aria-label="Inactivity warning — tap anywhere to continue"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 rounded-lg border border-ink/10 bg-card px-10 py-10 shadow-lifted sm:px-14"
      >
        {/* Countdown ring */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Background ring */}
          <div className="absolute inset-0 rounded-full border-4 border-ink/10" />
          {/* Animated ring — fills from 0% to 100% over the warning duration */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="hsl(15 55% 53%)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36}`}
              style={{
                animation: `idle-ring-fill ${durationS}s linear forwards`,
              }}
            />
          </svg>
          <span className="relative text-2xl font-semibold text-ink" aria-hidden="true">
            ?
          </span>
        </div>

        <div className="text-center">
          <p className="font-serif text-xl text-ink">Still playing?</p>
          <p className="mt-1.5 text-sm text-ink/55">
            Tap anywhere to continue
          </p>
        </div>

        <button
          type="button"
          className="h-14 rounded-md bg-ink px-10 text-base font-medium text-ivory shadow-card transition-all duration-150 hover:bg-ink/90 hover:shadow-lifted active:translate-y-px"
        >
          Yes, I'm here
        </button>
      </motion.div>

      {/* Keyframe for the countdown ring */}
      <style>{`
        @keyframes idle-ring-fill {
          from { stroke-dashoffset: ${2 * Math.PI * 36}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </motion.div>
  );
}
