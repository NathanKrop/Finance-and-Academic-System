create table if not exists notes_assignments (
  id uuid primary key default gen_random_uuid(),
  form text not null,
  subject text not null,
  streams text[] not null default '{}',
  instructions text not null default '',
  questions jsonb not null default '[]'::jsonb,
  total_marks numeric(8,2) not null default 0 check (total_marks >= 0),
  posted_by uuid references staff_users(id) on delete set null,
  posted_at timestamptz not null default now(),
  term text not null,
  year int not null
);

create table if not exists notes_study_notes (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  subject text not null,
  topic text not null,
  instructions text not null default '',
  file_ref text,
  posted_by uuid references staff_users(id) on delete set null,
  posted_at timestamptz not null default now(),
  term text not null,
  year int not null
);

create table if not exists notes_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references notes_assignments(id) on delete cascade,
  adm_no text not null references students(adm_no) on delete cascade,
  student_name text not null,
  answers jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  status text not null default 'unmarked' check (status in ('unmarked', 'marked')),
  per_question_scores jsonb not null default '[]'::jsonb,
  total numeric(8,2) not null default 0 check (total >= 0),
  comment text,
  unique (assignment_id, adm_no)
);

create table if not exists notes_assignment_auto_login_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  adm_no text not null references students(adm_no) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint auto_login_expiry_check check (expires_at > created_at)
);

create index if not exists notes_assignments_form_subject_idx on notes_assignments (form, subject);
create index if not exists notes_study_notes_class_subject_idx on notes_study_notes (class_name, subject);
create index if not exists notes_assignment_submissions_assignment_idx on notes_assignment_submissions (assignment_id, status);
create index if not exists notes_assignment_auto_login_student_idx on notes_assignment_auto_login_links (student_id, created_at desc);

alter table notes_assignments enable row level security;
alter table notes_study_notes enable row level security;
alter table notes_assignment_submissions enable row level security;
alter table notes_assignment_auto_login_links enable row level security;

create policy "academic staff manage assignments" on notes_assignments
for all using (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
) with check (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
);

create policy "academic staff manage study notes" on notes_study_notes
for all using (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
) with check (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
);

create policy "academic staff manage submissions" on notes_assignment_submissions
for all using (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
) with check (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
);

create policy "academic staff manage auto login links" on notes_assignment_auto_login_links
for all using (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
) with check (
  auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar')
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('notes-assignments', 'notes-assignments', false, 15728640)
on conflict (id) do nothing;

create policy "academic staff manage notes assignment files" on storage.objects
for all using (
  bucket_id = 'notes-assignments' and
  (auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar'))
) with check (
  bucket_id = 'notes-assignments' and
  (auth_has_role('super_admin') or auth_has_role('head_teacher') or auth_has_role('registrar'))
);

create or replace function verify_notes_assignment_token(token_hash_input text)
returns table (student_id uuid, student_name text, adm_no text)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select s.id, s.full_name, s.adm_no
  from notes_assignment_auto_login_links l
  join students s on s.id = l.student_id
  where l.token_hash = token_hash_input
    and l.revoked_at is null
    and l.expires_at > now()
  limit 1;
$$;

revoke all on function verify_notes_assignment_token(text) from public;
grant execute on function verify_notes_assignment_token(text) to anon, authenticated;