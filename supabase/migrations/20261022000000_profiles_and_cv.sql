-- TechSkillNow: shared learner profiles and the CV draft that follows a learner across courses.
-- Same rule as before: RLS on, no policies; only the service role (server routes) touches these tables.

-- One profile per person. Every access code points to a profile; codes for later courses
-- are linked to the same profile so the learner's CV is already there.
create table public.learner_profiles (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now()
);

alter table public.access_codes
  add column if not exists profile_id uuid references public.learner_profiles (id) on delete set null;
create index if not exists access_codes_profile_idx on public.access_codes (profile_id);

-- The learner's CV, saved on every change and resumed on any device.
create table public.cv_drafts (
  profile_id  uuid primary key references public.learner_profiles (id) on delete cascade,
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;
alter table public.cv_drafts        enable row level security;

revoke all on public.learner_profiles, public.cv_drafts from anon, authenticated;

-- Gives a code a profile if it has none yet, safely under concurrent requests. Returns the profile id.
create or replace function public.ensure_profile(p_code text)
returns uuid
language plpgsql
as $$
declare
  v_profile uuid;
begin
  select profile_id into v_profile from public.access_codes where code = p_code for update;
  if not found then
    return null;
  end if;
  if v_profile is null then
    insert into public.learner_profiles default values returning id into v_profile;
    update public.access_codes set profile_id = v_profile where code = p_code;
  end if;
  return v_profile;
end;
$$;

revoke execute on function public.ensure_profile(text) from public, anon, authenticated;
grant execute on function public.ensure_profile(text) to service_role;
