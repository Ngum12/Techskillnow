-- TechSkillNow initial schema.
-- All access goes through Next.js server routes using the service role key.
-- RLS is enabled on every table with no policies, so anon/authenticated roles get nothing.

create table public.access_codes (
  code         text primary key check (code ~ '^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'),
  course_id    text not null,
  buyer_name   text not null,
  buyer_phone  text not null,
  note         text,
  status       text not null default 'unused' check (status in ('unused', 'active', 'revoked')),
  max_devices  integer not null default 2 check (max_devices > 0),
  created_at   timestamptz not null default now()
);

create index access_codes_course_idx on public.access_codes (course_id);
create index access_codes_created_idx on public.access_codes (created_at desc);

create table public.code_devices (
  code        text not null references public.access_codes (code) on delete cascade,
  device_id   text not null,
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  primary key (code, device_id)
);

create table public.progress (
  code          text not null references public.access_codes (code) on delete cascade,
  course_id     text not null,
  step          integer not null default 1 check (step > 0),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (code, course_id)
);

alter table public.access_codes enable row level security;
alter table public.code_devices enable row level security;
alter table public.progress     enable row level security;

revoke all on public.access_codes, public.code_devices, public.progress from anon, authenticated;

-- Atomically validate a code and bind a device to it.
-- Returns one of: ok, not_found, revoked, device_limit.
create or replace function public.redeem_code(p_code text, p_device_id text)
returns text
language plpgsql
as $$
declare
  v_row public.access_codes%rowtype;
  v_used integer;
begin
  select * into v_row from public.access_codes where code = p_code for update;
  if not found then
    return 'not_found';
  end if;
  if v_row.status = 'revoked' then
    return 'revoked';
  end if;

  if exists (select 1 from public.code_devices where code = p_code and device_id = p_device_id) then
    update public.code_devices set last_seen = now() where code = p_code and device_id = p_device_id;
  else
    select count(*) into v_used from public.code_devices where code = p_code;
    if v_used >= v_row.max_devices then
      return 'device_limit';
    end if;
    insert into public.code_devices (code, device_id) values (p_code, p_device_id);
  end if;

  if v_row.status = 'unused' then
    update public.access_codes set status = 'active' where code = p_code;
  end if;

  insert into public.progress (code, course_id) values (p_code, v_row.course_id)
  on conflict (code, course_id) do nothing;

  return 'ok';
end;
$$;

-- Save progress, keeping the furthest step reached.
create or replace function public.save_progress(p_code text, p_course_id text, p_step integer, p_completed boolean)
returns void
language sql
as $$
  insert into public.progress (code, course_id, step, completed_at, updated_at)
  values (p_code, p_course_id, p_step, case when p_completed then now() end, now())
  on conflict (code, course_id) do update
    set step = greatest(public.progress.step, excluded.step),
        completed_at = coalesce(public.progress.completed_at, excluded.completed_at),
        updated_at = now();
$$;

revoke execute on function public.redeem_code(text, text) from public, anon, authenticated;
revoke execute on function public.save_progress(text, text, integer, boolean) from public, anon, authenticated;
grant execute on function public.redeem_code(text, text) to service_role;
grant execute on function public.save_progress(text, text, integer, boolean) to service_role;
