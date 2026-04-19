-- Run this in Supabase SQL Editor for project: lexa-speak-ielts

-- 1) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'guru', 'admin')),
  coach_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists coach_id uuid references public.profiles(id) on delete set null;

-- 2) Helpful index
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_coach_id_idx on public.profiles(coach_id);

-- 2c) Student progress table (1 row per student)
create table if not exists public.student_progress (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  latest_score numeric(5,2) check (latest_score is null or (latest_score >= 0 and latest_score <= 100)),
  progress_percent numeric(5,2) check (progress_percent is null or (progress_percent >= 0 and progress_percent <= 100)),
  speaking_attempts integer not null default 0 check (speaking_attempts >= 0),
  last_activity_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.student_progress
  add column if not exists speaking_attempts integer not null default 0;

alter table public.student_progress
  add column if not exists last_activity_at timestamptz;

-- 2d) Student score history (for trend charts)
create table if not exists public.student_score_history (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  speaking_attempts integer not null default 1 check (speaking_attempts >= 0),
  recorded_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null
);

create index if not exists student_score_history_student_idx on public.student_score_history(student_id);
create index if not exists student_score_history_recorded_at_idx on public.student_score_history(recorded_at desc);

create or replace function public.log_student_progress_history()
returns trigger
language plpgsql
as $$
begin
  if new.latest_score is not null then
    insert into public.student_score_history (
      student_id,
      score,
      speaking_attempts,
      recorded_at,
      recorded_by
    )
    values (
      new.student_id,
      new.latest_score,
      coalesce(new.speaking_attempts, 0),
      coalesce(new.last_activity_at, new.updated_at, now()),
      new.updated_by
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_log_student_progress_history on public.student_progress;
create trigger trg_log_student_progress_history
after insert or update on public.student_progress
for each row
execute procedure public.log_student_progress_history();

create index if not exists student_progress_updated_at_idx on public.student_progress(updated_at desc);

create or replace function public.is_assigned_coach(student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = student
      and p.role = 'user'
      and p.coach_id = auth.uid()
  );
$$;

-- 2b) Validate student-coach assignment consistency
create or replace function public.validate_coach_assignment()
returns trigger
language plpgsql
as $$
begin
  if new.coach_id is null then
    return new;
  end if;

  if new.role <> 'user' then
    raise exception 'coach_id can only be set for student rows';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = new.coach_id
      and p.role = 'guru'
  ) then
    raise exception 'assigned coach must be a valid guru account';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_coach_assignment on public.profiles;
create trigger trg_validate_coach_assignment
before insert or update on public.profiles
for each row
execute procedure public.validate_coach_assignment();

-- 3) Admin helper function used by RLS policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- 4) Auto-create profile row when new auth user signs up
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::text, 'user')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- 4b) Backfill existing auth users (important for users created before trigger existed)
insert into public.profiles (id, email, role)
select
  u.id,
  u.email,
  coalesce((u.raw_user_meta_data ->> 'role')::text, 'user') as role
from auth.users u
on conflict (id) do update
set email = excluded.email;

-- 5) RLS policies
alter table public.profiles enable row level security;

-- Remove old policies first to avoid duplicate-name errors
 drop policy if exists "profiles_select_own_or_admin" on public.profiles;
 drop policy if exists "profiles_insert_own" on public.profiles;
 drop policy if exists "profiles_update_admin" on public.profiles;
 drop policy if exists "profiles_delete_admin" on public.profiles;

-- Read: own row or admin can read all
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or public.is_admin()
  or (role = 'user' and coach_id = auth.uid())
);

-- Insert: authenticated user can create own row
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and role in ('user', 'guru', 'admin')
);

-- Update: admin manages all roles/rows
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Delete: admin only
create policy "profiles_delete_admin"
on public.profiles
for delete
to authenticated
using (public.is_admin());

-- 5b) RLS policies for student progress
alter table public.student_progress enable row level security;

drop policy if exists "student_progress_select" on public.student_progress;
drop policy if exists "student_progress_insert" on public.student_progress;
drop policy if exists "student_progress_update" on public.student_progress;
drop policy if exists "student_progress_delete" on public.student_progress;

create policy "student_progress_select"
on public.student_progress
for select
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin()
  or public.is_assigned_coach(student_id)
);

create policy "student_progress_insert"
on public.student_progress
for insert
to authenticated
with check (
  public.is_admin()
  or public.is_assigned_coach(student_id)
);

create policy "student_progress_update"
on public.student_progress
for update
to authenticated
using (
  public.is_admin()
  or public.is_assigned_coach(student_id)
)
with check (
  public.is_admin()
  or public.is_assigned_coach(student_id)
);

create policy "student_progress_delete"
on public.student_progress
for delete
to authenticated
using (public.is_admin());

-- 5c) RLS policies for student score history
alter table public.student_score_history enable row level security;

drop policy if exists "student_score_history_select" on public.student_score_history;
drop policy if exists "student_score_history_insert" on public.student_score_history;
drop policy if exists "student_score_history_update" on public.student_score_history;
drop policy if exists "student_score_history_delete" on public.student_score_history;

create policy "student_score_history_select"
on public.student_score_history
for select
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin()
  or public.is_assigned_coach(student_id)
);

create policy "student_score_history_insert"
on public.student_score_history
for insert
to authenticated
with check (
  public.is_admin()
  or public.is_assigned_coach(student_id)
);

create policy "student_score_history_update"
on public.student_score_history
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "student_score_history_delete"
on public.student_score_history
for delete
to authenticated
using (public.is_admin());

-- 6) Run once to make your account admin (replace with your login email)
-- update public.profiles
-- set role = 'admin'
-- where email = 'your-email@example.com';
