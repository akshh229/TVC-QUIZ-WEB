// src/pages/Spin.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StepIndicator } from "@/components/StepIndicator";
import { WheelSpinner } from "@/components/WheelSpinner";
import { CategoryChip } from "@/components/CategoryChip";
import { useGameStore } from "@/store/gameStore";
import type { Category } from "@/lib/types";

export default function Spin() {
  const navigate = useNavigate();
  const participantName = useGameStore((s) => s.participantName);
  const setCategory = useGameStore((s) => s.setCategory);

  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  // Guard: no name → back to details.
  useEffect(() => {
    if (!participantName) navigate("/participant", { replace: true });
  }, [participantName, navigate]);

  const handleSelected = (category: Category) => {
    setSelected(category);
    // Show the "Selected: …" beat for ~900ms, then continue.
    setTimeout(() => {
      setCategory(category);
      navigate("/challenge");
    }, 900);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 pb-10 sm:px-10">
      <div className="flex w-full flex-col items-center text-center">
        <StepIndicator current={2} />
        <h1 className="mt-5 font-serif text-4xl text-ink sm:text-5xl">
          Your challenge awaits.
        </h1>
        <p className="mt-3 max-w-md text-ink/60">
          Spin the wheel and let chance choose your leadership challenge.
        </p>
        {participantName && (
          <p className="mt-2 text-sm italic text-ink/45">Ready, {participantName}?</p>
        )}
      </div>

      <div className="relative mt-8 w-full">
        <WheelSpinner
          spinning={spinning}
          onSpinStart={() => setSpinning(true)}
          onSelected={handleSelected}
        />

        {/* Selected overlay beat */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-30 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3 rounded-lg border border-ink/10 bg-card/95 px-10 py-8 shadow-lifted backdrop-blur-sm">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
                  Selected
                </span>
                <CategoryChip category={selected} className="scale-125" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
