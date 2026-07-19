// src/pages/ThankYou.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

        {/* Community QR codes */}
        <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-40 w-40 overflow-hidden rounded-lg border border-ink/12 bg-card shadow-card sm:h-44 sm:w-44">
              <img
                src="/leader-images/whatsapp.png"
                alt="WhatsApp QR code for joining The Voyage Club 2026–27 group"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-ink/55">Join our WhatsApp group</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-40 w-40 overflow-hidden rounded-lg border border-ink/12 bg-card shadow-card sm:h-44 sm:w-44">
              <img
                src="/leader-images/insta.png"
                alt="Instagram QR code for The Voyage Club"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-ink/55">Follow @the.voyage.cu</span>
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
