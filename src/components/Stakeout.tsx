import { Fragment, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBookSlot, useLocations, useSignups, useUpcomingSlots } from "@/hooks/useStakeout";
import { isSupabaseConfigured, type SlotWithStatus } from "@/lib/supabase";

const C = {
  teal: "#0f6e6e",
  tealDeep: "#0a5050",
  paper: "#f4f1ea",
  card: "#ffffff",
  ink: "#1a1f2e",
  inkSoft: "#3b4252",
  amber: "#e8820e",
  border: "#e6e0d4",
};

const font = {
  display: '"Libre Franklin", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  body: '"Newsreader", Georgia, "Times New Roman", serif',
};

const PRIORITY_LABEL: Record<number, { name: string; blurb: string }> = {
  1: {
    name: "Highest priority",
    blurb: "Youth shelters — the warm, youth-facing places Esti is most likely to come to.",
  },
  2: {
    name: "Important",
    blurb: "Drop-in centres and warming spaces — open during the day, lots of foot traffic.",
  },
  3: {
    name: "Background coverage",
    blurb: "Adult shelters — less likely but worth a periodic check-in.",
  },
};

const PRIORITY_TIER_LABEL: Record<string, string> = {
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
    .regex(/[\d\s\-+()]{7,}/, "Phone should be digits and common separators."),
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
      await book.mutateAsync({
        slotId: slot.id,
        name: values.name,
        phone: values.phone,
      });
      onSuccess();
    } catch {
      // book.error is rendered below; nothing else to do here.
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      style={{
        marginTop: 12,
        padding: 12,
        background: C.paper,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        display: "grid",
        gap: 10,
      }}
    >
      <div>
        <label
          htmlFor={`name-${slot.id}`}
          style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.inkSoft }}
        >
          Your name (will display publicly as "First L.")
        </label>
        <input
          id={`name-${slot.id}`}
          type="text"
          autoComplete="name"
          {...register("name")}
          style={{
            marginTop: 4,
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            fontFamily: font.body,
            fontSize: 14,
          }}
        />
        {errors.name && (
          <p style={{ marginTop: 4, fontSize: 12, color: "#b91c1c" }}>{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor={`phone-${slot.id}`}
          style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.inkSoft }}
        >
          Your phone (private — only the coordinator can see this)
        </label>
        <input
          id={`phone-${slot.id}`}
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          style={{
            marginTop: 4,
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            fontFamily: font.body,
            fontSize: 14,
          }}
        />
        {errors.phone && (
          <p style={{ marginTop: 4, fontSize: 12, color: "#b91c1c" }}>{errors.phone.message}</p>
        )}
      </div>

      {book.isError && (
        <p style={{ fontSize: 13, color: "#b91c1c" }}>
          {friendlyError((book.error as Error)?.message)}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            padding: "8px 14px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            fontFamily: font.display,
            fontSize: 13,
            fontWeight: 600,
            color: C.inkSoft,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "8px 14px",
            background: C.teal,
            border: `1px solid ${C.teal}`,
            borderRadius: 6,
            fontFamily: font.display,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            cursor: isSubmitting ? "wait" : "pointer",
          }}
        >
          {isSubmitting ? "Booking…" : "Book this slot"}
        </button>
      </div>
    </form>
  );
}

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
  const tierLabel = slot.priority_tier ? PRIORITY_TIER_LABEL[slot.priority_tier] : null;

  return (
    <li
      style={{
        listStyle: "none",
        padding: 12,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${isFull ? "#9ca3af" : C.teal}`,
        borderRadius: 8,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 14, color: C.ink }}>
            {formatTimeRange(slot.start_time, slot.end_time)}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: C.inkSoft }}>
            {slot.filled} of {slot.capacity} {slot.capacity === 1 ? "spot" : "spots"} filled
            {tierLabel ? (
              <>
                {" · "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "1px 6px",
                    background: slot.priority_tier === "critical" ? C.amber : C.tealDeep,
                    color: "#fff",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
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
          style={{
            padding: "6px 12px",
            background: isFull ? "#e5e7eb" : C.teal,
            border: `1px solid ${isFull ? "#d1d5db" : C.teal}`,
            borderRadius: 6,
            fontFamily: font.display,
            fontSize: 12,
            fontWeight: 700,
            color: isFull ? "#6b7280" : "#fff",
            cursor: isFull && !expanded ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isFull ? "Full" : expanded ? "Close" : "Book"}
        </button>
      </div>

      {signupLabels.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: C.inkSoft }}>
          <strong style={{ fontFamily: font.display }}>Volunteers:</strong>{" "}
          {signupLabels.join(", ")}
        </div>
      )}

      {expanded && !isFull && <BookingForm slot={slot} onCancel={onToggle} onSuccess={onBooked} />}
    </li>
  );
}

function LocationBlock({
  locationId,
  locationName,
  address,
  category,
  slots,
  signupsByLocation,
  expandedSlotId,
  setExpandedSlotId,
}: {
  locationId: string;
  locationName: string;
  address: string | null;
  category: string;
  slots: SlotWithStatus[];
  signupsByLocation: Map<string, string[]>;
  expandedSlotId: string | null;
  setExpandedSlotId: (id: string | null) => void;
}) {
  return (
    <section style={{ marginTop: 24 }}>
      <h3
        style={{
          fontFamily: font.display,
          fontSize: 18,
          fontWeight: 800,
          color: C.ink,
          marginBottom: 4,
        }}
      >
        {locationName}
      </h3>
      <p style={{ fontFamily: font.body, fontSize: 13, color: C.inkSoft, margin: 0 }}>
        {address ?? "Address coming soon"} · {category}
      </p>

      {slots.length === 0 ? (
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: C.inkSoft,
            fontStyle: "italic",
          }}
        >
          No upcoming slots in the next 48 hours.
        </p>
      ) : (
        <ul
          style={{
            display: "grid",
            gap: 8,
            marginTop: 10,
            padding: 0,
          }}
        >
          {slots.map((s) => (
            <SlotRow
              key={s.id}
              slot={s}
              signupLabels={signupsByLocation.get(s.id) ?? []}
              expanded={expandedSlotId === s.id}
              onToggle={() => setExpandedSlotId(expandedSlotId === s.id ? null : s.id)}
              onBooked={() => setExpandedSlotId(null)}
            />
          ))}
        </ul>
      )}
      <div aria-hidden="true" style={{ marginTop: 8 }} data-location-id={locationId} />
    </section>
  );
}

export function Stakeout() {
  const locations = useLocations();
  const slots = useUpcomingSlots();
  const slotIds = useMemo(() => (slots.data ?? []).map((s) => s.id), [slots.data]);
  const signups = useSignups(slotIds);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);

  // Group signups by slot_id for fast lookup.
  const signupsByLocation = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const sig of signups.data ?? []) {
      const arr = m.get(sig.slot_id) ?? [];
      arr.push(sig.volunteer_label);
      m.set(sig.slot_id, arr);
    }
    return m;
  }, [signups.data]);

  // Group slots by priority then location.
  const grouped = useMemo(() => {
    const byPriority = new Map<number, Map<string, SlotWithStatus[]>>();
    for (const s of slots.data ?? []) {
      if (!byPriority.has(s.location_priority)) byPriority.set(s.location_priority, new Map());
      const byLoc = byPriority.get(s.location_priority)!;
      const arr = byLoc.get(s.location_id) ?? [];
      arr.push(s);
      byLoc.set(s.location_id, arr);
    }
    return byPriority;
  }, [slots.data]);

  const totalSlots = slots.data?.length ?? 0;
  const totalOpen = (slots.data ?? []).filter((s) => s.state !== "full").length;

  return (
    <div
      style={{
        background: C.paper,
        color: C.ink,
        fontFamily: font.body,
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800;900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
      />

      {/* ── TOP NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: C.ink,
          color: "#fff",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.amber,
                display: "inline-block",
              }}
            />
            Find Esti
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Link
              to="/"
              style={{
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Home
            </Link>
            <Link
              to="/map"
              style={{
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                background: C.teal,
              }}
            >
              Interactive map
            </Link>
            <a
              href="tel:911"
              style={{
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                background: C.amber,
              }}
            >
              911
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header
        style={{
          background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.teal} 100%)`,
          color: "#fff",
          padding: "36px 20px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: font.display,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.85,
              margin: 0,
            }}
          >
            Volunteer stakeout
          </p>
          <h1
            style={{
              fontFamily: font.display,
              fontSize: 32,
              fontWeight: 900,
              margin: "8px 0 10px",
              lineHeight: 1.1,
            }}
          >
            Sign up to keep an eye out for Esti
          </h1>
          <p
            style={{
              fontFamily: font.body,
              fontSize: 16,
              lineHeight: 1.5,
              maxWidth: 580,
              margin: "0 auto",
              opacity: 0.92,
            }}
          >
            Pick a 2-hour window at one of the shelters or drop-ins below. Sit nearby, don't
            approach anyone — just observe and call the tip line if you see Esti.
          </p>
        </div>
      </header>

      {/* ── SAFETY BANNER ────────────────────────────────────── */}
      <div
        style={{
          background: "#fff8ec",
          borderBottom: `1px solid ${C.border}`,
          padding: "12px 20px",
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 12 }}>
          <span style={{ fontSize: 20, lineHeight: "24px" }} aria-hidden="true">
            ⚠
          </span>
          <p
            style={{
              fontFamily: font.body,
              fontSize: 14,
              lineHeight: 1.5,
              margin: 0,
              color: C.inkSoft,
            }}
          >
            <strong style={{ fontFamily: font.display, fontWeight: 800, color: C.ink }}>
              Stay safe.
            </strong>{" "}
            Don't engage with anyone you think might be Esti. Don't intervene in shelter operations.
            If you spot her, call the tip line at{" "}
            <a href="tel:6473554148" style={{ color: C.teal, fontWeight: 700 }}>
              647-355-4148
            </a>{" "}
            (or 911 if she's in immediate danger) and stay put until coordinators or police arrive.
          </p>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px 48px" }}>
        {!isSupabaseConfigured ? (
          <div
            style={{
              padding: 16,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: C.inkSoft }}>
              Sign-ups aren't configured on this preview. The coordinator will turn this on shortly.
            </p>
          </div>
        ) : locations.isLoading || slots.isLoading ? (
          <div style={{ padding: 16, fontSize: 14, color: C.inkSoft, textAlign: "center" }}>
            Loading available slots…
          </div>
        ) : locations.isError ? (
          <div
            style={{
              padding: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#991b1b",
              fontSize: 14,
            }}
          >
            We couldn't load the location list. Please refresh the page.
          </div>
        ) : (
          <>
            <p
              style={{
                fontFamily: font.body,
                fontSize: 14,
                color: C.inkSoft,
                margin: "0 0 16px",
              }}
            >
              {totalOpen} of {totalSlots} upcoming slots are open in the next 48 hours, across{" "}
              {locations.data?.length ?? 0} locations.
            </p>

            {[1, 2, 3].map((priority) => {
              const byLoc = grouped.get(priority);
              const meta = PRIORITY_LABEL[priority];
              const relevantLocations = (locations.data ?? []).filter(
                (l) => l.priority === priority,
              );
              if (relevantLocations.length === 0) return null;

              return (
                <Fragment key={priority}>
                  <h2
                    style={{
                      fontFamily: font.display,
                      fontSize: 22,
                      fontWeight: 900,
                      color: C.ink,
                      marginTop: 28,
                      marginBottom: 4,
                    }}
                  >
                    {meta.name}
                  </h2>
                  <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 4px" }}>{meta.blurb}</p>

                  {relevantLocations.map((loc) => {
                    const locSlots = byLoc?.get(loc.id) ?? [];
                    return (
                      <LocationBlock
                        key={loc.id}
                        locationId={loc.id}
                        locationName={loc.name}
                        address={loc.address}
                        category={loc.category}
                        slots={locSlots}
                        signupsByLocation={signupsByLocation}
                        expandedSlotId={expandedSlotId}
                        setExpandedSlotId={setExpandedSlotId}
                      />
                    );
                  })}
                </Fragment>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
