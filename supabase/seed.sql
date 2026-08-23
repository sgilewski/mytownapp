begin;

insert into public.towns (id, name, state, slug, timezone, is_active)
values ('10000000-0000-0000-0000-000000000001', 'Hillside', 'NJ', 'hillside-nj', 'America/New_York', true)
on conflict (id) do update set name = excluded.name, state = excluded.state, slug = excluded.slug, timezone = excluded.timezone, is_active = excluded.is_active;

insert into public.chambers (id, town_id, name, email, website)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hillside Chamber', 'hello@hillsidechamber.example', 'https://hillsidechamber.example')
on conflict (id) do update set town_id = excluded.town_id, name = excluded.name, email = excluded.email, website = excluded.website;

insert into public.businesses (id, town_id, name, slug, category, description, address, status)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Birch & Main', 'birch-and-main', 'Shopping', 'Thoughtful home goods and gifts, chosen locally.', '18 Main Street', 'published'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Foundry Coffee', 'foundry-coffee', 'Food & Drink', 'Small-batch coffee and a sunny place to gather.', '42 Market Lane', 'published'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Trailhead Outfitters', 'trailhead-outfitters', 'Outdoors', 'Gear and guidance for your next local adventure.', '7 River Road', 'published')
on conflict (id) do update set town_id = excluded.town_id, name = excluded.name, slug = excluded.slug, category = excluded.category, description = excluded.description, address = excluded.address, status = excluded.status, updated_at = now();

insert into public.offers (id, business_id, title, description, terms, status, starts_at, ends_at, redemption_limit_per_user)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20% off one local favorite', 'Choose any one regularly priced item.', 'One regularly priced item per customer.', 'published', '2026-08-01T00:00:00-04:00', '2026-09-30T23:59:59-04:00', 1),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Coffee + pastry for $8', 'Weekdays through 11am.', 'Valid weekdays before 11am.', 'published', '2026-08-01T00:00:00-04:00', '2026-10-01T23:59:59-04:00', 1)
on conflict (id) do update set business_id = excluded.business_id, title = excluded.title, description = excluded.description, terms = excluded.terms, status = excluded.status, starts_at = excluded.starts_at, ends_at = excluded.ends_at, redemption_limit_per_user = excluded.redemption_limit_per_user, updated_at = now();

insert into public.events (id, town_id, chamber_id, title, description, venue, starts_at, ends_at, recurrence_rule, status)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Friday Night on Main', 'Food, music, and neighbors on the Town Green.', 'Town Green', '2026-08-28T18:00:00-04:00', '2026-08-28T21:00:00-04:00', 'Every Friday in August', 'published'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Fall Makers Market', 'Shop local makers and seasonal goods.', 'Foundry Hall', '2026-09-12T10:00:00-04:00', '2026-09-12T15:00:00-04:00', null, 'published')
on conflict (id) do update set town_id = excluded.town_id, chamber_id = excluded.chamber_id, title = excluded.title, description = excluded.description, venue = excluded.venue, starts_at = excluded.starts_at, ends_at = excluded.ends_at, recurrence_rule = excluded.recurrence_rule, status = excluded.status;

insert into public.announcements (id, town_id, chamber_id, title, body, status, starts_at, ends_at)
values ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Welcome to mytownapp', 'Discover local businesses, save offers, and stay connected to what is happening in Hillside.', 'published', '2026-08-01T00:00:00-04:00', null)
on conflict (id) do update set town_id = excluded.town_id, chamber_id = excluded.chamber_id, title = excluded.title, body = excluded.body, status = excluded.status, starts_at = excluded.starts_at, ends_at = excluded.ends_at;

commit;
