import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for the stakeout scheduler.
 *
 * Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY at build time (the GitHub
 * Pages workflow injects them; Lovable preview reads them from the dashboard).
 * The publishable anon key is safe to ship in the bundle by design — RLS at
 * the database is the actual privacy gate (verified in supabase/README.md
 * EPIC 2.7).
 *
 * If the env vars are missing (e.g. local dev without `.env.local`), we fall
 * back to a stub that throws on use rather than crashing module load, so the
 * existing /, /map routes keep working without Supabase configured.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  cached = createClient(url, anonKey, {
    auth: {
      // Volunteer flow is anonymous; we never call auth.* from /stakeout/.
      // Admin (Phase D) uses magic-link sign-in and will opt back in there.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cached;
}

export const isSupabaseConfigured = Boolean(url && anonKey);

// Domain types — keep these in sync with supabase/migrations/0001_schema.sql
// and supabase/migrations/0002_views.sql.

export type Location = {
  id: string;
  external_id: string | null;
  name: string;
  category: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  priority: number;
};

export type SlotWithStatus = {
  id: string;
  location_id: string;
  location_name: string;
  category: string;
  location_priority: number;
  address: string | null;
  lat: number | null;
  lng: number | null;
  start_time: string;
  end_time: string;
  capacity: number;
  priority_tier: "critical" | "high" | "normal" | null;
  filled: number;
  spots_left: number;
  state: "open" | "full" | "gap";
};

export type SignupPublic = {
  id: string;
  slot_id: string;
  volunteer_label: string;
  status: string;
  created_at: string;
};

export type BookSlotResult = {
  id: string;
  slot_id: string;
  volunteer_name: string;
  volunteer_phone: string;
  status: string;
  created_at: string;
};
