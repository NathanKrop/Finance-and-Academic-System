create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  term text not null check (term in ('Term 1','Term 2','Term 3')),
  type text not null check (type in ('Other','CAT','KCSE')),
  title text not null,
  start_date date not null,
  end_date date not null,
  out_of int not null default 0,
  out_of_locked boolean not null default false,
  marks_deadline date not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exams_order_chk check (end_date >= start_date)
);

create table if not exists exam_forms (
  exam_id uuid not null references exams(id) on delete cascade,
  form_grade text not null,
  primary key (exam_id, form_grade)
);

create table if not exists exam_marks (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null,
  subject_ref text not null,
  marks numeric(6,2),
  entered_by uuid,
  updated_at timestamptz not null default now(),
  unique (exam_id, student_id, subject_ref)
);

create table if not exists exam_paper_marks (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null,
  paper_id text not null,
  marks numeric(6,2),
  out_of numeric(6,2) not null default 100,
  updated_at timestamptz not null default now(),
  unique (exam_id, student_id, paper_id)
);

create table if not exists student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  subject_ref text not null,
  unique (student_id, subject_ref)
);

create table if not exists stream_subject_teachers (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null,
  subject_ref text not null,
  teacher_id uuid not null,
  unique (stream_id, subject_ref)
);

create table if not exists exam_contributions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  form_grade text not null,
  pct numeric(5,2) not null check (pct >= 0),
  unique (exam_id, form_grade)
);

create table if not exists ranking_criteria (
  id uuid primary key default gen_random_uuid(),
  form_grade text not null,
  row_key text not null,
  col_index int not null,
  value int not null default 0,
  unique (form_grade, row_key, col_index)
);

create table if not exists kcse_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  year int not null,
  exam_id uuid not null references exams(id) on delete cascade,
  subject_id text not null,
  grade text not null,
  points int not null,
  unique (student_id, year, exam_id, subject_id)
);

create table if not exists tool_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists marks_audit (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid,
  subject_ref text,
  actor_id uuid,
  action text not null default 'override_deadline',
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists exams_year_term_idx on exams (year, term);
create index if not exists exam_marks_student_idx on exam_marks (student_id, exam_id);
create index if not exists exam_paper_marks_student_idx on exam_paper_marks (student_id, exam_id);
create index if not exists kcse_results_student_idx on kcse_results (student_id, year);

alter table exams enable row level security;
alter table exam_forms enable row level security;
alter table exam_marks enable row level security;
alter table exam_paper_marks enable row level security;
alter table student_subjects enable row level security;
alter table stream_subject_teachers enable row level security;
alter table exam_contributions enable row level security;
alter table ranking_criteria enable row level security;
alter table kcse_results enable row level security;
alter table tool_settings enable row level security;
alter table marks_audit enable row level security;

create or replace function current_role() returns text as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', 'public');
$$ language sql stable;

create policy "Academic admins and super admins can manage exams" on exams
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage exam_forms" on exam_forms
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage exam_marks" on exam_marks
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage exam_paper_marks" on exam_paper_marks
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage student_subjects" on student_subjects
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage stream_subject_teachers" on stream_subject_teachers
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage exam_contributions" on exam_contributions
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage ranking_criteria" on ranking_criteria
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage kcse_results" on kcse_results
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage tool_settings" on tool_settings
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);

create policy "Academic admins and super admins can manage marks_audit" on marks_audit
for all using (
  current_role() in ('academic_admin', 'super_admin')
) with check (
  current_role() in ('academic_admin', 'super_admin')
);
