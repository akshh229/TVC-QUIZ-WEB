// src/components/WheelSpinner.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { CircleHelp, UserRound, Waypoints, Compass } from "lucide-react";
import type { Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

interface WheelSpinnerProps {
  onSelected: (category: Category) => void;
  spinning: boolean;
  onSpinStart: () => void;
}

interface SegmentDef {
  category: Category;
  label: string;
  fill: string;
  text: string;
  icon: typeof CircleHelp;
}

/** Wheel segments in clockwise order starting at the top. */
const SEGMENTS: SegmentDef[] = [
  {
    category: "quiz",
    label: CATEGORY_LABELS.quiz,
    fill: "hsl(15 55% 53%)", // terracotta
    text: "hsl(43 100% 99%)",
    icon: CircleHelp,
  },
  {
    category: "guess_leader",
    label: CATEGORY_LABELS.guess_leader,
    fill: "hsl(154 27% 22%)", // forest
    text: "hsl(43 100% 99%)",
    icon: UserRound,
  },
  {
    category: "match_pair",
    label: CATEGORY_LABELS.match_pair,
    fill: "hsl(42 71% 54%)", // marigold
    text: "hsl(30 7% 11%)",
    icon: Waypoints,
  },
  {
    category: "leadership_scenario",
    label: CATEGORY_LABELS.leadership_scenario,
    fill: "hsl(30 7% 11%)", // ink
    text: "hsl(39 44% 94%)",
    icon: Compass,
  },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const R = 220; // wheel radius in viewBox units
const CX = 240;
const CY = 240;

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  // 0° = top, clockwise positive
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function segmentPath(index: number): string {
  const start = index * SEGMENT_ANGLE;
  const end = start + SEGMENT_ANGLE;
  const p1 = polar(start, R);
  const p2 = polar(end, R);
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y} Z`;
}

/** Play a very short, quiet click via Web Audio (no asset needed). */
function useTicker() {
  const ctxRef = useRef<AudioContext | null>(null);
  return () => {
    try {
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return;
      ctxRef.current ??= new Ctor();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 1800;
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio unavailable — ticks are purely decorative
    }
  };
}

export function WheelSpinner({ onSelected, spinning, onSpinStart }: WheelSpinnerProps) {
  const rotation = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const tick = useTicker();
  const lastSegmentRef = useRef(0);
  const [pointerBounce, setPointerBounce] = useState(false);
  const onSelectedRef = useRef(onSelected);
  onSelectedRef.current = onSelected;

  // Cleanup any running animation on unmount.
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  useEffect(() => () => animRef.current?.stop(), []);

  const spin = () => {
    if (spinning) return;
    onSpinStart();

    // Fair random pick.
    const index = Math.floor(Math.random() * SEGMENTS.length);
    const chosen = SEGMENTS[index];

    // The pointer sits at the top (0°). Rotating the wheel by `rot` moves
    // segment-local angle a to (a + rot) mod 360. Land the chosen segment's
    // centre at the top: rot ≡ -(centre) mod 360, plus 4–6 full turns and a
    // little in-segment jitter so stops don't look identical.
    const centre = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.6);
    const turns = 4 + Math.floor(Math.random() * 3); // 4–6 turns
    const current = rotation.get();
    const base = current - (current % 360); // keep monotonic
    const target = base + turns * 360 + (360 - centre) + jitter;

    if (prefersReducedMotion) {
      rotation.set(target);
      onSelectedRef.current(chosen.category);
      return;
    }

    const duration = 4.2 + Math.random() * 1.4; // 4.2–5.6s
    animRef.current = animate(rotation, target, {
      duration,
      ease: [0.12, 0.6, 0.04, 1], // fast start, long physical tail
      onUpdate: (latest) => {
        // Tick when the pointer crosses a segment boundary.
        const seg = Math.floor(((latest % 360) + 360) % 360 / SEGMENT_ANGLE);
        if (seg !== lastSegmentRef.current) {
          lastSegmentRef.current = seg;
          tick();
          setPointerBounce(true);
          setTimeout(() => setPointerBounce(false), 80);
        }
      },
      onComplete: () => {
        onSelectedRef.current(chosen.category);
      },
    });
  };

  const paths = useMemo(() => SEGMENTS.map((_, i) => segmentPath(i)), []);

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* Fixed pointer */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
        style={{
          transform: `translateX(-50%) translateY(${pointerBounce ? "2px" : "0px"})`,
          transition: "transform 80ms ease-out",
        }}
      >
        <svg width="36" height="30" viewBox="0 0 36 30">
          <path d="M18 30 L4 4 Q18 -4 32 4 Z" fill="hsl(30 7% 11%)" />
          <path d="M18 24 L9.5 7.5 Q18 3 26.5 7.5 Z" fill="hsl(39 44% 94%)" />
        </svg>
      </div>

      {/* Wheel */}
      <div className="relative aspect-square w-full rounded-full shadow-lifted">
        <motion.svg
          viewBox="0 0 480 480"
          className="h-full w-full"
          style={{ rotate: rotation }}
          role="img"
          aria-label="Challenge wheel with four categories: Quiz Challenge, Guess the Leader, Match the Pair, Leadership Scenario"
        >
          {/* outer ring */}
          <circle cx={CX} cy={CY} r={R + 12} fill="hsl(43 100% 99%)" />
          <circle
            cx={CX}
            cy={CY}
            r={R + 12}
            fill="none"
            stroke="hsl(30 7% 11% / 0.12)"
            strokeWidth="1.5"
          />
          {SEGMENTS.map((seg, i) => (
            <path
              key={seg.category}
              d={paths[i]}
              fill={seg.fill}
              stroke="hsl(43 100% 99%)"
              strokeWidth="4"
            />
          ))}
          {/* segment labels + icons, oriented along each segment's centre */}
          {SEGMENTS.map((seg, i) => {
            const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            const labelPos = polar(angle, R * 0.68);
            const iconPos = polar(angle, R * 0.42);
            const Icon = seg.icon;
            const words = seg.label.split(" ");
            return (
              <g key={`label-${seg.category}`}>
                <g
                  transform={`translate(${iconPos.x - 16}, ${iconPos.y - 16})`}
                  color={seg.text}
                >
                  <Icon width={32} height={32} strokeWidth={1.75} />
                </g>
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  transform={`rotate(${angle}, ${labelPos.x}, ${labelPos.y})`}
                  fill={seg.text}
                  fontSize="19"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {words.length > 2 ? (
                    <>
                      <tspan x={labelPos.x} dy="-0.35em">
                        {words.slice(0, -1).join(" ")}
                      </tspan>
                      <tspan x={labelPos.x} dy="1.15em">
                        {words[words.length - 1]}
                      </tspan>
                    </>
                  ) : (
                    <>
                      <tspan x={labelPos.x} dy="-0.35em">{words[0]}</tspan>
                      <tspan x={labelPos.x} dy="1.15em">{words.slice(1).join(" ")}</tspan>
                    </>
                  )}
                </text>
              </g>
            );
          })}
          {/* hub */}
          <circle cx={CX} cy={CY} r="42" fill="hsl(43 100% 99%)" />
          <circle cx={CX} cy={CY} r="42" fill="none" stroke="hsl(30 7% 11% / 0.15)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r="8" fill="hsl(15 55% 53%)" />
        </motion.svg>
      </div>

      {/* Spin control */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-12 text-base font-medium text-ivory shadow-card transition-all duration-150 hover:bg-ink/90 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
          aria-label={spinning ? "Wheel is spinning" : "Spin the wheel"}
        >
          {spinning ? "Spinning…" : "Spin the wheel"}
        </button>
      </div>
    </div>
  );
}
