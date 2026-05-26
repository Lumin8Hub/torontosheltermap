-- 0004_rpc.sql
-- Spec reference: EPIC 3 — Booking integrity (anti-double-booking)
--                 + bulk slot generator
--
-- Paste this AFTER 0001_schema.sql, 0002_views.sql, and 0003_rls.sql.
--
-- These are the only mutation paths the application uses:
--   - book_slot       — public RPC, called by the volunteer UI
--   - generate_slots  — admin-only, called from the admin UI to bulk-fill
--                       a day of 2-hour slots for a location
-- -----------------------------------------------------------------------------


-- ------------------------------------------------------------------
-- book_slot(p_slot_id, p_name, p_phone)
--
-- Transactionally locks the target slot row (FOR UPDATE), checks capacity,
-- and inserts the signup. Two concurrent callers competing for the last
-- spot: exactly one returns the signup row, the other raises 'SLOT_FULL'.
--
-- security definer is required so anon can call it (the function body
-- inserts into public.signups, which anon can also do via the policy in
-- 0003_rls.sql, but the FOR UPDATE row lock against public.slots needs
-- elevated permissions because the policy on slots is SELECT-only).
--
-- set search_path = public is a Supabase best practice for security
-- definer functions; without it, a malicious schema in the user's
-- search path could shadow public.signups.
-- ------------------------------------------------------------------
create or replace function public.book_slot(
  p_slot_id uuid,
  p_name    text,
  p_phone   text
)
returns public.signups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity int;
  v_filled   int;
  v_row      public.signups;
begin
  -- Lock this slot row so concurrent book_slot calls serialize on it.
  select capacity
    into v_capacity
    from public.slots
    where id = p_slot_id
    for update;

  if v_capacity is null then
    raise exception 'SLOT_NOT_FOUND';
  end if;

  -- Count confirmed signups WITHIN the lock window.
  select count(*)
    into v_filled
    from public.signups
    where slot_id = p_slot_id
      and status = 'confirmed';

  if v_filled >= v_capacity then
    raise exception 'SLOT_FULL';
  end if;

  if length(trim(coalesce(p_name,  ''))) = 0
     or length(trim(coalesce(p_phone, ''))) < 7 then
    raise exception 'INVALID_INPUT';
  end if;

  insert into public.signups (slot_id, volunteer_name, volunteer_phone, status)
  values (p_slot_id, trim(p_name), trim(p_phone), 'confirmed')
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.book_slot(uuid, text, text) is
  'Public RPC: claim a slot. Transactionally enforces capacity. Raises SLOT_FULL / SLOT_NOT_FOUND / INVALID_INPUT.';

grant execute on function public.book_slot(uuid, text, text)
  to anon, authenticated;


-- ------------------------------------------------------------------
-- generate_slots(p_location_id, p_day, p_first_hour, p_last_hour, p_capacity)
--
-- Admin-only helper. Generates 2-hour slots covering [p_first_hour, p_last_hour]
-- on the given calendar day for the given location.
--
-- Coordinator chose 24h coverage (00:00 .. 22:00 start times, last slot
-- runs 22:00-24:00). Defaults updated to match.
--
-- on conflict (location_id, start_time) do nothing — re-running for the
-- same day is a no-op, so it's safe to "fill forward" without checking
-- what's already there.
-- ------------------------------------------------------------------
create or replace function public.generate_slots(
  p_location_id uuid,
  p_day         date,
  p_first_hour  int default 0,    -- 00:00
  p_last_hour   int default 22,   -- last slot STARTS 22:00 (runs to midnight)
  p_capacity    int default 2     -- coordinator: up to two vols / slot
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  h int;
  n int := 0;
begin
  if not public.is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if p_first_hour < 0 or p_last_hour > 22 or p_first_hour > p_last_hour then
    raise exception 'INVALID_RANGE';
  end if;

  -- Sanity: step by 2 hours.
  if (p_last_hour - p_first_hour) % 2 <> 0 then
    raise exception 'INVALID_RANGE: range must be a multiple of 2 hours';
  end if;

  h := p_first_hour;
  while h <= p_last_hour loop
    insert into public.slots (location_id, start_time, end_time, capacity)
    values (
      p_location_id,
      (p_day::timestamptz + make_interval(hours => h)),
      (p_day::timestamptz + make_interval(hours => h + 2)),
      p_capacity
    )
    on conflict (location_id, start_time) do nothing;

    h := h + 2;
    n := n + 1;
  end loop;

  return n;
end;
$$;

comment on function public.generate_slots(uuid, date, int, int, int) is
  'Admin-only: bulk-create 2-hour slots for one location on one day.';

grant execute on function public.generate_slots(uuid, date, int, int, int)
  to authenticated;
