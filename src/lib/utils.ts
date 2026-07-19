// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";

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
const DEFAULT_WARNING_MS = 10_000;

export function getIdleTimeoutMs(): number {
  const raw = import.meta.env.VITE_KIOSK_IDLE_TIMEOUT_MS as string | undefined;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_IDLE_TIMEOUT_MS;
}

interface IdleTimeoutCallbacks {
  /** Called when the warning phase begins (timeoutMs − warningMs elapsed). */
  onWarn: () => void;
  /** Called when the full timeout elapses without activity. */
  onIdle: () => void;
  /** Called when user activity dismisses the warning phase. */
  onDismiss: () => void;
}

/**
 * Two-phase kiosk idle timeout.
 *
 * Phase 1 (silent): after `timeoutMs − warningMs` of inactivity, calls `onWarn`.
 * Phase 2 (warning): after an additional `warningMs`, calls `onIdle`.
 *
 * Any user activity during either phase resets back to the start of phase 1
 * and calls `onDismiss` (so the warning overlay can hide itself).
 */
export function useIdleTimeout(
  callbacks: IdleTimeoutCallbacks,
  timeoutMs?: number,
  warningMs: number = DEFAULT_WARNING_MS,
): void {
  const warnTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const total = timeoutMs ?? getIdleTimeoutMs();
    const warnAfter = Math.max(total - warningMs, 0);

    const reset = () => {
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      callbacksRef.current.onDismiss();

      warnTimerRef.current = setTimeout(() => {
        callbacksRef.current.onWarn();
        idleTimerRef.current = setTimeout(() => {
          callbacksRef.current.onIdle();
        }, warningMs);
      }, warnAfter);
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
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeoutMs, warningMs]);
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
