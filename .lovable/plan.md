## Goal
Build an interactive map of Toronto showing the 30 shelters and donation centres from the uploaded data, with category filters, a searchable sidebar, and detailed info popups.

## Pages
- `/` (`src/routes/index.tsx`) — Full-page app: header, map, sidebar list, legend.

## Features
- **Interactive Leaflet map** centered on downtown Toronto, CartoDB Positron basemap.
- **30 markers** colour-coded by category:
  - Youth Shelter (blue)
  - Adult Shelter (red)
  - Donation Centre (green)
- **Click marker → popup** with name, category, address, and services.
- **Sidebar** listing all locations, grouped/filterable by category. Clicking a list item flies the map to that marker and opens its popup.
- **Search bar** to filter the list and markers by name/address.
- **Legend** at bottom-left.
- Counts per category shown in the filter chips.

## Tech
- React-Leaflet (`leaflet` + `react-leaflet`) — works client-side; will guard SSR.
- Data lives in `src/data/shelters.ts` (typed array transcribed from the uploaded HTML's data block — already contains lat/lon).
- Styled with the existing Tailwind/shadcn design system; clean modern layout, Toronto-appropriate palette (deep navy + clean whites + category accent colours).

## File structure
```
src/
  routes/index.tsx          # page composition + SEO head
  components/
    SheltersMap.tsx         # Leaflet map (dynamic import / client-only)
    SheltersSidebar.tsx     # search + filter chips + list
    ShelterCard.tsx         # list item
  data/shelters.ts          # 30 entries with name, address, category, services, lat, lon
  hooks/useShelterFilters.ts
```

## Notes
- Leaflet CSS imported in the map component.
- Map component rendered only after mount (no SSR for `window`/`L`).
- No backend needed — static data.