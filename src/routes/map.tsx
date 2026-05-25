import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SheltersSidebar } from "@/components/SheltersSidebar";
import { SHELTERS, CATEGORY_COLORS, type Shelter, type ShelterCategory } from "@/data/shelters";

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

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      <SheltersSidebar
        all={SHELTERS}
        visible={visible}
        query={query}
        onQuery={setQuery}
        activeCats={activeCats}
        onToggleCat={toggleCat}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />

      <main className="relative flex-1">
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

        {/* Context note */}
        <div className="pointer-events-none absolute right-4 top-4 z-[400] max-w-[260px] rounded-lg border border-border bg-card/95 p-3 text-xs leading-relaxed text-muted-foreground shadow-lg backdrop-blur">
          Warm, youth-facing places where she might seek refuge. Youth shelters and drop-in centres
          are shown by default — toggle the other categories in the sidebar.
        </div>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
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