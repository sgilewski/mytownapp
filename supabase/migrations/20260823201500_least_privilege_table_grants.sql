revoke all privileges on table public.profiles,public.towns,public.chambers,public.businesses,public.memberships,public.offers,public.events,public.announcements,public.user_towns,public.business_favorites,public.offer_saves,public.redemptions,public.invitations from anon,authenticated;

grant select on public.towns,public.chambers,public.businesses,public.offers,public.events,public.announcements to anon,authenticated;
grant select,update on public.profiles to authenticated;
grant select on public.memberships to authenticated;
grant select,insert,update,delete on public.user_towns,public.business_favorites,public.offer_saves to authenticated;
grant select,insert on public.redemptions to authenticated;
grant insert,update,delete on public.businesses,public.offers,public.events,public.announcements to authenticated;
grant update on public.chambers to authenticated;
grant select,insert,update on public.invitations to authenticated;
