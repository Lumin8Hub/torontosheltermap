import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ExternalLink, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBookSlot } from "@/hooks/useStakeout";
import type { Location, SlotWithStatus } from "@/lib/supabase";
import type { LocationAvailability } from "./StakeoutMap";

// ── Helpers ────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<
  number,
  { label: string; blurb: string; pillBg: string; pillText: string }
> = {
  1: {
    label: "Highest priority",
    blurb: "Youth shelter — the warm, youth-facing places Esti is most likely to come to.",
    pillBg: "bg-sky-100",
    pillText: "text-sky-800",
  },
  2: {
    label: "Important",
    blurb: "Drop-in / warming centre — open during the day, lots of foot traffic.",
    pillBg: "bg-amber-100",
    pillText: "text-amber-800",
  },
  3: {
    label: "Background coverage",
    blurb: "Adult shelter — less likely but worth a periodic check-in.",
    pillBg: "bg-stone-200",
    pillText: "text-stone-700",
  },
};

const TIER_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
};

function formatTimeRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sameDay = s.toDateString() === e.toDateString();
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateFmt.format(s)} · ${timeFmt.format(s)}${sameDay ? "" : ` → ${dateFmt.format(e)}`} – ${timeFmt.format(e)}`;
}

function googleMapsHref(loc: Location): string {
  if (loc.lat != null && loc.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
  }
  const q = encodeURIComponent(`${loc.name} ${loc.address ?? ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// ── Priority pill (subcomponent) ───────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: number }) {
  const m = PRIORITY_META[priority];
  if (!m) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        m.pillBg,
        m.pillText,
      )}
    >
      {m.label}
    </span>
  );
}

// ── Booking form (subcomponent) ────────────────────────────────────────────

const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters).")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number with at least 7 digits.")
    .max(20, "Phone is too long.")
    .regex(/^[\d\s\-+()]{7,}$/, "Phone should be digits and common separators."),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingForm({
  slot,
  onCancel,
  onSuccess,
}: {
  slot: SlotWithStatus;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const book = useBookSlot();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", phone: "" },
  });

  const friendlyError = (msg: string | undefined) => {
    if (!msg) return null;
    if (msg.includes("SLOT_FULL")) return "This slot just filled up. Refresh and pick another.";
    if (msg.includes("SLOT_NOT_FOUND")) return "This slot is no longer available.";
    if (msg.includes("INVALID_INPUT")) return "Please check your name and phone number.";
    return msg;
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await book.mutateAsync({ slotId: slot.id, name: values.name, phone: values.phone });
      onSuccess();
    } catch {
      // book.error is rendered below.
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 grid gap-3 rounded-md border border-border bg-muted/50 p-3"
    >
      <div>
        <label
          htmlFor={`name-${slot.id}`}
          className="block text-xs font-semibold text-muted-foreground"
        >
          Your name (will display publicly as "First L.")
        </label>
        <Input
          id={`name-${slot.id}`}
          type="text"
          autoComplete="name"
          {...register("name")}
          className="mt-1"
        />
        {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
      </div>

      <div>
        <label
          htmlFor={`phone-${slot.id}`}
          className="block text-xs font-semibold text-muted-foreground"
        >
          Your phone (private — only the coordinator can see this)
        </label>
        <Input
          id={`phone-${slot.id}`}
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          className="mt-1"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
      </div>

      {book.isError && (
        <p className="text-sm text-red-700">{friendlyError((book.error as Error)?.message)}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-bold text-white",
            "border-teal-700 bg-teal-700 hover:bg-teal-800",
            isSubmitting && "cursor-wait opacity-80",
          )}
        >
          {isSubmitting ? "Booking…" : "Book this slot"}
        </button>
      </div>
    </form>
  );
}

// ── Slot row (subcomponent) ────────────────────────────────────────────────

function SlotRow({
  slot,
  signupLabels,
  expanded,
  onToggle,
  onBooked,
}: {
  slot: SlotWithStatus;
  signupLabels: string[];
  expanded: boolean;
  onToggle: () => void;
  onBooked: () => void;
}) {
  const isFull = slot.state === "full";
  const tierLabel = slot.priority_tier ? TIER_LABEL[slot.priority_tier] : null;

  return (
    <li
      className={cn(
        "rounded-md border border-border bg-card p-3",
        "border-l-4",
        isFull ? "border-l-gray-400" : "border-l-teal-700",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            {formatTimeRange(slot.start_time, slot.end_time)}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {slot.filled} of {slot.capacity} {slot.capacity === 1 ? "spot" : "spots"} filled
            {tierLabel ? (
              <>
                {" · "}
                <span
                  className={cn(
                    "inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white",
                    slot.priority_tier === "critical" ? "bg-amber-600" : "bg-teal-900",
                  )}
                >
                  {tierLabel}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={isFull && !expanded}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-bold",
            isFull
              ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500"
              : "border-teal-700 bg-teal-700 text-white hover:bg-teal-800",
          )}
        >
          {isFull ? "Full" : expanded ? "Close" : "Book"}
        </button>
      </div>

      {signupLabels.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          <strong className="font-semibold text-foreground">Volunteers:</strong>{" "}
          {signupLabels.join(", ")}
        </div>
      )}

      {expanded && !isFull && <BookingForm slot={slot} onCancel={onToggle} onSuccess={onBooked} />}
    </li>
  );
}

// ── Detail view (one location) ─────────────────────────────────────────────

function LocationDetail({
  location,
  slots,
  signupLabelsBySlotId,
  expandedSlotId,
  onExpandSlot,
  onBack,
}: {
  location: Location;
  slots: SlotWithStatus[];
  signupLabelsBySlotId: Map<string, string[]>;
  expandedSlotId: string | null;
  onExpandSlot: (id: string | null) => void;
  onBack: () => void;
}) {
  const totalOpen = slots.filter((s) => s.state !== "full").length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border p-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to all locations
        </button>

        <div className="flex flex-wrap items-start gap-2">
          <h2 className="text-base font-bold text-foreground">{location.name}</h2>
          <PriorityBadge priority={location.priority} />
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span className="truncate">{location.address ?? "Address coming soon"}</span>
        </div>

        <a
          href={googleMapsHref(location)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
        >
          Open in Google Maps
          <ExternalLink className="size-3" />
        </a>

        <p className="mt-3 text-xs text-muted-foreground">
          {totalOpen} of {slots.length} upcoming slots open in the next 48 hours.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {slots.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No upcoming slots in the next 48 hours.
          </p>
        ) : (
          <ul className="grid gap-2 p-0">
            {slots.map((s) => (
              <SlotRow
                key={s.id}
                slot={s}
                signupLabels={signupLabelsBySlotId.get(s.id) ?? []}
                expanded={expandedSlotId === s.id}
                onToggle={() => onExpandSlot(expandedSlotId === s.id ? null : s.id)}
                onBooked={() => onExpandSlot(null)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main sidebar (list view) ──────────────────────────────────────────────

interface Props {
  allLocations: Location[];
  visibleLocations: Location[];
  selectedLocation: Location | null;
  availabilityByLocId: Map<string, LocationAvailability>;
  slotsForSelected: SlotWithStatus[];
  signupLabelsBySlotId: Map<string, string[]>;
  expandedSlotId: string | null;
  onExpandSlot: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  query: string;
  onQuery: (q: string) => void;
  activePriorities: Set<number>;
  onTogglePriority: (p: number) => void;
  totalOpen: number;
  totalSlots: number;
}

export function StakeoutSidebar({
  allLocations,
  visibleLocations,
  selectedLocation,
  availabilityByLocId,
  slotsForSelected,
  signupLabelsBySlotId,
  expandedSlotId,
  onExpandSlot,
  onSelect,
  query,
  onQuery,
  activePriorities,
  onTogglePriority,
  totalOpen,
  totalSlots,
}: Props) {
  if (selectedLocation) {
    return (
      <LocationDetail
        location={selectedLocation}
        slots={slotsForSelected}
        signupLabelsBySlotId={signupLabelsBySlotId}
        expandedSlotId={expandedSlotId}
        onExpandSlot={onExpandSlot}
        onBack={() => onSelect(null)}
      />
    );
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">Pick a location</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {totalOpen} open slots across {visibleLocations.length} locations · next 48 hours
        </p>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search by name or address…"
            className="pl-9"
            aria-label="Search locations"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3].map((p) => {
            const meta = PRIORITY_META[p];
            const count = allLocations.filter((l) => l.priority === p).length;
            const active = activePriorities.has(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => onTogglePriority(p)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
                  active
                    ? cn(meta.pillBg, meta.pillText, "border-transparent")
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
                aria-pressed={active}
              >
                {meta.label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleLocations.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No locations match your filters.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visibleLocations.map((loc) => {
              const av = availabilityByLocId.get(loc.id);
              const open = av?.openSlots ?? 0;
              const total = av?.totalSlots ?? 0;
              const summary =
                total === 0
                  ? "No upcoming slots"
                  : open === 0
                    ? "Fully booked"
                    : `${open} of ${total} slots open`;
              const dotColor =
                av?.state === "open"
                  ? "bg-emerald-600"
                  : av?.state === "nearly-full"
                    ? "bg-amber-500"
                    : "bg-gray-400";
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(loc.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/60"
                  >
                    <span
                      className={cn(
                        "mt-1 size-3 shrink-0 rounded-full ring-2 ring-background",
                        dotColor,
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {loc.name}
                        </div>
                        <PriorityBadge priority={loc.priority} />
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        <span className="truncate">{loc.address ?? "Address coming soon"}</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{summary}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
        {totalOpen} of {totalSlots} slots open · names display publicly as "First L."
      </div>
    </aside>
  );
}
