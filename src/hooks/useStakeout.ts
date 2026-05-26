import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import {
  getSupabase,
  isSupabaseConfigured,
  type BookSlotResult,
  type Location,
  type SignupPublic,
  type SlotWithStatus,
} from "@/lib/supabase";

const STAKEOUT_LOOKAHEAD_HOURS = 48;

// Supabase projects ship with PostgREST's `db-max-rows` set to 1000 by
// default, and that ceiling is enforced server-side regardless of what the
// client passes to `.range()`. To fetch the full 1,300+ slot result set
// (56 locations × 12 windows × 2 days) we have to page in 1k chunks until
// we get back fewer rows than we asked for. Caps out at 50k rows total so
// a runaway query can't loop forever.
const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBuilder = PostgrestFilterBuilder<any, any, any, any, any>;

async function fetchAllPages<T>(build: () => AnyBuilder): Promise<T[]> {
  const out: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await build().range(from, to);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) return out;
  }
  return out;
}

export const stakeoutKeys = {
  all: ["stakeout"] as const,
  locations: () => [...stakeoutKeys.all, "locations"] as const,
  slots: (lookaheadHours: number) => [...stakeoutKeys.all, "slots", lookaheadHours] as const,
  signups: () => [...stakeoutKeys.all, "signups"] as const,
};

export function useLocations() {
  return useQuery({
    queryKey: stakeoutKeys.locations(),
    enabled: isSupabaseConfigured,
    staleTime: 60 * 60 * 1000, // locations rarely change
    queryFn: async (): Promise<Location[]> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("locations")
        .select("id, external_id, name, category, address, lat, lng, priority")
        .order("priority", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Location[];
    },
  });
}

export function useUpcomingSlots(lookaheadHours = STAKEOUT_LOOKAHEAD_HOURS) {
  return useQuery({
    queryKey: stakeoutKeys.slots(lookaheadHours),
    enabled: isSupabaseConfigured,
    staleTime: 30 * 1000, // slot counts change as people book
    refetchInterval: 60 * 1000,
    queryFn: async (): Promise<SlotWithStatus[]> => {
      const supabase = getSupabase();
      const now = new Date();
      const horizon = new Date(now.getTime() + lookaheadHours * 60 * 60 * 1000);
      return fetchAllPages<SlotWithStatus>(() =>
        supabase
          .from("slots_with_status")
          .select(
            "id, location_id, location_name, category, location_priority, address, lat, lng, start_time, end_time, capacity, priority_tier, filled, spots_left, state",
          )
          .gte("start_time", now.toISOString())
          .lte("start_time", horizon.toISOString())
          .order("start_time", { ascending: true }),
      );
    },
  });
}

export function useSignups(slotIds: string[]) {
  return useQuery({
    queryKey: [...stakeoutKeys.signups(), [...slotIds].sort().join(",")],
    enabled: isSupabaseConfigured && slotIds.length > 0,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    queryFn: async (): Promise<SignupPublic[]> => {
      const supabase = getSupabase();
      return fetchAllPages<SignupPublic>(() =>
        supabase
          .from("signups_public")
          .select("id, slot_id, volunteer_label, status, created_at")
          .in("slot_id", slotIds)
          .order("created_at", { ascending: true }),
      );
    },
  });
}

export type BookSlotArgs = {
  slotId: string;
  name: string;
  phone: string;
};

export function useBookSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slotId, name, phone }: BookSlotArgs): Promise<BookSlotResult> => {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("book_slot", {
        p_slot_id: slotId,
        p_name: name,
        p_phone: phone,
      });
      if (error) {
        // book_slot raises SLOT_FULL / SLOT_NOT_FOUND / INVALID_INPUT via plpgsql,
        // which surfaces as a `message` like "SLOT_FULL". Re-throw with that
        // sentinel so the form can show a useful message.
        throw new Error(error.message || "BOOK_FAILED");
      }
      return data as BookSlotResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stakeoutKeys.all });
    },
  });
}
