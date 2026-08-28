create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path='' as $$
declare supplied_token_hash text := new.raw_user_meta_data->>'invitation_token_hash';
begin
  insert into public.profiles(id,full_name,avatar_url)
  values(new.id,new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'avatar_url');

  insert into public.memberships(user_id,role) values(new.id,'consumer');

  if exists (
    select 1 from public.invitations i
    where i.token_hash=supplied_token_hash
      and lower(i.email)=lower(new.email)
      and i.status='pending'
      and i.expires_at>now()
  ) then
    insert into public.memberships(user_id,role,business_id,chamber_id)
    select new.id,i.role,
      case when i.role in ('business_admin','business_editor') then i.business_id end,
      case when i.role in ('chamber_admin','chamber_editor') then i.chamber_id end
    from public.invitations i
    where lower(i.email)=lower(new.email) and i.status='pending' and i.expires_at>now()
    on conflict do nothing;

    update public.invitations set status='accepted'
    where lower(email)=lower(new.email) and status='pending' and expires_at>now();
  end if;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public,anon,authenticated;

create or replace function public.get_invitation_details(p_token_hash text)
returns table(email text, role public.app_role, chamber_id uuid, chamber_name text, business_id uuid, business_name text, expires_at timestamptz)
language sql stable security definer set search_path='' as $$
  select i.email,i.role,i.chamber_id,c.name,i.business_id,b.name,i.expires_at
  from public.invitations i
  left join public.chambers c on c.id=i.chamber_id
  left join public.businesses b on b.id=i.business_id
  where length(p_token_hash)=64 and i.token_hash=p_token_hash
    and i.status='pending' and i.expires_at>now()
  limit 1
$$;
revoke all on function public.get_invitation_details(text) from public;
grant execute on function public.get_invitation_details(text) to anon,authenticated;

create or replace function public.accept_invitation(p_token_hash text)
returns void language plpgsql security definer set search_path='' as $$
declare account_email text := lower(auth.jwt()->>'email');
begin
  if (select auth.uid()) is null then raise exception 'Sign in to accept this invitation'; end if;
  if not exists(select 1 from public.invitations i where i.token_hash=p_token_hash and lower(i.email)=account_email and i.status='pending' and i.expires_at>now()) then
    raise exception 'Invitation is invalid, expired, or belongs to another email address';
  end if;
  insert into public.memberships(user_id,role,business_id,chamber_id)
  select (select auth.uid()),i.role,
    case when i.role in ('business_admin','business_editor') then i.business_id end,
    case when i.role in ('chamber_admin','chamber_editor') then i.chamber_id end
  from public.invitations i
  where lower(i.email)=account_email and i.status='pending' and i.expires_at>now()
  on conflict do nothing;
  update public.invitations set status='accepted'
  where lower(email)=account_email and status='pending' and expires_at>now();
end;
$$;
revoke all on function public.accept_invitation(text) from public,anon;
grant execute on function public.accept_invitation(text) to authenticated;

create or replace function public.invite_chamber_member(p_chamber_id uuid,p_email text,p_role public.app_role,p_invitation_token_hash text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare invitation_id uuid;
begin
  if p_role not in ('chamber_admin','chamber_editor') then raise exception 'Invalid chamber role'; end if;
  if not exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and (m.role='platform_admin' or (m.role='chamber_admin' and m.chamber_id=p_chamber_id))) then
    raise exception 'Not authorized';
  end if;
  insert into public.invitations(email,role,chamber_id,invited_by,token_hash,expires_at)
  values(lower(trim(p_email)),p_role,p_chamber_id,(select auth.uid()),p_invitation_token_hash,now()+interval '7 days')
  returning id into invitation_id;
  return invitation_id;
end;
$$;
revoke all on function public.invite_chamber_member(uuid,text,public.app_role,text) from public,anon;
grant execute on function public.invite_chamber_member(uuid,text,public.app_role,text) to authenticated;

create or replace function public.invite_chamber_admin(p_chamber_id uuid,p_email text,p_invitation_token_hash text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare invitation_id uuid;
begin
  if not exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.role='platform_admin') then raise exception 'Not authorized'; end if;
  insert into public.invitations(email,role,chamber_id,invited_by,token_hash,expires_at)
  values(lower(trim(p_email)),'chamber_admin',p_chamber_id,(select auth.uid()),p_invitation_token_hash,now()+interval '7 days')
  returning id into invitation_id;
  return invitation_id;
end;
$$;
revoke all on function public.invite_chamber_admin(uuid,text,text) from public,anon;
grant execute on function public.invite_chamber_admin(uuid,text,text) to authenticated;
