create extension if not exists pgcrypto;
create type public.app_role as enum ('consumer','business_admin','business_editor','chamber_admin','chamber_editor','platform_admin');
create type public.record_status as enum ('draft','scheduled','published','archived');
create type public.invite_status as enum ('pending','accepted','expired','revoked');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, avatar_url text, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.towns (id uuid primary key default gen_random_uuid(), name text not null, state text not null, slug text not null unique, timezone text not null default 'America/New_York', is_active boolean not null default true, created_at timestamptz not null default now());
create table public.chambers (id uuid primary key default gen_random_uuid(), town_id uuid not null references public.towns on delete restrict, name text not null, email text, website text, logo_url text, created_at timestamptz not null default now());
create table public.businesses (id uuid primary key default gen_random_uuid(), town_id uuid not null references public.towns on delete restrict, name text not null, slug text not null, category text not null, description text not null default '', address text not null default '', phone text, website text, image_url text, status public.record_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(town_id,slug));
create table public.memberships (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, role public.app_role not null, business_id uuid references public.businesses on delete cascade, chamber_id uuid references public.chambers on delete cascade, created_at timestamptz not null default now(), check ((role in ('business_admin','business_editor') and business_id is not null and chamber_id is null) or (role in ('chamber_admin','chamber_editor') and chamber_id is not null and business_id is null) or (role in ('consumer','platform_admin') and business_id is null and chamber_id is null)));
create unique index memberships_scope_unique on public.memberships(user_id,role,coalesce(business_id,'00000000-0000-0000-0000-000000000000'),coalesce(chamber_id,'00000000-0000-0000-0000-000000000000'));
create table public.offers (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses on delete cascade, title text not null, description text not null default '', terms text, status public.record_status not null default 'draft', starts_at timestamptz not null, ends_at timestamptz not null, redemption_limit_per_user integer not null default 1 check(redemption_limit_per_user>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends_at>starts_at));
create table public.events (id uuid primary key default gen_random_uuid(), town_id uuid not null references public.towns on delete cascade, chamber_id uuid references public.chambers on delete set null, title text not null, description text not null default '', venue text not null, starts_at timestamptz not null, ends_at timestamptz, recurrence_rule text, image_url text, status public.record_status not null default 'draft', created_at timestamptz not null default now(), check(ends_at is null or ends_at>starts_at));
create table public.announcements (id uuid primary key default gen_random_uuid(), town_id uuid not null references public.towns on delete cascade, chamber_id uuid not null references public.chambers on delete cascade, title text not null, body text not null, image_url text, call_to_action_url text, status public.record_status not null default 'draft', starts_at timestamptz not null, ends_at timestamptz, created_at timestamptz not null default now());
create table public.user_towns (user_id uuid not null references auth.users on delete cascade, town_id uuid not null references public.towns on delete cascade, is_primary boolean not null default false, created_at timestamptz not null default now(), primary key(user_id,town_id));
create unique index one_primary_town_per_user on public.user_towns(user_id) where is_primary;
create table public.business_favorites (user_id uuid not null references auth.users on delete cascade, business_id uuid not null references public.businesses on delete cascade, created_at timestamptz not null default now(), primary key(user_id,business_id));
create table public.offer_saves (user_id uuid not null references auth.users on delete cascade, offer_id uuid not null references public.offers on delete cascade, created_at timestamptz not null default now(), primary key(user_id,offer_id));
create table public.redemptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete restrict, offer_id uuid not null references public.offers on delete restrict, redeemed_at timestamptz not null default now(), verified_by uuid references auth.users on delete set null);
create table public.invitations (id uuid primary key default gen_random_uuid(), email text not null, role public.app_role not null, business_id uuid references public.businesses on delete cascade, chamber_id uuid references public.chambers on delete cascade, invited_by uuid not null references auth.users on delete restrict, token_hash text not null unique, status public.invite_status not null default 'pending', expires_at timestamptz not null, created_at timestamptz not null default now());

alter table public.profiles enable row level security; alter table public.towns enable row level security; alter table public.chambers enable row level security; alter table public.businesses enable row level security; alter table public.memberships enable row level security; alter table public.offers enable row level security; alter table public.events enable row level security; alter table public.announcements enable row level security; alter table public.user_towns enable row level security; alter table public.business_favorites enable row level security; alter table public.offer_saves enable row level security; alter table public.redemptions enable row level security; alter table public.invitations enable row level security;

create policy "published towns are public" on public.towns for select to anon,authenticated using(is_active);
create policy "published chambers are public" on public.chambers for select to anon,authenticated using(true);
create policy "published businesses are public" on public.businesses for select to anon,authenticated using(status='published');
create policy "published offers are public" on public.offers for select to anon,authenticated using(status='published' and now() between starts_at and ends_at);
create policy "published events are public" on public.events for select to anon,authenticated using(status='published');
create policy "published announcements are public" on public.announcements for select to anon,authenticated using(status='published' and now()>=starts_at and (ends_at is null or now()<=ends_at));
create policy "users read own profile" on public.profiles for select to authenticated using((select auth.uid())=id);
create policy "users update own profile" on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy "users read own memberships" on public.memberships for select to authenticated using((select auth.uid())=user_id);
create policy "users manage own towns" on public.user_towns for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "users manage own favorites" on public.business_favorites for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "users manage own offer saves" on public.offer_saves for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "users read own redemptions" on public.redemptions for select to authenticated using((select auth.uid())=user_id);
create policy "users create own redemptions" on public.redemptions for insert to authenticated with check((select auth.uid())=user_id);

create policy "business members manage their business" on public.businesses for all to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.business_id=businesses.id and m.role in ('business_admin','business_editor')))
with check(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.business_id=businesses.id and m.role in ('business_admin','business_editor')));
create policy "business members manage their offers" on public.offers for all to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.business_id=offers.business_id and m.role in ('business_admin','business_editor')))
with check(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.business_id=offers.business_id and m.role in ('business_admin','business_editor')));
create policy "chamber members manage their chamber" on public.chambers for update to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.chamber_id=chambers.id and m.role in ('chamber_admin','chamber_editor')))
with check(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.chamber_id=chambers.id and m.role in ('chamber_admin','chamber_editor')));
create policy "chamber members manage events" on public.events for all to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.chamber_id=events.chamber_id and m.role in ('chamber_admin','chamber_editor')))
with check(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.chamber_id=events.chamber_id and m.role in ('chamber_admin','chamber_editor')));
create policy "chamber members manage announcements" on public.announcements for all to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.chamber_id=announcements.chamber_id and m.role in ('chamber_admin','chamber_editor')))
with check(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.chamber_id=announcements.chamber_id and m.role in ('chamber_admin','chamber_editor')));
create policy "admins read scoped invitations" on public.invitations for select to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.role in ('business_admin','chamber_admin') and (m.business_id=invitations.business_id or m.chamber_id=invitations.chamber_id)));

create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,avatar_url) values(new.id,new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'avatar_url');
  insert into public.memberships(user_id,role) values(new.id,'consumer');
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

grant select on public.towns,public.chambers,public.businesses,public.offers,public.events,public.announcements to anon,authenticated;
grant select,update on public.profiles to authenticated;
grant select on public.memberships to authenticated;
grant select,insert,update,delete on public.user_towns,public.business_favorites,public.offer_saves to authenticated;
grant select,insert on public.redemptions to authenticated;
grant insert,update,delete on public.businesses,public.offers,public.events,public.announcements to authenticated;
grant update on public.chambers to authenticated;
grant select on public.invitations to authenticated;
