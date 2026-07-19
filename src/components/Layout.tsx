// src/components/Layout.tsx
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { useIdleTimeout } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";

interface LayoutProps {
  children: ReactNode;
  /** Hide header logo (e.g., Welcome renders its own lockup). */
  hideHeader?: boolean;
}

/**
 * Participant kiosk layout: paper-grain ivory backdrop, idle timeout that
 * resets the whole session back to Welcome, and a subtle page transition.
 */
export function Layout({ children, hideHeader = false }: LayoutProps) {
  const location = useLocation();
  const resetSession = useGameStore((s) => s.resetSession);

  useIdleTimeout(() => {
    resetSession();
    window.location.assign("/");
  });

  return (
    <div className="paper-grain flex min-h-dvh flex-col bg-ivory">
      {!hideHeader && (
        <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
          <Logo variant="compact" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40">
            Orientation &amp; Induction
          </span>
        </header>
      )}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-1 flex-col"
      >
        {children}
      </motion.main>
    </div>
  );
}
