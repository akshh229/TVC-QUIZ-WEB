// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when Supabase env vars are absent — the app runs on local seed data. */
export const isMockMode = !url || !anonKey;

let client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null in mock mode.
 * Lazily constructed so mock mode never touches the network.
 */
export function getSupabase(): SupabaseClient | null {
  if (isMockMode) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { persistSession: true },
    });
  }
  return client;
}

export const LEADER_IMAGES_BUCKET = "leader-images";
