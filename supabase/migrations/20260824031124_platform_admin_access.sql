create schema if not exists private;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where user_id = (select auth.uid())
      and role = 'platform_admin'
  );
$$;

revoke all on function private.is_platform_admin() from public;
grant execute on function private.is_platform_admin() to authenticated;

create policy "Platform admins manage towns"
on public.towns for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins manage chambers"
on public.chambers for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins manage businesses"
on public.businesses for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins manage offers"
on public.offers for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins manage events"
on public.events for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins manage announcements"
on public.announcements for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins manage invitations"
on public.invitations for all to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "Platform admins view favorites"
on public.business_favorites for select to authenticated
using ((select private.is_platform_admin()));

create policy "Platform admins view saves"
on public.offer_saves for select to authenticated
using ((select private.is_platform_admin()));

create policy "Platform admins view redemptions"
on public.redemptions for select to authenticated
using ((select private.is_platform_admin()));
