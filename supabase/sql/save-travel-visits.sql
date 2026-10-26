-- Run once in Supabase SQL Editor. Saves a draft in one transaction.
create or replace function public.save_travel_visits(
  p_person_id uuid, p_expected jsonb, p_visits jsonb
) returns void
language plpgsql security invoker set search_path = ''
as $$
declare current_visits jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  perform id from public.travel_people
    where id = p_person_id and owner_id = auth.uid() for update;
  if not found then raise exception 'Traveler not found'; end if;

  if jsonb_typeof(p_expected) <> 'array' or jsonb_typeof(p_visits) <> 'array'
     or p_expected is null or p_visits is null then
    raise exception 'Invalid visits';
  end if;
  if jsonb_array_length(p_visits) > 400 then raise exception 'Too many visits'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_visits) v
    where jsonb_typeof(v) <> 'string'
      or (v #>> '{}') !~ '^(country:[A-Z]{2}|state:US-[A-Z]{2})$'
  ) then raise exception 'Invalid place code'; end if;

  select coalesce(jsonb_agg(k order by k), '[]'::jsonb) into current_visits
  from (
    select place_type || ':' || place_code as k
    from public.travel_visits
    where person_id = p_person_id and owner_id = auth.uid()
  ) s;

  if current_visits <> (
    select coalesce(jsonb_agg(k order by k), '[]'::jsonb)
    from (select distinct value as k from jsonb_array_elements_text(p_expected)) s
  ) then
    raise exception 'Visits changed on another display. Reload before saving.'
      using errcode = '40001';
  end if;

  delete from public.travel_visits
    where person_id = p_person_id and owner_id = auth.uid();
  insert into public.travel_visits(person_id, owner_id, place_type, place_code)
    select p_person_id, auth.uid(), split_part(k, ':', 1), split_part(k, ':', 2)
    from (select distinct value as k from jsonb_array_elements_text(p_visits)) s;
end;
$$;
revoke all on function public.save_travel_visits(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.save_travel_visits(uuid, jsonb, jsonb) to authenticated;
