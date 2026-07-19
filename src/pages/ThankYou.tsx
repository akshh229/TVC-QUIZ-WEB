// src/pages/ThankYou.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";

export default function ThankYou() {
  const navigate = useNavigate();
  const resetSession = useGameStore((s) => s.resetSession);

  const handleRestart = () => {
    resetSession();
    navigate("/");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
          The Voyage Club
        </span>
        <h1 className="mt-4 font-serif text-5xl leading-tight text-ink sm:text-6xl">
          Thank you for taking the lead.
        </h1>
        <p className="mt-5 max-w-md text-balance text-lg text-ink/65">
          Visit The Voyage Club stall to discover more.
        </p>

        {/* QR + follow placeholders — swap in real assets before the event */}
        <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-36 w-36 items-center justify-center rounded-lg border border-dashed border-ink/25 bg-card"
              role="img"
              aria-label="QR code placeholder — scan to join The Voyage Club"
            >
              <QrCode className="h-14 w-14 text-ink/25" strokeWidth={1.25} aria-hidden="true" />
            </div>
            <span className="text-xs text-ink/45">Scan to join</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink/25 bg-card">
              <Instagram className="h-10 w-10 text-ink/25" strokeWidth={1.25} aria-hidden="true" />
              <span className="text-xs font-medium text-ink/35">@thevoyageclub</span>
            </div>
            <span className="text-xs text-ink/45">Follow us</span>
          </div>
        </div>

        <Button size="lg" onClick={handleRestart} className="mt-14 px-12">
          Start a new game
        </Button>
        <p className="mt-6 text-xs text-ink/40">A Voyage Club Experience</p>
      </motion.div>
    </div>
  );
}
