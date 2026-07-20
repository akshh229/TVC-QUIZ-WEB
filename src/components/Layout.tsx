// src/components/Layout.tsx
import { useCallback, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { IdleWarningOverlay } from "./IdleWarningOverlay";
import { useIdleTimeout } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import myBharat from "@/brand/my-bharat.png";
import youthAffairs from "@/brand/youth-affairs-sports.png";
import chandigarhUniversity from "@/brand/chandigarh-university.webp";

interface LayoutProps {
  children: ReactNode;
  /** Hide header logo (e.g., Welcome renders its own lockup). */
  hideHeader?: boolean;
}

/**
 * Participant kiosk layout: paper-grain ivory backdrop, two-phase idle
 * timeout (warning overlay → session reset), and a subtle page transition.
 */
export function Layout({ children, hideHeader = false }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const resetSession = useGameStore((s) => s.resetSession);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const handleWarn = useCallback(() => setShowIdleWarning(true), []);
  const handleDismiss = useCallback(() => setShowIdleWarning(false), []);
  const handleIdle = useCallback(() => {
    setShowIdleWarning(false);
    resetSession();
    navigate("/");
  }, [resetSession, navigate]);

  useIdleTimeout({ onWarn: handleWarn, onIdle: handleIdle, onDismiss: handleDismiss });

  return (
    <div className="paper-grain relative flex min-h-dvh flex-col">
      {/* Partner logo strip — sits above all page content, site-wide */}
      <div className="relative z-10 flex items-center justify-center gap-6 border-b border-ink/10 bg-card-surface/70 px-6 py-3 backdrop-blur-sm sm:gap-10 sm:px-10">
        <img
          src={myBharat}
          alt="MY Bharat"
          className="h-10 w-auto object-contain sm:h-12"
        />
        <img
          src={youthAffairs}
          alt="Ministry of Youth Affairs & Sports"
          className="h-10 w-auto object-contain sm:h-12"
        />
        <img
          src={chandigarhUniversity}
          alt="Chandigarh University"
          className="h-10 w-auto object-contain sm:h-12"
        />
      </div>
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

      {/* Idle warning overlay */}
      <AnimatePresence>
        {showIdleWarning && <IdleWarningOverlay />}
      </AnimatePresence>
    </div>
  );
}

