import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSupabase,
  isSupabaseConfigured,
  type BookSlotResult,
  type Location,
  type SignupPublic,
  type SlotWithStatus,
} from "@/lib/supabase";

const STAKEOUT_LOOKAHEAD_HOURS = 48;

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
      // Supabase REST caps responses at 1000 rows by default. 56 locations ×
      // 12 two-hour windows × 2 days = 1,344 slots fits comfortably under 5000,
      // and gives us headroom if the lookahead grows. Without this the page
      // silently truncates ~25% of the next-48-hours window.
      const { data, error } = await supabase
        .from("slots_with_status")
        .select(
          "id, location_id, location_name, category, location_priority, address, lat, lng, start_time, end_time, capacity, priority_tier, filled, spots_left, state",
        )
        .gte("start_time", now.toISOString())
        .lte("start_time", horizon.toISOString())
        .order("start_time", { ascending: true })
        .range(0, 4999);
      if (error) throw error;
      return (data ?? []) as SlotWithStatus[];
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
      // Same 1000-row cap concern as useUpcomingSlots: at capacity=2 per slot,
      // a fully-booked 48h window across 56 locations is 56 × 12 × 2 × 2 ≈ 2,700
      // signups, which would silently truncate under the default cap.
      const { data, error } = await supabase
        .from("signups_public")
        .select("id, slot_id, volunteer_label, status, created_at")
        .in("slot_id", slotIds)
        .order("created_at", { ascending: true })
        .range(0, 4999);
      if (error) throw error;
      return (data ?? []) as SignupPublic[];
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
