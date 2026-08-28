alter table public.invitations
alter column invited_by drop not null;

comment on column public.invitations.invited_by is
  'Inviting user. Null only for platform bootstrap invitations created by a trusted operator.';
