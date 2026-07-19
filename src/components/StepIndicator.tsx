// src/components/StepIndicator.tsx
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  current: 1 | 2 | 3;
  total?: number;
  className?: string;
}

export function StepIndicator({ current, total = 3, className }: StepIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-label={`Step ${current} of ${total}`}
    >
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink/50">
        Step {current} of {total}
      </span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i + 1 === current
                ? "w-6 bg-terracotta"
                : i + 1 < current
                  ? "w-1.5 bg-terracotta/50"
                  : "w-1.5 bg-ink/15"
            )}
          />
        ))}
      </span>
    </div>
  );
}
