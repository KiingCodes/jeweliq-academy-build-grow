
-- Roles enum + table (separate from profiles to prevent privilege escalation)
create type public.app_role as enum ('student', 'instructor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  xp integer not null default 0,
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Security definer to safely check roles in RLS without recursion
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text,
  level text not null default 'beginner',
  thumbnail_hue text default '280',
  duration_minutes integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  order_index integer not null default 0,
  duration_minutes integer default 0,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table public.code_snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled snippet',
  language text not null default 'javascript',
  code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.code_snippets enable row level security;
alter table public.ai_chats enable row level security;

-- Profiles policies
create policy "Profiles viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- User roles policies (read own; only admins manage)
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can manage roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- Courses (public read for published; admins manage)
create policy "Published courses are viewable" on public.courses for select using (is_published or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage courses" on public.courses for all using (public.has_role(auth.uid(), 'admin'));

-- Lessons (visible if parent course is published)
create policy "Lessons viewable when course published" on public.lessons for select using (
  exists (select 1 from public.courses c where c.id = course_id and (c.is_published or public.has_role(auth.uid(), 'admin')))
);
create policy "Admins manage lessons" on public.lessons for all using (public.has_role(auth.uid(), 'admin'));

-- Enrollments (own)
create policy "Users view own enrollments" on public.enrollments for select using (auth.uid() = user_id);
create policy "Users create own enrollments" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "Users delete own enrollments" on public.enrollments for delete using (auth.uid() = user_id);

-- Lesson progress (own)
create policy "Users view own progress" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "Users upsert own progress" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on public.lesson_progress for update using (auth.uid() = user_id);

-- Code snippets (own)
create policy "Users manage own snippets" on public.code_snippets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI chats (own)
create policy "Users manage own chats" on public.ai_chats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile + default 'student' role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger code_snippets_updated_at before update on public.code_snippets
  for each row execute function public.set_updated_at();
