-- 0005_seed_locations.sql
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
  ('covenant-house', 'Covenant House Toronto', 'shelter', '20 Gerrard St E', 43.6586, -79.3812, 1),
  ('evas-phoenix', 'Eva''s Phoenix', 'shelter', '60 Brant St', 43.6453, -79.3989, 1),
  ('native-child', 'Native Child & Family Services', 'shelter', '558 Bathurst St', 43.6548, -79.4086, 1),
  ('sherbourne-health', 'Sherbourne Health', 'shelter', '333 Sherbourne St', 43.6606, -79.3698, 1),
  ('woodgreen', 'WoodGreen Emergency Shelter', 'shelter', '95 Wellesley St E', 43.6657, -79.3803, 1),
  ('ymca-wagner', 'YMCA Wagner Green Shelter', 'shelter', '7 Vanauley St', 43.6491, -79.3976, 1),
  ('ywca-woodlawn', 'YWCA 1st Stop Woodlawn', 'shelter', '80 Woodlawn Ave E', 43.6842, -79.3888, 1),
  ('christie-ossington', 'Christie Ossington Centre', 'shelter', '850 & 854 Bloor St W', 43.6622, -79.4239, 3),
  ('dixon-hall', 'Dixon Hall (The Schoolhouse)', 'shelter', '349 George St', 43.6601, -79.3742, 3),
  ('fred-victor-fatima', 'Fred Victor (Fatima House)', 'shelter', '1059 College St', 43.6528, -79.4326, 3),
  ('homes-first', 'Homes First Society', 'shelter', '545 Lake Shore Blvd W', 43.6358, -79.3986, 3),
  ('red-door', 'Red Door Shelters', 'shelter', 'Queen St E Area', 43.661, -79.34, 3),
  ('sa-gateway', 'Salvation Army Gateway', 'shelter', '107 Jarvis St', 43.6528, -79.3719, 3),
  ('sa-maxwell', 'Salvation Army Maxwell Meighen', 'shelter', '135 Sherbourne St', 43.6534, -79.3683, 3),
  ('scott-mission', 'Scott Mission Men''s Shelter', 'shelter', '346 Spadina Ave', 43.6549, -79.3988, 3),
  ('ssvp', 'Society of St. Vincent de Paul', 'shelter', '70 Gerrard St E', 43.659, -79.3794, 3),
  ('st-simons', 'St Simon''s Clubbehouse', 'shelter', '556 Sherbourne St', 43.668, -79.374, 3),
  ('street-haven', 'Street Haven at the Crossroads', 'shelter', '87 Pembroke St', 43.6588, -79.3725, 3),
  ('robertson-house', 'Toronto Shelter (Robertson House)', 'shelter', '291 Sherbourne St', 43.6585, -79.3691, 3),
  ('seaton-house', 'Toronto Shelter (Seaton House)', 'shelter', '339 George St', 43.6596, -79.3743, 3),
  ('womens-res', 'Toronto Shelter (Women''s Res)', 'shelter', '674 Dundas St W', 43.6517, -79.4034, 3),
  ('ywca-davenport', 'YWCA Davenport', 'shelter', '348 Davenport Rd', 43.6766, -79.4011, 3),
  ('corner-drop-in', 'The Corner Drop-in', 'shelter', '260 Augusta Ave', 43.6555, -79.4017, 2),
  ('evangel-hall', 'Evangel Hall Mission', 'shelter', '552 Adelaide St W', 43.6457, -79.4007, 2),
  ('lawyers-feed', 'Lawyers Feed the Hungry', 'shelter', '130 Queen St W', 43.6525, -79.3855, 2),
  ('meeting-place', 'The Meeting Place', 'shelter', '588 Queen St W', 43.6478, -79.4029, 2),
  ('cecil-community', 'Cecil Community Centre', 'shelter', '58 Cecil St', 43.6571, -79.3987, 2),
  ('all-saints', 'All Saints Church-Community Centre', 'shelter', '315 Dundas St E', 43.6586, -79.3724, 2),
  ('good-shepherd', 'Good Shepherd Centre', 'shelter', '412 Queen St E', 43.6566, -79.3681, 2),
  ('haven-toronto', 'Haven Toronto', 'shelter', '170 Jarvis St', 43.6553, -79.3736, 2),
  ('loft-416', 'LOFT 416 Drop-In Centre', 'shelter', '416 Dundas St E', 43.6601, -79.3686, 2),
  ('st-john-compassionate', 'St. John the Compassionate', 'shelter', '155 Broadview Ave', 43.6601, -79.3514, 2),
  ('council-fire', 'Toronto Council Fire Native Centre', 'shelter', '439 Dundas St E', 43.6604, -79.3673, 2),
  ('holy-trinity-drop', 'Church of the Holy Trinity', 'shelter', '19 Trinity Sq', 43.6541, -79.3816, 2),
  ('redeemer', 'Church of the Redeemer', 'shelter', '162 Bloor St W', 43.67, -79.3905, 2),
  ('met-united', 'Met United', 'shelter', '56 Queen St E', 43.6532, -79.3782, 2),
  ('sanctuary', 'Sanctuary Toronto', 'shelter', '25 Charles St E', 43.67, -79.3835, 2),
  ('st-basils', 'St. Basil''s Out of the Cold', 'shelter', '50 St. Joseph St', 43.6661, -79.3856, 2),
  ('dale-ministries', 'The Dale Ministries', 'shelter', '245 Dunn Ave', 43.6391, -79.4327, 2),
  ('lamp-chc', 'LAMP Community Health Centre', 'shelter', '156 Sixth St', 43.5947, -79.5036, 2),
  ('parc', 'Parkdale Activity-Recreation (PARC)', 'shelter', '1499 Queen St W', 43.6388, -79.4327, 2),
  ('st-francis-table', 'St. Francis'' Table', 'shelter', '1322 Queen St W', 43.6406, -79.4267, 2),
  ('the-stop', 'The Stop Community Food Centre', 'shelter', '1884 Davenport Rd', 43.6753, -79.4498, 2),
  ('the-519', 'The 519', 'shelter', '519 Church St', 43.6664, -79.3811, 2),
  ('fv-womens', 'Fred Victor Women''s Drop-In', 'shelter', '67 Adelaide St E', 43.6505, -79.3766, 2),
  ('syme-woolner', 'Syme Woolner (Jane''s Place)', 'shelter', '2468 Eglinton Ave W', 43.692, -79.467, 2),
  ('dixon-respite', 'Dixon Hall (George St Respite)', 'shelter', '354 George St', 43.66, -79.3741, 2),
  ('st-felix', 'St. Felix Centre', 'shelter', '69 Fraser Ave', 43.6386, -79.4196, 2),
  ('roehampton', 'The Roehampton Shelter', 'shelter', '808 Mount Pleasant Rd', 43.708, -79.387, 3),
  ('evas-satellite', 'Eva''s Satellite', 'shelter', 'Yonge & Sheppard Area', 43.7615, -79.4115, 1),
  ('ny-warming', 'North York Warming Centre', 'shelter', '12 Holmes Ave', 43.7665, -79.4135, 2),
  ('christ-church-deer-park', 'Christ Church Deer Park', 'shelter', '1570 Yonge St', 43.687, -79.3935, 2),
  ('holy-rosary', 'Holy Rosary Church (OOTC)', 'shelter', '356 St. Clair Ave W', 43.6855, -79.409, 2),
  ('st-clements', 'St. Clement''s Church', 'shelter', '70 St. Clements Ave', 43.709, -79.399, 2),
  ('glenview-presbyterian', 'Glenview Presbyterian Church (OOTC)', 'shelter', '1 Glenview Ave', 43.7195, -79.4015, 2),
  ('cummer-united', 'Cummer Avenue United Church', 'shelter', '53 Cummer Ave', 43.7905, -79.418, 2)
on conflict (external_id) do update set
  name      = excluded.name,
  category  = excluded.category,
  address   = excluded.address,
  lat       = excluded.lat,
  lng       = excluded.lng,
  priority  = excluded.priority,
  is_active = true;
