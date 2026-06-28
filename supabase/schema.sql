create table if not exists public.resume_analysis_history (
  id uuid primary key default gen_random_uuid(),
  resume_text text not null,
  job_description text not null,
  analysis_result jsonb not null,
  optimized_resume text not null,
  score integer not null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now()
);

create index if not exists resume_analysis_history_created_at_idx
  on public.resume_analysis_history (created_at desc);
