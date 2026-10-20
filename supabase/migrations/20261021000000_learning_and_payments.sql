-- TechSkillNow: assessments, certificates, real-world missions, attempt logs, payments, referrals, abuse limits.
-- Same rule as before: RLS on, no policies; only the service role (server routes) touches these tables.

alter table public.access_codes
  add column if not exists referral_id text unique,
  add column if not exists device_resets integer not null default 0,
  add column if not exists source text not null default 'admin' check (source in ('admin', 'payment'));

-- Pre-test and final test. One row per kind; the final test keeps the best score.
create table public.assessments (
  code        text not null references public.access_codes (code) on delete cascade,
  course_id   text not null,
  kind        text not null check (kind in ('pre', 'post')),
  score       integer not null,
  total       integer not null,
  answers     jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  primary key (code, course_id, kind)
);

-- Real-world mission: the learner sends a real application email from their own Gmail.
create table public.missions (
  code         text not null references public.access_codes (code) on delete cascade,
  course_id    text not null,
  gmail        text not null,
  status       text not null default 'waiting' check (status in ('waiting', 'passed', 'failed')),
  feedback     jsonb not null default '[]',
  received_at  timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (code, course_id)
);
create index missions_gmail_idx on public.missions (lower(gmail));

-- Public, verifiable certificates.
create table public.certificates (
  id          text primary key,
  code        text not null references public.access_codes (code) on delete cascade,
  course_id   text not null,
  name        text not null,
  pre_score   integer,
  post_score  integer not null,
  total       integer not null,
  mission     boolean not null default false,
  issued_at   timestamptz not null default now(),
  unique (code, course_id)
);

-- Every practice attempt, and tutor requests (for learning analytics and the tutor cap).
create table public.attempts (
  id          bigint generated always as identity primary key,
  code        text not null references public.access_codes (code) on delete cascade,
  course_id   text not null,
  step        integer not null,
  kind        text not null default 'check' check (kind in ('check', 'tutor')),
  passed      boolean not null default false,
  failed      text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index attempts_course_step_idx on public.attempts (course_id, step);
create index attempts_code_kind_idx on public.attempts (code, kind);

-- Mobile Money orders (Fapshi).
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  course_id       text not null,
  buyer_name      text not null,
  buyer_phone     text not null,
  amount          integer not null check (amount > 0),
  referral_id     text,
  trans_id        text unique,
  status          text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  code            text references public.access_codes (code),
  view_token      text not null,
  last_checked_at timestamptz,
  created_at      timestamptz not null default now(),
  paid_at         timestamptz
);
create index orders_referral_idx on public.orders (referral_id) where status = 'paid';

-- Failed code attempts per (hashed) IP, to slow down guessing.
create table public.redeem_attempts (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);
create index redeem_attempts_ip_idx on public.redeem_attempts (ip_hash, created_at desc);

alter table public.assessments     enable row level security;
alter table public.missions        enable row level security;
alter table public.certificates    enable row level security;
alter table public.attempts        enable row level security;
alter table public.orders          enable row level security;
alter table public.redeem_attempts enable row level security;

revoke all on public.assessments, public.missions, public.certificates, public.attempts, public.orders, public.redeem_attempts
  from anon, authenticated;

-- Marks an order paid exactly once. Returns true only for the call that made the change.
create or replace function public.mark_order_paid(p_order uuid)
returns boolean
language sql
as $$
  with updated as (
    update public.orders set status = 'paid', paid_at = now()
    where id = p_order and status = 'pending'
    returning 1
  )
  select exists (select 1 from updated);
$$;

revoke execute on function public.mark_order_paid(uuid) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid) to service_role;
