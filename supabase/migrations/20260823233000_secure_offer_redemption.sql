create or replace function public.redeem_offer(p_offer_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_limit integer;
  v_redemption_count integer;
  v_redemption_id uuid;
begin
  if v_user_id is null then
    raise exception 'Sign in to redeem an offer' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_offer_id::text, 0)
  );

  select redemption_limit_per_user
  into v_limit
  from public.offers
  where id = p_offer_id
    and status = 'published'
    and pg_catalog.now() between starts_at and ends_at;

  if v_limit is null then
    raise exception 'This offer is not currently available' using errcode = 'P0001';
  end if;

  select pg_catalog.count(*)
  into v_redemption_count
  from public.redemptions
  where user_id = v_user_id and offer_id = p_offer_id;

  if v_redemption_count >= v_limit then
    raise exception 'You have already used this offer' using errcode = 'P0001';
  end if;

  insert into public.redemptions (user_id, offer_id)
  values (v_user_id, p_offer_id)
  returning id into v_redemption_id;

  return v_redemption_id;
end;
$$;

revoke execute on function public.redeem_offer(uuid) from public, anon;
grant execute on function public.redeem_offer(uuid) to authenticated;

create index if not exists redemptions_user_offer_idx
on public.redemptions (user_id, offer_id);
