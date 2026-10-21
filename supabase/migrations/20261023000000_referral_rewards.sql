-- TechSkillNow: rewards for learners who bring friends.
-- Every 3 friends who buy with a learner's link = 1 free course (claimed by the learner).
-- The admin can also record Mobile Money cashback paid by hand.
-- Same rule as before: RLS on, no policies; only the service role (server routes) touches this table.

create table public.referral_rewards (
  id           uuid primary key default gen_random_uuid(),
  -- The referrer's referral ID (access_codes.referral_id).
  referral_id  text not null,
  kind         text not null check (kind in ('course', 'cashback')),
  -- Free courses are numbered per referrer (1, 2, 3…); the unique index stops a double claim.
  seq          integer,
  course_id    text,
  code         text references public.access_codes (code) on delete set null,
  amount       integer check (amount is null or amount > 0),
  note         text,
  created_at   timestamptz not null default now(),
  check ((kind = 'course' and seq is not null and course_id is not null) or (kind = 'cashback' and amount is not null))
);

create unique index referral_rewards_course_seq_idx on public.referral_rewards (referral_id, seq) where kind = 'course';
create index referral_rewards_referral_idx on public.referral_rewards (referral_id);

alter table public.referral_rewards enable row level security;
revoke all on public.referral_rewards from anon, authenticated;
