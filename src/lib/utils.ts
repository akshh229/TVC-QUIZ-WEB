// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fisher–Yates shuffle (non-mutating). */
export function shuffle<T>(array: readonly T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/** Escape a value for a CSV cell. */
function csvCell(value: unknown): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build and download a CSV file from rows of objects. */
export function exportCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns: { key: keyof T; header: string }[]
): void {
  const header = columns.map((c) => csvCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvCell(row[c.key])).join(","))
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const DEFAULT_IDLE_TIMEOUT_MS = 120_000;

export function getIdleTimeoutMs(): number {
  const raw = import.meta.env.VITE_KIOSK_IDLE_TIMEOUT_MS as string | undefined;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_IDLE_TIMEOUT_MS;
}

/**
 * Kiosk idle timeout: after `timeoutMs` of no interaction, run `onIdle`
 * (default: navigate to the Welcome screen). Activity = pointer, key, touch.
 */
export function useIdleTimeout(onIdle?: () => void, timeoutMs?: number): void {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    const ms = timeoutMs ?? getIdleTimeoutMs();
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onIdleRef.current) onIdleRef.current();
        else navigate("/");
      }, ms);
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "pointermove",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [navigate, timeoutMs]);
}

/** Recently-seen question IDs, kept in sessionStorage to avoid quick repeats. */
const SEEN_KEY = "spin-to-lead-seen-questions";
const SEEN_LIMIT = 24;

export function getSeenQuestionIds(): string[] {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markQuestionSeen(id: string): void {
  try {
    const seen = getSeenQuestionIds().filter((s) => s !== id);
    seen.push(id);
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-SEEN_LIMIT)));
  } catch {
    // sessionStorage unavailable — repeats are acceptable
  }
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
