create extension if not exists "pgcrypto";

create type public.task_type as enum ('prep', 'travel');

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  travelers text[] not null default '{}',
  cover_emoji text not null default '🧭',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  day_number int not null,
  title text not null
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_id uuid not null references public.itinerary_days(id) on delete cascade,
  time text not null,
  title text not null,
  location text,
  notes text,
  completed boolean not null default false,
  assignee text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  type public.task_type not null,
  title text not null,
  completed boolean not null default false,
  assignee text,
  notes text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trips enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "public_access_trips" on public.trips;
drop policy if exists "public_access_days" on public.itinerary_days;
drop policy if exists "public_access_items" on public.itinerary_items;
drop policy if exists "public_access_tasks" on public.tasks;

create policy "public_access_trips" on public.trips for all using (true) with check (true);
create policy "public_access_days" on public.itinerary_days for all using (true) with check (true);
create policy "public_access_items" on public.itinerary_items for all using (true) with check (true);
create policy "public_access_tasks" on public.tasks for all using (true) with check (true);
