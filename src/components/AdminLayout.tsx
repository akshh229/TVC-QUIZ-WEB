// src/components/AdminLayout.tsx
import { useEffect, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Image,
  Users,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useAdminStore } from "@/store/adminStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/questions", label: "Questions", icon: ListChecks },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/participants", label: "Participants", icon: Users },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

/**
 * Admin layout: sidebar navigation + session guard. Redirects to /admin
 * when the session is missing or has exceeded the 30-minute inactivity window.
 * Completely isolated from the participant kiosk chrome.
 */
export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const navigate = useNavigate();
  const checkSession = useAdminStore((s) => s.checkSession);
  const touch = useAdminStore((s) => s.touch);
  const logout = useAdminStore((s) => s.logout);

  useEffect(() => {
    if (!checkSession()) {
      navigate("/admin", { replace: true });
      return;
    }
    // Refresh the inactivity window on any interaction.
    const onActivity = () => {
      if (!checkSession()) {
        navigate("/admin", { replace: true });
      } else {
        touch();
      }
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    // Also poll so an idle tab expires without needing interaction.
    const interval = setInterval(() => {
      if (!checkSession()) navigate("/admin", { replace: true });
    }, 60_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(interval);
    };
  }, [checkSession, touch, navigate]);

  return (
    <div className="flex min-h-dvh bg-ivory">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-card px-4 py-6 md:flex">
        <Logo variant="compact" className="px-2" />
        <span className="mt-1 px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40">
          Admin console
        </span>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ink text-ivory"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-ink/10 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open kiosk
          </a>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/admin", { replace: true });
            }}
            className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta-soft"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-ink/10 bg-card px-4 py-3 md:hidden">
          <Logo variant="compact" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/admin", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </header>
        <nav
          className="flex gap-1 overflow-x-auto border-b border-ink/10 bg-card px-4 py-2 md:hidden"
          aria-label="Admin navigation"
        >
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                  isActive ? "bg-ink text-ivory" : "text-ink/70 hover:bg-ink/5"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-serif text-3xl text-ink">{title}</h1>
            {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
