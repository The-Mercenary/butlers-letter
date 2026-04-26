alter table public.user_profiles
  add column if not exists dong text not null default '전체',
  add column if not exists industry_type text not null default '기타',
  add column if not exists agreed_saju_analysis boolean not null default false;

update public.user_profiles
set dong = '전체'
where dong is null or dong = '';

update public.user_profiles
set industry_type = '기타'
where industry_type is null or industry_type = '';

do $$
declare
  legacy_timeline_column text := concat('mar', 'riage_timelines');
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matching_cards'
      and column_name = legacy_timeline_column
  )
  and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matching_cards'
      and column_name = 'meeting_timelines'
  ) then
    execute format('alter table public.matching_cards rename column %I to meeting_timelines', legacy_timeline_column);
  end if;
end $$;

alter table public.matching_cards
  add column if not exists card_purpose text,
  add column if not exists self_introduction text not null default '',
  add column if not exists meeting_timelines text[] not null default '{}',
  add column if not exists industry_role text,
  add column if not exists career_range text,
  add column if not exists desired_industry_roles text[] not null default '{}',
  add column if not exists network_meeting_types text[] not null default '{}',
  add column if not exists dating_values text[] not null default '{}',
  add column if not exists local_distance text,
  add column if not exists local_activities text[] not null default '{}',
  add column if not exists available_times text[] not null default '{}',
  add column if not exists hobby_ids text[] not null default '{}',
  add column if not exists hobby_level text,
  add column if not exists hobby_participation_types text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'matching_cards_card_purpose_check'
  ) then
    alter table public.matching_cards
      add constraint matching_cards_card_purpose_check
      check (card_purpose in ('industry_network', 'dating', 'local_friend', 'hobby_buddy'));
  end if;
end $$;

update public.matching_cards
set preferred_regions = coalesce(
  (
    select jsonb_agg(
      case
        when region ? 'dong' then region
        else region || jsonb_build_object('dong', '전체')
      end
    )
    from jsonb_array_elements(preferred_regions) as region
  ),
  '[]'::jsonb
)
where jsonb_typeof(preferred_regions) = 'array';

create or replace function public.handle_new_user_profile()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.user_profiles (
    id,
    email,
    name,
    gender,
    birth_date,
    birth_time_code,
    phone,
    sido,
    sigungu,
    dong,
    industry_type,
    agreed_terms,
    agreed_privacy,
    agreed_sensitive_info,
    agreed_third_party,
    agreed_age_over_19,
    agreed_marketing,
    agreed_saju_analysis
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'gender', 'male'),
    nullif(new.raw_user_meta_data->>'birth_date', '')::date,
    coalesce(new.raw_user_meta_data->>'birth_time_code', 'unknown'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'sido', ''),
    coalesce(new.raw_user_meta_data->>'sigungu', ''),
    coalesce(nullif(new.raw_user_meta_data->>'dong', ''), '전체'),
    coalesce(nullif(new.raw_user_meta_data->>'industry_type', ''), '기타'),
    coalesce((new.raw_user_meta_data->>'agreed_terms')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_privacy')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_sensitive_info')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_third_party')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_age_over_19')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_marketing')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_saju_analysis')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create table if not exists public.saju_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  calendar_type text not null default 'solar' check (calendar_type = 'solar'),
  birth_date date not null,
  birth_time_code text not null default 'unknown' check (
    birth_time_code in ('unknown', 'ja', 'chuk', 'in', 'myo', 'jin', 'sa', 'oh', 'mi', 'shin', 'yu', 'sul', 'hae')
  ),
  day_pillar text,
  personality_summary text,
  dating_points text[] not null default '{}',
  compatibility_keywords text[] not null default '{}',
  raw_result jsonb not null default '{}'::jsonb,
  calculated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_saju_profiles_updated_at on public.saju_profiles;
create trigger set_saju_profiles_updated_at
before update on public.saju_profiles
for each row execute function public.set_updated_at();

create or replace function public.sync_saju_profile_from_user_profile()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.saju_profiles (
    user_id,
    calendar_type,
    birth_date,
    birth_time_code,
    raw_result
  )
  values (
    new.id,
    'solar',
    new.birth_date,
    new.birth_time_code,
    jsonb_build_object('status', 'pending_research')
  )
  on conflict (user_id) do update
    set birth_date = excluded.birth_date,
        birth_time_code = excluded.birth_time_code,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_user_saju_profile on public.user_profiles;
create trigger sync_user_saju_profile
after insert or update of birth_date, birth_time_code on public.user_profiles
for each row execute function public.sync_saju_profile_from_user_profile();

insert into public.saju_profiles (
  user_id,
  calendar_type,
  birth_date,
  birth_time_code,
  raw_result
)
select
  id,
  'solar',
  birth_date,
  birth_time_code,
  jsonb_build_object('status', 'pending_research')
from public.user_profiles
on conflict (user_id) do nothing;

alter table public.saju_profiles enable row level security;

drop policy if exists "Users can read own saju profile" on public.saju_profiles;
create policy "Users can read own saju profile"
on public.saju_profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own saju profile" on public.saju_profiles;
create policy "Users can insert own saju profile"
on public.saju_profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own saju profile" on public.saju_profiles;
create policy "Users can update own saju profile"
on public.saju_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
