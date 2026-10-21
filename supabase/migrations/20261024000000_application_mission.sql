-- TechSkillNow: two-stage missions for "Applications That Get Answers".
-- Stage 1 ("application"): the learner sends a full application (CV + cover letter).
-- Stage 2 ("reply"): the app answers with a "missing document" or "interview invitation" email,
-- and the learner must reply correctly. Courses 1 and 2 keep using a single stage.

alter table public.missions
  add column if not exists stage text not null default 'application' check (stage in ('application', 'reply')),
  add column if not exists reply_kind text check (reply_kind is null or reply_kind in ('missing_document', 'interview')),
  add column if not exists locale text not null default 'en' check (locale in ('en', 'fr'));
