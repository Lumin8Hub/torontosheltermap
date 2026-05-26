import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SHELTERS, CATEGORY_COLORS, type Shelter } from "@/data/shelters";

interface Props {
  visible: Shelter[];
  focusedId: string | null;
  onSelect?: (id: string) => void;
}

export function SheltersMap({ visible, focusedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Keep the latest onSelect callback reachable from the marker click handler
  // without re-creating the map every render.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

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

    SHELTERS.forEach((s) => {
      const color = CATEGORY_COLORS[s.category];
      const html = `<span style="
        background-color:${color};
        width:1.5rem;height:1.5rem;display:block;
        left:-0.75rem;top:-0.75rem;position:relative;
        border-radius:1.5rem 1.5rem 0;
        transform:rotate(45deg);
        border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      "></span>`;
      const icon = L.divIcon({
        className: "shelter-pin",
        iconAnchor: [0, 24],
        popupAnchor: [0, -28],
        html,
      });
      const popup = `
        <div style="width:240px;font-family:inherit">
          <h4 style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f1b3d">${s.name}</h4>
          <div style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color};color:#fff;font-size:11px;font-weight:600;margin-bottom:6px">${s.category}</div>
          <p style="margin:4px 0;font-size:12px;color:#555"><b>Address:</b> ${s.address}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#333;line-height:1.4">${s.services}</p>
        </div>`;
      const marker = L.marker([s.lat, s.lon], { icon }).bindPopup(popup);
      // Wire the click into the parent's onSelect so tapping a marker also
      // selects the matching sidebar row and (on mobile) opens the drawer.
      // Without this, .bindPopup alone shows the popup but the parent has no
      // way to know which marker was tapped.
      marker.on("click", () => {
        onSelectRef.current?.(s.id);
      });
      marker.addTo(map);
      markersRef.current[s.id] = marker;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // toggle marker visibility based on filters
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const visibleIds = new Set(visible.map((v) => v.id));
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const onMap = map.hasLayer(marker);
      if (visibleIds.has(id) && !onMap) marker.addTo(map);
      else if (!visibleIds.has(id) && onMap) map.removeLayer(marker);
    });
  }, [visible]);

  // fly to focused
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedId) return;
    const marker = markersRef.current[focusedId];
    if (!marker) return;
    const ll = marker.getLatLng();
    map.flyTo(ll, 16, { duration: 0.8 });
    setTimeout(() => marker.openPopup(), 600);
  }, [focusedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
