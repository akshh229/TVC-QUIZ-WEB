// src/components/CategoryChip.tsx
import { CircleHelp, UserRound, Waypoints, Compass } from "lucide-react";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Category, typeof CircleHelp> = {
  quiz: CircleHelp,
  guess_leader: UserRound,
  match_pair: Waypoints,
  leadership_scenario: Compass,
};

const CATEGORY_STYLES: Record<Category, string> = {
  quiz: "bg-terracotta-soft text-terracotta",
  guess_leader: "bg-forest-soft text-forest",
  match_pair: "bg-marigold-soft text-ink",
  leadership_scenario: "bg-ink/8 text-ink",
};

interface CategoryChipProps {
  category: Category;
  className?: string;
}

export function CategoryChip({ category, className }: CategoryChipProps) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
        CATEGORY_STYLES[category],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export { CATEGORY_ICONS };
