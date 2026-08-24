create policy "Business members view favorites"
on public.business_favorites for select to authenticated
using (
  exists (
    select 1
    from public.memberships m
    where m.user_id = (select auth.uid())
      and m.business_id = business_favorites.business_id
      and m.role in ('business_admin', 'business_editor')
  )
);

create policy "Business members view redemptions"
on public.redemptions for select to authenticated
using (
  exists (
    select 1
    from public.offers o
    join public.memberships m on m.business_id = o.business_id
    where o.id = redemptions.offer_id
      and m.user_id = (select auth.uid())
      and m.role in ('business_admin', 'business_editor')
  )
);
