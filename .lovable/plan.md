## Goal
Add the 26 drop-in centres from the uploaded file as a new "Drop-In Centre" category on the map, alongside the existing Youth Shelter, Adult Shelter, and Donation Centre categories.

## Changes

### 1. `src/data/shelters.ts`
- Extend `ShelterCategory` union with `"Drop-In Centre"`.
- Append 26 new entries (id, name, address, category: "Drop-In Centre", services from "Key Services & Target Demographic", lat/lon hand-coded from known Toronto address coordinates).
- Add `"Drop-In Centre": "#f39c12"` (amber/orange — distinct from existing blue/red/green) to `CATEGORY_COLORS`.

### 2. `src/components/SheltersSidebar.tsx`
- Add a 4th filter chip for "Drop-In Centre" with matching icon (e.g. `Coffee` or `Home` from lucide-react) and color.

### 3. `src/routes/index.tsx`
- Add "Drop-In Centre" to the legend.
- Include it in the default active categories set so markers show on load.

## Notes
- No changes needed to `SheltersMap.tsx` — it already renders any category present in `CATEGORY_COLORS`.
- Total markers go from 30 → 56.
