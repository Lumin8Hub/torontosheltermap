import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SheltersSidebar } from "@/components/SheltersSidebar";
import { SHELTERS, CATEGORY_COLORS, type Shelter, type ShelterCategory } from "@/data/shelters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({
    meta: [
      { title: "Shelters & Drop-In Centres Map — Find Esti" },
      {
        name: "description",
        content:
          "Interactive map of youth shelters and drop-in centres across Toronto — the warm, youth-facing places where Esti might seek refuge.",
      },
      { property: "og:title", content: "Shelters & Drop-In Centres — Find Esti" },
      {
        property: "og:description",
        content:
          "Map of youth shelters and drop-in centres in Toronto to help search for missing teen Esti.",
      },
    ],
  }),
});

const ALL_CATS: ShelterCategory[] = [
  "Youth Shelter",
  "Adult Shelter",
  "Donation Centre",
  "Drop-In Centre",
];

// Default to the warm, youth-facing places most relevant to the search.
const DEFAULT_CATS: ShelterCategory[] = ["Youth Shelter", "Drop-In Centre"];

function MapPage() {
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Set<ShelterCategory>>(new Set(DEFAULT_CATS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Mobile drawer state — closed by default so the map fills the screen.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [MapComp, setMapComp] = useState<null | React.ComponentType<{
    visible: Shelter[];
    focusedId: string | null;
  }>>(null);

  useEffect(() => {
    // client-only import for Leaflet
    import("@/components/SheltersMap").then((m) => setMapComp(() => m.SheltersMap));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHELTERS.filter((s) => {
      if (!activeCats.has(s.category)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.services.toLowerCase().includes(q)
      );
    });
  }, [query, activeCats]);

  const toggleCat = (c: ShelterCategory) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  // Auto-open the drawer when a marker is tapped so the user can see the result row.
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden md:flex md:flex-row">
      {/* Sidebar — bottom drawer on mobile, left column on desktop */}
      <div
        className={cn(
          "bg-card flex flex-col",
          // Mobile: bottom drawer that peeks and slides up
          "fixed inset-x-0 bottom-0 z-[1000] h-[80vh] rounded-t-2xl border-t border-border shadow-2xl transition-transform duration-300 ease-out",
          // Desktop: take its place in the flex row (translate-y-0 explicitly
          // overrides the mobile drawer translate — Tailwind v4 ships translate
          // as its own CSS property, so transform-none alone doesn't reset it).
          "md:static md:inset-auto md:z-auto md:h-full md:w-[380px] md:flex-shrink-0 md:rounded-none md:border-t-0 md:shadow-none md:transition-none md:translate-y-0",
          drawerOpen ? "translate-y-0" : "translate-y-[calc(100%-3.25rem)]",
        )}
        role="complementary"
        aria-label="Filters and shelter list"
      >
        {/* Mobile peek / drag handle — tap to expand or collapse */}
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          className="flex h-[3.25rem] w-full items-center justify-center gap-2 border-b border-border bg-card md:hidden"
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? "Hide filters and list" : "Show filters and list"}
        >
          <span className="block h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          <span className="text-xs font-medium text-foreground">
            {drawerOpen
              ? "Hide filters & list"
              : `Filters & list · ${visible.length} ${visible.length === 1 ? "result" : "results"}`}
          </span>
        </button>

        {/* Sidebar fills the remaining space */}
        <div className="flex min-h-0 flex-1 flex-col">
          <SheltersSidebar
            all={SHELTERS}
            visible={visible}
            query={query}
            onQuery={setQuery}
            activeCats={activeCats}
            onToggleCat={toggleCat}
            onSelect={handleSelect}
            selectedId={selectedId}
          />
        </div>
      </div>

      {/* Map fills the whole viewport on mobile (drawer floats over it),
          and the remaining width on desktop. */}
      <main className="absolute inset-0 md:relative md:inset-auto md:flex-1">
        {MapComp ? (
          <MapComp visible={visible} focusedId={selectedId} />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Loading map…
          </div>
        )}

        {/* Back to the Find Esti home page */}
        <Link
          to="/"
          className="absolute left-4 top-4 z-[400] inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition hover:bg-card"
        >
          ← Find Esti
        </Link>

        {/* Context note — desktop only; mobile already has the drawer + back link */}
        <div className="pointer-events-none absolute right-4 top-4 z-[400] hidden max-w-[260px] rounded-lg border border-border bg-card/95 p-3 text-xs leading-relaxed text-muted-foreground shadow-lg backdrop-blur md:block">
          Warm, youth-facing places where she might seek refuge. Youth shelters and drop-in centres
          are shown by default — toggle the other categories in the sidebar.
        </div>

        {/* Legend — desktop only; mobile relies on the sidebar swatches */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[400] hidden rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur md:block">
          <div className="mb-2 text-xs font-semibold text-foreground">Legend</div>
          <ul className="space-y-1.5">
            {ALL_CATS.map((c) => (
              <li key={c} className="flex items-center gap-2 text-xs text-foreground">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[c] }}
                />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
