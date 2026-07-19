// src/pages/Result.tsx
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";

/** Restrained confetti: a brief burst of palette-coloured rectangles on canvas. */
function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#C96745", "#DDAA35", "#29473A", "#B9AA9A"];
    const pieces = Array.from({ length: 42 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 120,
      y: height * 0.35,
      vx: (Math.random() - 0.5) * 7,
      vy: -(4 + Math.random() * 6),
      w: 5 + Math.random() * 5,
      h: 8 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    }));

    let frame = 0;
    let raf = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.rot += p.vr;
        if (frame > 55) p.alpha = Math.max(0, p.alpha - 0.03);
        if (p.alpha > 0 && p.y < height + 20) alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive && frame < 180) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export default function Result() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const participantName = useGameStore((s) => s.participantName);
  const isCorrect = useGameStore((s) => s.isCorrect);
  const question = useGameStore((s) => s.currentQuestion);
  const resetSession = useGameStore((s) => s.resetSession);
  const setPhase = useGameStore((s) => s.setPhase);

  // Guard: arriving without a completed play → welcome.
  useEffect(() => {
    if (isCorrect === null || !participantName) navigate("/", { replace: true });
  }, [isCorrect, participantName, navigate]);

  const correctAnswerText = useMemo(() => {
    if (!question) return "";
    if (question.category === "match_pair") {
      return (question.pairs ?? [])
        .map((p) => `${p.left} — ${p.right}`)
        .join(" · ");
    }
    return question.correctAnswer ?? "";
  }, [question]);

  if (isCorrect === null || !participantName) return null;

  const handlePlayAgain = () => {
    const name = participantName;
    const dept = useGameStore.getState().department;
    resetSession();
    // Keep the same player, jump straight back to the wheel.
    useGameStore.getState().setParticipant(name, dept);
    navigate("/spin");
  };

  const handleFinish = () => {
    setPhase("finished");
    navigate("/thank-you");
  };

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center sm:px-10">
      {isCorrect && !prefersReducedMotion && <ConfettiBurst />}

      {/* Warm radial highlight behind the headline on success */}
      {isCorrect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marigold/20 blur-3xl"
        />
      )}

      <motion.div
        initial={isCorrect ? { opacity: 0, scale: 0.94 } : { opacity: 0 }}
        animate={isCorrect ? { opacity: 1, scale: 1 } : { opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <span
          className={
            isCorrect
              ? "text-xs font-semibold uppercase tracking-[0.22em] text-terracotta"
              : "text-xs font-semibold uppercase tracking-[0.22em] text-ink/45"
          }
        >
          {isCorrect ? "Well played" : "Keep going"}
        </span>

        <h1 className="mt-4 font-serif text-5xl leading-tight text-ink sm:text-6xl">
          {isCorrect ? "That was a strong call." : "Good attempt."}
        </h1>

        {isCorrect ? (
          <>
            <p className="mt-5 text-lg text-ink/70">Congratulations, {participantName}.</p>
            <p className="mt-2 font-serif text-3xl text-terracotta">You earned 10 points.</p>
            <p className="mt-6 max-w-md text-balance text-sm italic text-ink/50">
              Leadership starts with curiosity, courage, and action.
            </p>
          </>
        ) : (
          <>
            {correctAnswerText && (
              <div className="mt-6 max-w-lg rounded-md border border-ink/10 bg-card px-6 py-4 shadow-card">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">
                  The correct answer
                </span>
                <p className="mt-1.5 text-balance font-medium leading-relaxed text-ink">
                  {correctAnswerText}
                </p>
              </div>
            )}
            <p className="mt-6 max-w-md text-balance text-sm italic text-ink/50">
              Every great leader keeps learning.
            </p>
          </>
        )}

        {question?.explanation && (
          <p className="mt-4 max-w-lg text-balance text-sm leading-relaxed text-ink/55">
            {question.explanation}
          </p>
        )}

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={handlePlayAgain} className="px-10">
            Play again
          </Button>
          <Button size="lg" variant="outline" onClick={handleFinish} className="px-10">
            Finish
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
