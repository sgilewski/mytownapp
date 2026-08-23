create policy "chamber members view town businesses" on public.businesses for select to authenticated
using(exists(select 1 from public.memberships m join public.chambers c on c.id=m.chamber_id where m.user_id=(select auth.uid()) and m.role in ('chamber_admin','chamber_editor') and c.town_id=businesses.town_id));
create policy "admins create scoped invitations" on public.invitations for insert to authenticated
with check(invited_by=(select auth.uid()) and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.role in ('business_admin','chamber_admin') and (m.business_id=invitations.business_id or m.chamber_id=invitations.chamber_id)));
create policy "admins update scoped invitations" on public.invitations for update to authenticated
using(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.role in ('business_admin','chamber_admin') and (m.business_id=invitations.business_id or m.chamber_id=invitations.chamber_id)))
with check(exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.role in ('business_admin','chamber_admin') and (m.business_id=invitations.business_id or m.chamber_id=invitations.chamber_id)));
grant insert,update on public.invitations to authenticated;
