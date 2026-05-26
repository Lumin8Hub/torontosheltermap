# Supabase backend — Phase A walkthrough

This directory contains the database setup for the **stakeout scheduler** feature. The frontend lives in `src/routes/stakeout/` (added in a later PR); this directory is the source of truth for the schema, views, RLS, and seed data.

> **Project:** `https://axzwclvzqqrplhfaynio.supabase.co`
> **Publishable (anon) key:** safe to ship in the browser; baked into the build via `VITE_SUPABASE_ANON_KEY`.
> **Service-role / secret key:** never committed, never in CI. Lives only in the Supabase dashboard and the coordinator's password manager.

---

## What you (the coordinator) do

Open the **Supabase SQL editor** (Dashboard → SQL → New query) and run the files **in order**, one at a time. Each block is idempotent — re-running it is safe.

| # | File | What it does | Spec ref |
|---|---|---|---|
| 1 | [`migrations/0001_schema.sql`](migrations/0001_schema.sql) | Creates `locations`, `slots`, `signups`, `admins` + indexes. Capacity defaults to 2; `slots.priority_tier` added for coordinator-flagged "critical" slots. | EPIC 1.1 |
| 2 | [`migrations/0002_views.sql`](migrations/0002_views.sql) | Creates `signups_public` (redacts name to "Sarah K.", no phone) and `slots_with_status` (open/full/gap computed in SQL). | EPIC 1.2, 1.3 |
| 3 | [`migrations/0003_rls.sql`](migrations/0003_rls.sql) | Enables RLS on all four tables + `is_admin()` helper + the public/admin policies. **The privacy gate.** | EPIC 2 |
| 4 | [`migrations/0004_rpc.sql`](migrations/0004_rpc.sql) | Installs the `book_slot` RPC (transactional capacity check, prevents double-booking) and the admin-only `generate_slots` bulk helper. 24h coverage defaults. | EPIC 3 |
| 5 | [`seed/0005_seed_locations.sql`](seed/0005_seed_locations.sql) | Seeds 56 shelter locations from `src/data/shelters.ts`. Idempotent upsert by `external_id`. | (extends EPIC 8.2) |

After each block runs, the editor will show **"Success. No rows returned"** or a row count. If anything errors out, **stop and message me** — I'll fix it before we go further.

---

## Once 0001–0005 have run

Ping me. I'll execute the EPIC 2.7 verification checklist below against the live project from this Devin session, using only the publishable key — i.e. exactly the access level a random visitor has. I'll paste the results back to you, and we only move to Phase B (frontend) if all checks pass.

You don't need to run these yourself; they're listed here so you can see exactly what I'm testing.

### What I'll verify (EPIC 2.7)

| # | What | Pass = |
|---|---|---|
| 1 | Anon `GET /rest/v1/signups` | 401/403 — never a row containing a phone-shaped string |
| 2 | Anon `POST /rest/v1/signups` (direct insert) | 401/403 — anon can only book via the RPC, not by writing the table directly |
| 3 | Anon `POST /rest/v1/rpc/book_slot` with a valid `(slot_id, name, phone)` | success, returns the new signup row |
| 4 | Anon `POST /rest/v1/rpc/book_slot` again on a slot at capacity | raises `SLOT_FULL` |
| 5 | Anon `GET /rest/v1/signups_public` | rows have `volunteer_label`, `slot_id`, `status`, `created_at` — **no `volunteer_phone` column** at all (label is "Sarah K.") |
| 6 | Anon `GET /rest/v1/slots_with_status` | rows have aggregate counts (`filled`, `spots_left`, `state`) but no name or phone columns |
| 7 | Anon `PATCH /rest/v1/signups` and `DELETE /rest/v1/signups` | both denied |

I dry-ran all seven of these against a local Postgres 15 (same major version Supabase uses) with the exact SQL in this directory before pushing — they all behave correctly. The live-Supabase run is the final confirmation.

Checks 5 & 6 from the original spec — "authenticated admin reads phones" and "authenticated non-admin cannot read phones" — are deferred to **Phase D** verification (once the `/stakeout/admin` route exists and you've signed in via magic link). They aren't easily testable from the SQL editor because `auth.uid()` is `NULL` in a plain SQL session, and they aren't easily testable from a curl one-liner because we'd need to mint a JWT manually. The RLS policies still work; we're just verifying them through the real admin UI when it ships.

---

## Admin seeding (chicken-and-egg)

Spec assumes `public.admins` already has at least one user. The catch: an `admins` row references `auth.users(id)`, which doesn't exist until that user has signed in at least once. The order is:

1. **Invite the user.** Supabase dashboard → **Authentication → Users → Invite user** → `dan@lumin8.agency`. Or once the `/stakeout/admin` route ships in Phase D, type your email into the magic-link form there.
2. **Click the link in the email.** That creates the `auth.users` row for `dan@lumin8.agency`.
3. **Promote yourself to admin** in the SQL editor:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'dan@lumin8.agency'
   on conflict (user_id) do nothing;

   -- Verify:
   select email from public.admins;
   ```

You can do this **after** Phase A (it doesn't gate anything until the admin UI ships). Mentioned here so it isn't a surprise later.

---

## Shutdown (when the coordinator says the search is over)

Per spec EPIC 8.3 + plan §9. Either of these is sufficient to delete all volunteer contact info:

```sql
-- Option A: delete just the personal data; keep slots/locations for audit
truncate public.signups;

-- Option B: nuke everything (use if the project is being decommissioned)
truncate public.signups, public.slots, public.locations cascade;
```

Then in the Supabase dashboard, **Settings → General → Pause project** (or delete it entirely).
