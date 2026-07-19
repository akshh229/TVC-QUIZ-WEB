// src/store/adminStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Admin session expires after 30 minutes of inactivity. */
export const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface AdminState {
  isAuthenticated: boolean;
  lastActivityAt: number;
  login: () => void;
  logout: () => void;
  touch: () => void;
  /** Returns true if the session is valid; logs out and returns false when expired. */
  checkSession: () => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      lastActivityAt: 0,
      login: () => set({ isAuthenticated: true, lastActivityAt: Date.now() }),
      logout: () => set({ isAuthenticated: false, lastActivityAt: 0 }),
      touch: () => {
        if (get().isAuthenticated) set({ lastActivityAt: Date.now() });
      },
      checkSession: () => {
        const { isAuthenticated, lastActivityAt } = get();
        if (!isAuthenticated) return false;
        if (Date.now() - lastActivityAt > ADMIN_SESSION_TIMEOUT_MS) {
          set({ isAuthenticated: false, lastActivityAt: 0 });
          return false;
        }
        return true;
      },
    }),
    {
      name: "spin-to-lead-admin",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
