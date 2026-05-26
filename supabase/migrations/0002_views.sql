-- 0002_views.sql
-- Spec reference: EPIC 1.2 — public-safe signups view
--                 EPIC 1.3 — slots_with_status view
--
-- Paste this AFTER 0001_schema.sql has run successfully.
--
-- IMPORTANT — security_invoker vs security_definer (spec 2.6):
--
--   Both views run against public.signups, which RLS in 0003_rls.sql denies
--   to the anon role at the row level. Postgres RLS cannot filter columns,
--   only rows — so we cannot grant anon "phone-less" access to the base table.
--
--   The spec suggests trying security_invoker = true first and falling back
--   if it breaks. Tested: with security_invoker, anon gets zero rows from
--   slots_with_status (the LEFT JOIN against signups returns nothing) and
--   from signups_public (same reason). That defeats the volunteer view.
--
--   We therefore keep both views as security_definer (Postgres default) —
--   they bypass RLS on the underlying tables — and rely on the view
--   definitions themselves to omit the volunteer_phone column.
--
--   The EPIC 2.7 RLS checklist in supabase/README.md includes an explicit
--   "\d signups_public" / "\d slots_with_status" check to assert that
--   neither view exposes volunteer_phone. Treat that check as REQUIRED.
-- -----------------------------------------------------------------------------


-- ------------------------------------------------------------------
-- signups_public: redacted view used by the volunteer-facing UI.
--
-- Coordinator chose "Sarah K." for the public label (first name + last
-- initial). We derive this from volunteer_name on the fly so the
-- volunteer_phone column never travels through this view.
--
-- Edge cases:
--   "Sarah Kim"        -> "Sarah K."
--   "Sarah Anne Kim"   -> "Sarah K." (last word treated as surname)
--   "Sarah"            -> "Sarah"    (single token, returned as-is)
--   "  Sarah  Kim  "   -> "Sarah K." (whitespace trimmed)
-- ------------------------------------------------------------------
create or replace view public.signups_public as
select
  id,
  slot_id,
  case
    when position(' ' in trim(volunteer_name)) > 0 then
      split_part(trim(volunteer_name), ' ', 1)
        || ' '
        || upper(left(split_part(trim(volunteer_name), ' ', -1), 1))
        || '.'
    else
      trim(volunteer_name)
  end as volunteer_label,
  status,
  created_at
from public.signups
where status = 'confirmed';

comment on view public.signups_public is
  'Public-safe projection of signups. NO volunteer_phone. Name redacted to "Sarah K.".';


-- ------------------------------------------------------------------
-- slots_with_status: open / full / gap computed server-side
--
-- The volunteer view reads ONLY this view. The client never reconstructs
-- "is the slot full?" from raw signup rows.
-- ------------------------------------------------------------------
create or replace view public.slots_with_status as
select
  s.id,
  s.location_id,
  l.name        as location_name,
  l.category,
  l.priority    as location_priority,
  l.address,
  l.lat,
  l.lng,
  s.start_time,
  s.end_time,
  s.capacity,
  s.priority_tier,
  count(su.id) filter (where su.status = 'confirmed')
    as filled,
  greatest(s.capacity - count(su.id) filter (where su.status = 'confirmed'), 0)
    as spots_left,
  case
    when count(su.id) filter (where su.status = 'confirmed') >= s.capacity
      then 'full'
    when s.start_time <= now() + interval '6 hours'
      then 'gap'   -- open and imminent — needs filling now
    else 'open'
  end as state
from public.slots s
join public.locations l on l.id = s.location_id
left join public.signups su on su.slot_id = s.id
where l.is_active = true
group by
  s.id, s.location_id, l.name, l.category, l.priority,
  l.address, l.lat, l.lng,
  s.start_time, s.end_time, s.capacity, s.priority_tier;

comment on view public.slots_with_status is
  'Per-slot status (open/full/gap) with aggregate counts. NO volunteer_phone, NO names.';
