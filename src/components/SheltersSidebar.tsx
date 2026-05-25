import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATEGORY_COLORS, type Shelter, type ShelterCategory } from "@/data/shelters";
import { cn } from "@/lib/utils";

interface Props {
  all: Shelter[];
  visible: Shelter[];
  query: string;
  onQuery: (q: string) => void;
  activeCats: Set<ShelterCategory>;
  onToggleCat: (c: ShelterCategory) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const CATEGORIES: ShelterCategory[] = ["Youth Shelter", "Adult Shelter", "Donation Centre", "Drop-In Centre", "Warming Centre", "Food Bank"];

export function SheltersSidebar({
  all,
  visible,
  query,
  onQuery,
  activeCats,
  onToggleCat,
  onSelect,
  selectedId,
}: Props) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card md:w-[380px]">
      <div className="border-b border-border p-5">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Toronto Shelters & Donation Centres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {visible.length} of {all.length} locations shown
        </p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search by name or address…"
            className="pl-9"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const count = all.filter((s) => s.category === c).length;
            const active = activeCats.has(c);
            return (
              <button
                key={c}
                onClick={() => onToggleCat(c)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                  active
                    ? "border-transparent text-white shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
                style={active ? { backgroundColor: CATEGORY_COLORS[c] } : undefined}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: active ? "#fff" : CATEGORY_COLORS[c] }}
                />
                {c} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No locations match your filters.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/60",
                    selectedId === s.id && "bg-muted",
                  )}
                >
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full ring-2 ring-background"
                    style={{ backgroundColor: CATEGORY_COLORS[s.category] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{s.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      <span className="truncate">{s.address}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.services}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border p-4 text-[11px] leading-relaxed text-muted-foreground">
        Map data &copy; OpenStreetMap, tiles &copy; CARTO. For informational use only — please call
        ahead to confirm availability.
      </div>
    </aside>
  );
}
