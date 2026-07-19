// src/pages/Welcome.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useGameStore } from "@/store/gameStore";

/** Decorative compass/wheel line art — pure SVG, right-side focal point. */
function CompassMotif() {
  return (
    <svg
      viewBox="0 0 560 560"
      className="h-full w-full"
      aria-hidden="true"
      fill="none"
    >
      {/* concentric circular paths */}
      <circle cx="280" cy="280" r="258" stroke="hsl(30 7% 11% / 0.10)" strokeWidth="1" />
      <circle cx="280" cy="280" r="212" stroke="hsl(30 7% 11% / 0.14)" strokeWidth="1" strokeDasharray="2 7" />
      <circle cx="280" cy="280" r="164" stroke="hsl(15 55% 53% / 0.35)" strokeWidth="1.5" />
      <circle cx="280" cy="280" r="112" stroke="hsl(30 7% 11% / 0.16)" strokeWidth="1" />
      {/* quadrant ticks */}
      <g stroke="hsl(30 7% 11% / 0.35)" strokeWidth="1.5">
        <line x1="280" y1="10" x2="280" y2="34" />
        <line x1="280" y1="526" x2="280" y2="550" />
        <line x1="10" y1="280" x2="34" y2="280" />
        <line x1="526" y1="280" x2="550" y2="280" />
      </g>
      {/* wheel quarters hinted with arcs */}
      <path
        d="M 280 168 A 112 112 0 0 1 392 280"
        stroke="hsl(42 71% 54% / 0.8)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 168 280 A 112 112 0 0 1 280 168"
        stroke="hsl(154 27% 22% / 0.5)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* compass needle */}
      <g transform="rotate(38 280 280)">
        <path d="M280 214 L292 280 L280 346 L268 280 Z" fill="hsl(15 55% 53%)" opacity="0.9" />
        <circle cx="280" cy="280" r="7" fill="hsl(30 7% 11%)" />
        <circle cx="280" cy="280" r="3" fill="hsl(39 44% 94%)" />
      </g>
    </svg>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const resetSession = useGameStore((s) => s.resetSession);

  const handleStart = () => {
    resetSession();
    navigate("/participant");
  };

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pb-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Editorial left column */}
        <div className="flex flex-col items-start pt-6 lg:pt-0">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta"
          >
            The Voyage Club presents
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="mt-4 font-serif text-6xl leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-8xl"
          >
            Spin to
            <br />
            <span className="italic text-terracotta">Lead.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mt-6 max-w-md text-balance text-lg leading-relaxed text-ink/65"
          >
            Take a quick challenge. Test your instincts. Begin your leadership
            journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mt-10"
          >
            <Button size="lg" onClick={handleStart} className="group px-10 text-base">
              Start the game
              <ArrowRight
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 text-sm italic text-ink/45"
          >
            Every leader starts with one bold step.
          </motion.p>
        </div>

        {/* Right focal motif */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto hidden aspect-square w-full max-w-md lg:block"
        >
          <CompassMotif />
        </motion.div>
      </section>

      <footer className="flex items-center justify-between px-6 pb-6 sm:px-10">
        <span className="text-xs text-ink/40">A Voyage Club Experience</span>
        <Logo variant="compact" className="opacity-0 lg:opacity-100 [&_span:first-child]:h-6 [&_span:first-child]:w-6" />
      </footer>
    </div>
  );
}
