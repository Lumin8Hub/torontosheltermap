import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SheltersSidebar } from "@/components/SheltersSidebar";
import { SHELTERS, CATEGORY_COLORS, type ShelterCategory } from "@/data/shelters";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Toronto Shelters & Donation Centres — Interactive Map" },
      {
        name: "description",
        content:
          "Interactive map of emergency shelters, youth shelters, and donation centres across Toronto with addresses, services, and category filters.",
      },
      { property: "og:title", content: "Toronto Shelters & Donation Centres" },
      {
        property: "og:description",
        content: "Find shelters and donation drop-offs across Toronto on an interactive map.",
      },
    ],
  }),
});

const ALL_CATS: ShelterCategory[] = ["Youth Shelter", "Adult Shelter", "Donation Centre"];

function Index() {
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Set<ShelterCategory>>(new Set(ALL_CATS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [MapComp, setMapComp] = useState<null | React.ComponentType<any>>(null);

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
