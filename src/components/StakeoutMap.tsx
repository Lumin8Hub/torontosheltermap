import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/lib/supabase";

export type LocationAvailability = {
  totalSlots: number;
  openSlots: number;
  state: "open" | "nearly-full" | "full" | "none";
};

interface Props {
  locations: Location[];
  availabilityByLocId: Map<string, LocationAvailability>;
  focusedId: string | null;
  onSelect: (id: string) => void;
}

// Priority maps to a pin fill colour — youth/drop-in/adult.
// Kept distinct from /map/ category colours because Stakeout groups by
// the coordinator-set priority, not the static shelter category.
const PRIORITY_FILL: Record<number, string> = {
  1: "#3498db", // Highest priority (youth)
  2: "#f39c12", // Important (drop-in / warming)
  3: "#e74c3c", // Background coverage (adult)
};

const STATE_RING: Record<LocationAvailability["state"], string> = {
  open: "#16a34a", // green-600
  "nearly-full": "#d97706", // amber-600
  full: "#6b7280", // gray-500
  none: "#9ca3af", // gray-400
};

function pinHtml(fillColor: string, ringColor: string) {
  return `<span style="
    background-color:${fillColor};
    width:1.5rem;height:1.5rem;display:block;
    left:-0.75rem;top:-0.75rem;position:relative;
    border-radius:1.5rem 1.5rem 0;
    transform:rotate(45deg);
    border:3px solid ${ringColor};
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "></span>`;
}

function popupHtml(loc: Location, av: LocationAvailability | undefined) {
  const summary = av
    ? av.totalSlots === 0
      ? "No upcoming slots"
      : `${av.openSlots} of ${av.totalSlots} slots open`
    : "Loading slots…";
  return `
    <div style="width:220px;font-family:inherit">
      <h4 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1a1f2e">${loc.name}</h4>
      <p style="margin:2px 0 6px;font-size:12px;color:#555">${loc.address ?? ""}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#333"><b>${summary}</b></p>
      <button data-stakeout-loc-button="${loc.id}" style="
        display:inline-block;padding:6px 10px;background:#0f6e6e;color:#fff;
        border:none;border-radius:6px;font-size:12px;font-weight:700;
        cursor:pointer;width:100%;
      ">View slots →</button>
    </div>`;
}

export function StakeoutMap({ locations, availabilityByLocId, focusedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Build map + initial markers when locations first arrive.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || locations.length === 0) return;

    const map = L.map(containerRef.current, {
      center: [43.655, -79.385],
      zoom: 13,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    locations.forEach((loc) => {
      if (loc.lat == null || loc.lng == null) return;
      const av = availabilityByLocId.get(loc.id);
      const fill = PRIORITY_FILL[loc.priority] ?? "#6b7280";
      const ring = STATE_RING[av?.state ?? "none"];
      const icon = L.divIcon({
        className: "stakeout-pin",
        iconAnchor: [0, 24],
        popupAnchor: [0, -28],
        html: pinHtml(fill, ring),
      });
      const marker = L.marker([loc.lat, loc.lng], { icon }).bindPopup(popupHtml(loc, av));

      marker.on("click", () => {
        onSelectRef.current(loc.id);
      });

      marker.on("popupopen", (evt) => {
        const node = evt.popup.getElement();
        const btn = node?.querySelector<HTMLButtonElement>(
          `[data-stakeout-loc-button="${loc.id}"]`,
        );
        btn?.addEventListener("click", () => onSelectRef.current(loc.id), { once: true });
      });

      marker.addTo(map);
      markersRef.current[loc.id] = marker;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // Update icon + popup when availability changes (without rebuilding the map).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    locations.forEach((loc) => {
      const marker = markersRef.current[loc.id];
      if (!marker) return;
      const av = availabilityByLocId.get(loc.id);
      const fill = PRIORITY_FILL[loc.priority] ?? "#6b7280";
      const ring = STATE_RING[av?.state ?? "none"];
      marker.setIcon(
        L.divIcon({
          className: "stakeout-pin",
          iconAnchor: [0, 24],
          popupAnchor: [0, -28],
          html: pinHtml(fill, ring),
        }),
      );
      marker.setPopupContent(popupHtml(loc, av));
    });
  }, [locations, availabilityByLocId]);

  // Fly to focused location and open its popup.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedId) return;
    const marker = markersRef.current[focusedId];
    if (!marker) return;
    const ll = marker.getLatLng();
    map.flyTo(ll, 15, { duration: 0.6 });
    const t = setTimeout(() => marker.openPopup(), 500);
    return () => clearTimeout(t);
  }, [focusedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
