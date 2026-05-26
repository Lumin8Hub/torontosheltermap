// One-shot generator: reads src/data/shelters.ts and emits 0005_seed_locations.sql.
// Not part of the runtime app; lives next to the .sql output so anyone re-running
// the seed (after a shelters.ts update) can regenerate cleanly:
//
//     bun supabase/seed/_generate_locations.ts > supabase/seed/0005_seed_locations.sql
//
// V1 scope: shelters only (Youth + Adult + Drop-In + Warming). Donation Centres
// and Food Banks are skipped — not relevant search targets for the missing-teen
// stakeout. Priority is derived from how plausible a 14-year-old turning up is:
//   1 = Youth Shelter        (admits her, likely refuge)
//   2 = Drop-In / Warming    (low-barrier, warm indoor, no questions)
//   3 = Adult Shelter        (doesn't admit minors but staff can spot)
//
// All locations are seeded with is_active=true. The coordinator can toggle
// individual rows off in the admin panel without touching this file.

import { SHELTERS, type ShelterCategory } from "@/data/shelters";

type DbCategory = "shelter" | "er" | "transit" | "library" | "food" | "pharmacy" | "other";

const PRIORITY: Partial<Record<ShelterCategory, number>> = {
  "Youth Shelter": 1,
  "Drop-In Centre": 2,
  "Warming Centre": 2,
  "Adult Shelter": 3,
};

const DB_CATEGORY: Partial<Record<ShelterCategory, DbCategory>> = {
  "Youth Shelter": "shelter",
  "Drop-In Centre": "shelter",
  "Warming Centre": "shelter",
  "Adult Shelter": "shelter",
};

function quote(value: string): string {
  // Postgres single-quote escaping: double up embedded quotes.
  return "'" + value.replace(/'/g, "''") + "'";
}

const rows = SHELTERS
  .filter((s) => PRIORITY[s.category] !== undefined)
  .map((s) => {
    const priority = PRIORITY[s.category]!;
    const dbCat = DB_CATEGORY[s.category]!;
    return `  (${quote(s.id)}, ${quote(s.name)}, ${quote(dbCat)}, ${quote(s.address)}, ${s.lat}, ${s.lon}, ${priority})`;
  });

const header = `-- 0005_seed_locations.sql
-- Generated from src/data/shelters.ts by supabase/seed/_generate_locations.ts.
-- Do NOT edit by hand — re-run the generator if you change shelters.ts.
--
-- Paste this AFTER 0001..0004 have all run successfully.
--
-- V1 scope: shelters only (Youth + Adult + Drop-In + Warming). Donation
-- Centres and Food Banks are intentionally excluded.
--
-- Idempotency: external_id is the stable key from shelters.ts. Re-running
-- this file upserts by external_id, so editing shelters.ts and re-seeding
-- updates rows in place rather than duplicating.
-- -----------------------------------------------------------------------------

insert into public.locations
  (external_id, name, category, address, lat, lng, priority)
values
${rows.join(",\n")}
on conflict (external_id) do update set
  name      = excluded.name,
  category  = excluded.category,
  address   = excluded.address,
  lat       = excluded.lat,
  lng       = excluded.lng,
  priority  = excluded.priority,
  is_active = true;
`;

process.stdout.write(header);
