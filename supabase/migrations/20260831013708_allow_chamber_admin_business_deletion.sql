create policy "chamber admins delete town businesses"
on public.businesses for delete to authenticated
using (
  exists (
    select 1
    from public.memberships m
    join public.chambers c on c.id = m.chamber_id
    where m.user_id = (select auth.uid())
      and m.role = 'chamber_admin'
      and c.town_id = businesses.town_id
  )
);
