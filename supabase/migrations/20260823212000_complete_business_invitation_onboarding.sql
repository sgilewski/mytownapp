create policy "chamber admins create town businesses" on public.businesses for insert to authenticated
with check(exists(select 1 from public.memberships m join public.chambers c on c.id=m.chamber_id where m.user_id=(select auth.uid()) and m.role='chamber_admin' and c.town_id=businesses.town_id));

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,avatar_url) values(new.id,new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'avatar_url');
  insert into public.memberships(user_id,role) values(new.id,'consumer');
  insert into public.memberships(user_id,role,business_id,chamber_id)
  select new.id,i.role,
    case when i.role in ('business_admin','business_editor') then i.business_id else null end,
    case when i.role in ('chamber_admin','chamber_editor') then i.chamber_id else null end
  from public.invitations i
  where lower(i.email)=lower(new.email) and i.status='pending' and i.expires_at>now()
  on conflict do nothing;
  update public.invitations set status='accepted'
  where lower(email)=lower(new.email) and status='pending' and expires_at>now();
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public,anon,authenticated;

create function public.invite_business(p_chamber_id uuid,p_business_name text,p_owner_email text,p_invitation_token_hash text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare new_business_id uuid; chamber_town_id uuid;
begin
  select c.town_id into chamber_town_id from public.chambers c where c.id=p_chamber_id;
  if chamber_town_id is null then raise exception 'Chamber not found'; end if;
  insert into public.businesses(town_id,name,slug,category,status)
  values(chamber_town_id,p_business_name,lower(regexp_replace(p_business_name,'[^a-zA-Z0-9]+','-','g'))||'-'||substr(gen_random_uuid()::text,1,6),'Local','draft')
  returning id into new_business_id;
  insert into public.invitations(email,role,business_id,chamber_id,invited_by,token_hash,expires_at)
  values(lower(p_owner_email),'business_admin',new_business_id,p_chamber_id,(select auth.uid()),p_invitation_token_hash,now()+interval '7 days');
  return new_business_id;
end;
$$;
revoke all on function public.invite_business(uuid,text,text,text) from public,anon;
grant execute on function public.invite_business(uuid,text,text,text) to authenticated;
