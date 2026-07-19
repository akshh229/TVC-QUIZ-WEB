// src/pages/admin/AdminLogin.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAdminStore } from "@/store/adminStore";
import { getSupabase, isMockMode } from "@/lib/supabase";

const ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || "voyage-admin";

/**
 * Admin login. Two paths:
 * - Password mode (default): checks VITE_ADMIN_PASSWORD locally. Works in
 *   both mock and Supabase modes — this is the event-day path.
 * - Supabase Auth mode: if an email is entered alongside the password and
 *   Supabase is configured, tries email/password sign-in instead.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const login = useAdminStore((s) => s.login);
  const checkSession = useAdminStore((s) => s.checkSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in → straight to dashboard.
  useEffect(() => {
    if (checkSession()) navigate("/admin/dashboard", { replace: true });
  }, [checkSession, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (email.trim() && supabase) {
        // Supabase Auth path
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) {
          setError("Sign-in failed. Check the email and password.");
          return;
        }
        login();
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      // Password-only path
      if (password === ADMIN_PASSWORD) {
        login();
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("That password isn't right. Try again.");
      }
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="paper-grain flex min-h-dvh flex-col items-center justify-center bg-ivory px-6">
      <main className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo variant="compact" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40">
            Admin console
          </span>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-lg border border-ink/10 bg-card p-8 shadow-card"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5">
              <Lock className="h-4 w-4 text-ink/60" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-serif text-xl text-ink">Sign in</h1>
              <p className="text-xs text-ink/50">
                {isMockMode ? "Demo mode — password only" : "Password or Supabase account"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {!isMockMode && (
              <div className="space-y-2">
                <Label htmlFor="admin-email">
                  Email{" "}
                  <span className="text-xs font-normal text-ink/40">
                    (optional — leave empty for password mode)
                  </span>
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@voyageclub.in"
                  autoComplete="username"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            {error && (
              <p id="login-error" className="text-sm text-terracotta" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" className="mt-7 w-full" disabled={busy || !password}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">
          <a href="/" className="underline-offset-4 hover:underline">
            ← Back to the kiosk
          </a>
        </p>
      </main>
    </div>
  );
}
