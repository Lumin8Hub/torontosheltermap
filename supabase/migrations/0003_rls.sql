-- 0003_rls.sql
-- Spec reference: EPIC 2 — Security (RLS) — CRITICAL
--
-- Paste this AFTER 0001_schema.sql and 0002_views.sql have run successfully.
--
-- This is the privacy gate for the whole project. After this runs, the
-- EPIC 2.7 checklist in supabase/README.md MUST pass before any
-- frontend code is shipped.
-- -----------------------------------------------------------------------------


-- ------------------------------------------------------------------
-- 2.1 — Enable RLS on every table.
-- With RLS on and no policies, all access is denied by default. That's
-- our safe starting point; we then re-open exactly what each role needs.
-- ------------------------------------------------------------------
alter table public.locations enable row level security;
alter table public.slots     enable row level security;
alter table public.signups   enable row level security;
alter table public.admins    enable row level security;


-- ------------------------------------------------------------------
-- 2.2 — Admin helper function
--
-- security definer + stable so it can be called from inside policies
-- without recursing through RLS itself. Returns true only when the
-- caller's auth.uid() is present in public.admins.
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

comment on function public.is_admin() is
  'True iff the current authenticated user is in public.admins. Safe to call from RLS policies.';


-- ------------------------------------------------------------------
-- 2.3 — Public read policies
--
-- locations: anyone may read ACTIVE locations.
-- slots: anyone may read any row (the status view is the friendlier API
--   but we don't forbid the base table since slot start/end/capacity
--   aren't sensitive on their own).
--
-- IMPORTANT: there is intentionally NO anon SELECT policy on
-- public.signups. Anon must never read that table — they get the
-- redacted view public.signups_public instead.
-- ------------------------------------------------------------------
drop policy if exists "public read locations" on public.locations;
create policy "public read locations"
  on public.locations for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "public read slots" on public.slots;
create policy "public read slots"
  on public.slots for select
  to anon, authenticated
  using (true);


-- ------------------------------------------------------------------
-- 2.4 — Anon writes go through book_slot RPC ONLY
--
-- The spec (EPIC 2.5) describes an "anon can INSERT into public.signups"
-- policy. We deliberately do NOT install one — direct INSERT lets a
-- malicious anon bypass the capacity check that lives inside book_slot
-- (verified locally: a capacity=2 slot ends up with 3 rows). All
-- volunteer writes are therefore funnelled through public.book_slot(),
-- which is security_definer (0004_rpc.sql) and works without an INSERT
-- policy because the function runs as its owner.
-- ------------------------------------------------------------------
drop policy if exists "public can create signup" on public.signups;


-- ------------------------------------------------------------------
-- 2.5 — Admin full-access policies on every table
--
-- These policies all gate on public.is_admin(). A logged-in user who is
-- NOT in public.admins gets the same denied-by-default behaviour as anon.
-- ------------------------------------------------------------------
drop policy if exists "admin read signups"   on public.signups;
drop policy if exists "admin insert signups" on public.signups;
drop policy if exists "admin update signups" on public.signups;
drop policy if exists "admin delete signups" on public.signups;

create policy "admin read signups"
  on public.signups for select to authenticated
  using (public.is_admin());

-- Admin walk-in form (EPIC 6.4): admins can register an in-person volunteer
-- directly, bypassing the book_slot RPC's capacity check. The admin UI is
-- still expected to use book_slot in the normal case; this policy is the
-- escape hatch for overbooking when a real person walks up.
create policy "admin insert signups"
  on public.signups for insert to authenticated
  with check (public.is_admin());

create policy "admin update signups"
  on public.signups for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin delete signups"
  on public.signups for delete to authenticated
  using (public.is_admin());

drop policy if exists "admin write locations" on public.locations;
create policy "admin write locations"
  on public.locations for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin write slots" on public.slots;
create policy "admin write slots"
  on public.slots for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin read admins" on public.admins;
create policy "admin read admins"
  on public.admins for select to authenticated
  using (public.is_admin());


-- ------------------------------------------------------------------
-- 2.6 — View security mode
--
-- We deliberately KEEP both views as security_definer (Postgres default)
-- — NOT security_invoker. See the long comment at the top of
-- 0002_views.sql for why. The protection here is that the view
-- definitions themselves exclude volunteer_phone; EPIC 2.7 verifies
-- that no phone column is reachable through either view.
-- ------------------------------------------------------------------

-- No alter view statements here on purpose. If you ever convert these
-- to security_invoker, also add narrow anon SELECT policies on signups
-- that filter on column-level GRANTs — but Postgres doesn't enforce
-- column-level GRANTs against RLS, so this is a dead end. The current
-- arrangement is correct: locked base table + safe-by-definition views.
