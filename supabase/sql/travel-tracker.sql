-- Run once in the Supabase SQL Editor.
-- Travelers are profiles managed by a dashboard account, not separate logins.
begin;

create table public.travel_people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  color text not null default '#B58B50'
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table public.travel_visits (
  person_id uuid not null,
  owner_id uuid not null default auth.uid(),
  place_type text not null check (place_type in ('country', 'state')),
  place_code text not null,
  created_at timestamptz not null default now(),
  primary key (person_id, place_type, place_code),
  foreign key (person_id, owner_id)
    references public.travel_people(id, owner_id) on delete cascade,
  check (
    (place_type = 'country' and place_code ~ '^[A-Z]{2}$')
    or (place_type = 'state' and place_code ~ '^US-[A-Z]{2}$')
  )
);

-- Country codes also represent territories: Bermuda is BM.
-- US states use codes such as US-CA, separately from country code US.
create index travel_people_owner_idx on public.travel_people(owner_id);
create index travel_visits_owner_idx on public.travel_visits(owner_id);

alter table public.travel_people enable row level security;
alter table public.travel_visits enable row level security;

revoke all on public.travel_people, public.travel_visits from anon, authenticated;
grant select, insert, update, delete
  on public.travel_people, public.travel_visits to authenticated;

create policy "Owners manage their travelers"
on public.travel_people for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Owners manage their travel visits"
on public.travel_visits for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

commit;
