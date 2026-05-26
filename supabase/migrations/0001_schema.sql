-- 0001_schema.sql
-- Spec reference: EPIC 1.1 — Create core tables
--
-- Paste this block into the Supabase SQL editor and run it.
-- It is idempotent: every CREATE uses "if not exists" or "create or replace"
-- where possible. Re-running it is safe.
--
-- Coordinator decisions baked in (from the integration plan, §8):
--   - capacity default = 2 (was 1 in the spec; coordinator said up to 2 vols / slot)
--   - slots.priority_tier added (nullable text) so the coordinator can flag
--     overnight / "critical" slots without changing schema later
--   - locations stay aligned to the spec enum, but the seed in 0005 only fills
--     'shelter' rows for v1
-- -----------------------------------------------------------------------------

-- Postgres UUID generation (Supabase projects have this enabled by default,
-- but we declare it explicitly so this file runs cleanly on a fresh project).
create extension if not exists "pgcrypto";


-- ------------------------------------------------------------------
-- locations: the priority points volunteers will stake out
-- ------------------------------------------------------------------
create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  -- Stable key from src/data/shelters.ts so re-seeding is an UPSERT, not a
  -- duplicate-row creator. Nullable + unique (NULLs are allowed past UNIQUE).
  external_id text unique,
  name        text not null,
  category    text not null
    check (category in ('shelter','er','transit','library','food','pharmacy','other')),
  address     text,
  lat         double precision,
  lng         double precision,
  -- 1 = highest priority (volunteers should fill these first)
  priority    int  not null default 3,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.locations is
  'Priority points where volunteers stake out for the missing-person search. Public read.';
comment on column public.locations.category is
  'Coarse type: shelter|er|transit|library|food|pharmacy|other. V1 seed only fills "shelter".';
comment on column public.locations.priority is
  '1 = highest. Drives sort order in the volunteer view.';


-- ------------------------------------------------------------------
-- slots: 2-hour booking windows per location
-- ------------------------------------------------------------------
create table if not exists public.slots (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references public.locations(id) on delete cascade,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  -- Coordinator: up to two volunteers per location per 2h window.
  capacity      int  not null default 2 check (capacity >= 1),
  -- Coordinator: 24h coverage with emphasis on some slots — flag them here.
  -- NULL = normal. 'critical' = "must be filled" (e.g. overnight).
  -- 'high'  = "priority slot but not critical".
  -- This is a free text column with a soft check; we can expand the enum later
  -- without a schema migration if the coordinator changes the taxonomy.
  priority_tier text
    check (priority_tier is null or priority_tier in ('critical','high','normal')),
  created_at    timestamptz not null default now(),
  constraint slot_time_valid check (end_time > start_time),
  constraint slot_unique unique (location_id, start_time)
);

comment on table public.slots is
  '2-hour stakeout windows. Generated in bulk via public.generate_slots().';
comment on column public.slots.priority_tier is
  'Coordinator-set emphasis: critical | high | normal | NULL. Drives badge in UI.';


-- ------------------------------------------------------------------
-- signups: a volunteer claiming a slot. PRIVATE — phone column locked to admin.
-- ------------------------------------------------------------------
create table if not exists public.signups (
  id               uuid primary key default gen_random_uuid(),
  slot_id          uuid not null references public.slots(id) on delete cascade,
  volunteer_name   text not null,
  -- PRIVATE. Never exposed to the anon role. RLS in 0003_rls.sql blocks
  -- anon SELECT on this whole table. Views in 0002_views.sql expose only
  -- a redacted "Sarah K." label, no phone column.
  volunteer_phone  text not null,
  status           text not null default 'confirmed'
    check (status in ('confirmed','cancelled','no_show')),
  created_at       timestamptz not null default now()
);

comment on table public.signups is
  'Volunteer signups. volunteer_phone is PRIVATE — readable only by admins via RLS.';


-- ------------------------------------------------------------------
-- admins: which auth.users may read phone numbers & manage data
-- ------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allow-list of auth user IDs that the public.is_admin() function checks against.';


-- ------------------------------------------------------------------
-- Indexes for the common query paths
-- ------------------------------------------------------------------
create index if not exists idx_slots_location  on public.slots(location_id);
create index if not exists idx_slots_start     on public.slots(start_time);
create index if not exists idx_signups_slot    on public.signups(slot_id);
create index if not exists idx_signups_status  on public.signups(status);
create index if not exists idx_locations_active_priority
  on public.locations(priority) where is_active = true;
