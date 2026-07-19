// src/components/Logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Compact = wordmark only; full = wordmark + rule + club name lockup. */
  variant?: "compact" | "full";
}

/**
 * Typographic wordmark lockup for The Voyage Club.
 * Structured so an official logo image can replace the mark later
 * without touching consuming layouts.
 */
export function Logo({ className, variant = "full" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Mark placeholder: a compass-inspired ring. Swap for an <img> when the official logo arrives. */}
      <span
        aria-hidden="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink"
      >
        <span className="absolute h-full w-px bg-ink/25" />
        <span className="absolute h-px w-full bg-ink/25" />
        <span className="h-2 w-2 rotate-45 bg-terracotta" />
      </span>
      {variant === "full" ? (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-lg tracking-tight text-ink">The Voyage Club</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/50">
            Orientation &amp; Induction
          </span>
        </span>
      ) : (
        <span className="font-serif text-lg tracking-tight text-ink">The Voyage Club</span>
      )}
    </div>
  );
}
