import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useLocations, useSignups, useUpcomingSlots } from "@/hooks/useStakeout";
import { isSupabaseConfigured, type Location, type SlotWithStatus } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { StakeoutSidebar } from "@/components/StakeoutSidebar";
import type { LocationAvailability } from "./StakeoutMap";

const C = {
  teal: "#0f6e6e",
  tealDeep: "#0a5050",
  paper: "#f4f1ea",
  ink: "#1a1f2e",
  inkSoft: "#3b4252",
  amber: "#e8820e",
  border: "#e6e0d4",
};

const font = {
  display: '"Libre Franklin", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  body: '"Newsreader", Georgia, "Times New Roman", serif',
};

// Availability bucket per location. Used by both the map (pin ring colour)
// and the sidebar list (dot colour, "X of Y" summary).
function computeAvailability(slots: SlotWithStatus[]): LocationAvailability {
  if (slots.length === 0) return { totalSlots: 0, openSlots: 0, state: "none" };
  const openSlots = slots.filter((s) => s.state !== "full").length;
  if (openSlots === 0) return { totalSlots: slots.length, openSlots, state: "full" };
  if (openSlots / slots.length <= 0.25)
    return { totalSlots: slots.length, openSlots, state: "nearly-full" };
  return { totalSlots: slots.length, openSlots, state: "open" };
}

export function Stakeout() {
  const navigate = useNavigate({ from: "/stakeout/" });
  const search = useSearch({ from: "/stakeout/" });

  const locations = useLocations();
  const slots = useUpcomingSlots();
  const slotIds = useMemo(() => (slots.data ?? []).map((s) => s.id), [slots.data]);
  const signups = useSignups(slotIds);

  // Local UI state
  const [query, setQuery] = useState("");
  const [activePriorities, setActivePriorities] = useState<Set<number>>(() => new Set([1, 2, 3]));
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lazy-load the Leaflet map so its CSS+JS only ship to the client (no SSR).
  type StakeoutMapProps = {
    locations: Location[];
    availabilityByLocId: Map<string, LocationAvailability>;
    focusedId: string | null;
    onSelect: (id: string) => void;
  };
  const [MapComp, setMapComp] = useState<null | ComponentType<StakeoutMapProps>>(null);
  useEffect(() => {
    import("@/components/StakeoutMap").then((m) => setMapComp(() => m.StakeoutMap));
  }, []);

  // Index slots by location for the map's pin colour + sidebar summary.
  const slotsByLocation = useMemo(() => {
    const m = new Map<string, SlotWithStatus[]>();
    for (const s of slots.data ?? []) {
      const arr = m.get(s.location_id) ?? [];
      arr.push(s);
      m.set(s.location_id, arr);
    }
    return m;
  }, [slots.data]);

  const availabilityByLocId = useMemo(() => {
    const m = new Map<string, LocationAvailability>();
    for (const loc of locations.data ?? []) {
      m.set(loc.id, computeAvailability(slotsByLocation.get(loc.id) ?? []));
    }
    return m;
  }, [locations.data, slotsByLocation]);

  // Signups grouped by slot for fast lookup in the detail view.
  const signupLabelsBySlotId = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const sig of signups.data ?? []) {
      const arr = m.get(sig.slot_id) ?? [];
      arr.push(sig.volunteer_label);
      m.set(sig.slot_id, arr);
    }
    return m;
  }, [signups.data]);

  // Filter visible locations by search query + priority pills.
  const visibleLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (locations.data ?? []).filter((loc) => {
      if (!activePriorities.has(loc.priority)) return false;
      if (!q) return true;
      return loc.name.toLowerCase().includes(q) || (loc.address?.toLowerCase() ?? "").includes(q);
    });
  }, [locations.data, query, activePriorities]);

  // ── Deep linking ──────────────────────────────────────────────────────
  // ?location=<external_id> deep-links to a specific location's detail view.
  // We keep selectedId in URL state so the sidebar and the URL never drift.
  const selectedLocation = useMemo<Location | null>(() => {
    const target = search.location?.trim();
    if (!target) return null;
    return (locations.data ?? []).find((l) => l.external_id === target) ?? null;
  }, [search.location, locations.data]);

  const handleSelect = (id: string | null) => {
    if (!id) {
      navigate({ search: { location: undefined }, replace: false }).catch(() => {});
      setExpandedSlotId(null);
      return;
    }
    const loc = (locations.data ?? []).find((l) => l.id === id);
    if (!loc) return;
    navigate({
      search: { location: loc.external_id ?? undefined },
      replace: false,
    }).catch(() => {});
    setDrawerOpen(true);
    setExpandedSlotId(null);
  };

  const togglePriority = (p: number) =>
    setActivePriorities((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  const slotsForSelected = useMemo(() => {
    if (!selectedLocation) return [];
    return slotsByLocation.get(selectedLocation.id) ?? [];
  }, [selectedLocation, slotsByLocation]);

  const totalSlots = slots.data?.length ?? 0;
  const totalOpen = (slots.data ?? []).filter((s) => s.state !== "full").length;

  const isLoading = locations.isLoading || slots.isLoading;
  const isError = locations.isError;

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
            maxWidth: 1280,
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

      {/* ── COMPACT HERO + SAFETY BANNER ─────────────────────── */}
      <header
        style={{
          background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.teal} 100%)`,
          color: "#fff",
          padding: "18px 20px 16px",
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
              fontSize: 22,
              fontWeight: 900,
              margin: "4px 0 2px",
              lineHeight: 1.15,
            }}
          >
            Pick a shelter on the map, then sign up for a 2-hour window
          </h1>
          <p
            style={{
              fontFamily: font.body,
              fontSize: 13,
              lineHeight: 1.4,
              maxWidth: 560,
              margin: "0 auto",
              opacity: 0.92,
            }}
          >
            Sit nearby, don't approach anyone — just observe and call the tip line if you see Esti.
          </p>
        </div>
      </header>

      <div
        style={{
          background: "#fff8ec",
          borderBottom: `1px solid ${C.border}`,
          padding: "8px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: "20px" }} aria-hidden="true">
            ⚠
          </span>
          <p
            style={{
              fontFamily: font.body,
              fontSize: 13,
              lineHeight: 1.45,
              margin: 0,
              color: C.inkSoft,
            }}
          >
            <strong style={{ fontFamily: font.display, fontWeight: 800, color: C.ink }}>
              Stay safe.
            </strong>{" "}
            Don't engage with anyone you think might be Esti or intervene in shelter operations. If
            you spot her, call the tip line at{" "}
            <a href="tel:6473554148" style={{ color: C.teal, fontWeight: 700 }}>
              647-355-4148
            </a>{" "}
            (or 911 if she's in immediate danger).
          </p>
        </div>
      </div>

      {/* ── BODY: two-zone sidebar + map ─────────────────────── */}
      {!isSupabaseConfigured ? (
        <div style={{ padding: 24, maxWidth: 780, margin: "0 auto" }}>
          <div
            style={{
              padding: 16,
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              textAlign: "center",
              fontSize: 14,
              color: C.inkSoft,
            }}
          >
            Sign-ups aren't configured on this preview. The coordinator will turn this on shortly.
          </div>
        </div>
      ) : (
        <div
          className="relative w-full overflow-hidden md:flex md:flex-row"
          style={{ height: "calc(100vh - 220px)", minHeight: 520 }}
        >
          {/* Sidebar — bottom drawer on mobile, left column on desktop */}
          <div
            className={cn(
              "bg-card flex flex-col",
              // Mobile: bottom drawer that peeks and slides up
              "fixed inset-x-0 bottom-0 z-[1000] h-[80vh] rounded-t-2xl border-t border-border shadow-2xl transition-transform duration-300 ease-out",
              // Desktop: take its place in the flex row
              "md:static md:inset-auto md:z-auto md:h-full md:w-[400px] md:flex-shrink-0 md:rounded-none md:border-t-0 md:shadow-none md:transition-none md:translate-y-0",
              drawerOpen ? "translate-y-0" : "translate-y-[calc(100%-3.25rem)]",
            )}
            role="complementary"
            aria-label="Stakeout locations and slots"
          >
            {/* Mobile peek / drag handle */}
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="flex h-[3.25rem] w-full items-center justify-center gap-2 border-b border-border bg-card md:hidden"
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Hide locations" : "Show locations"}
            >
              <span className="block h-1.5 w-10 rounded-full bg-muted-foreground/30" />
              <span className="text-xs font-medium text-foreground">
                {drawerOpen
                  ? "Hide list"
                  : selectedLocation
                    ? `${selectedLocation.name}`
                    : `Filters & list · ${visibleLocations.length} locations · ${totalOpen} open slots`}
              </span>
            </button>

            <div className="flex min-h-0 flex-1 flex-col">
              {isLoading ? (
                <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                  Loading available slots…
                </div>
              ) : isError ? (
                <div className="p-6 text-sm text-red-700">
                  We couldn't load the location list. Please refresh the page.
                </div>
              ) : (
                <StakeoutSidebar
                  allLocations={locations.data ?? []}
                  visibleLocations={visibleLocations}
                  selectedLocation={selectedLocation}
                  availabilityByLocId={availabilityByLocId}
                  slotsForSelected={slotsForSelected}
                  signupLabelsBySlotId={signupLabelsBySlotId}
                  expandedSlotId={expandedSlotId}
                  onExpandSlot={setExpandedSlotId}
                  onSelect={handleSelect}
                  query={query}
                  onQuery={setQuery}
                  activePriorities={activePriorities}
                  onTogglePriority={togglePriority}
                  totalOpen={totalOpen}
                  totalSlots={totalSlots}
                />
              )}
            </div>
          </div>

          {/* Map fills the whole viewport on mobile (drawer floats over),
              and the remaining width on desktop. */}
          <main className="absolute inset-0 md:relative md:inset-auto md:flex-1">
            {MapComp && (locations.data?.length ?? 0) > 0 ? (
              <MapComp
                locations={locations.data ?? []}
                availabilityByLocId={availabilityByLocId}
                focusedId={selectedLocation?.id ?? null}
                onSelect={handleSelect}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                Loading map…
              </div>
            )}

            {/* Counter overlay (desktop only) */}
            <div className="pointer-events-none absolute right-4 top-4 z-[400] hidden max-w-[280px] rounded-lg border border-border bg-card/95 p-3 text-xs leading-relaxed text-foreground shadow-lg backdrop-blur md:block">
              <div className="font-semibold">{totalOpen} open slots · next 48 hours</div>
              <div className="mt-1 text-muted-foreground">
                Across {visibleLocations.length} of {locations.data?.length ?? 0} locations.
              </div>
            </div>

            {/* Availability legend (desktop only) */}
            <div className="pointer-events-none absolute bottom-4 left-4 z-[400] hidden rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur md:block">
              <div className="mb-2 text-xs font-semibold text-foreground">Availability</div>
              <ul className="space-y-1.5 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-emerald-600" />
                  Open slots
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-amber-500" />
                  Nearly full
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-gray-400" />
                  Fully booked / no slots
                </li>
              </ul>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
