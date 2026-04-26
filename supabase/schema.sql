create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null check (char_length(name) between 2 and 20),
  gender text not null check (gender in ('male', 'female')),
  birth_date date not null,
  birth_time_code text not null default 'unknown' check (
    birth_time_code in ('unknown', 'ja', 'chuk', 'in', 'myo', 'jin', 'sa', 'oh', 'mi', 'shin', 'yu', 'sul', 'hae')
  ),
  phone text not null,
  sido text not null,
  sigungu text not null,
  agreed_terms boolean not null default false,
  agreed_privacy boolean not null default false,
  agreed_sensitive_info boolean not null default false,
  agreed_third_party boolean not null default false,
  agreed_age_over_19 boolean not null default false,
  agreed_marketing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matching_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  card_name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'inactive')),
  main_image_url text,
  education_level text check (education_level in ('high_school', 'college', 'university', 'master', 'doctor', 'none')),
  job_type text check (job_type in ('professional', 'public_sector', 'office_worker', 'business_owner', 'freelancer', 'other')),
  preferred_age_ranges text[] not null default '{}',
  marriage_timelines text[] not null default '{}',
  partner_priority text[] not null default '{}',
  reasons_for_use text[] not null default '{}',
  preferred_regions jsonb not null default '[]'::jsonb,
  agreed_card_disclosure boolean not null default false,
  agreed_contact_disclosure boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matching_card_images (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.matching_cards(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.matching_cards(id) on delete cascade,
  platform text not null check (platform in ('linkedin', 'instagram', 'x', 'facebook', 'blog', 'other')),
  url_or_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_matching_cards_updated_at on public.matching_cards;
create trigger set_matching_cards_updated_at
before update on public.matching_cards
for each row execute function public.set_updated_at();

drop trigger if exists set_social_accounts_updated_at on public.social_accounts;
create trigger set_social_accounts_updated_at
before update on public.social_accounts
for each row execute function public.set_updated_at();

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
    agreed_terms,
    agreed_privacy,
    agreed_sensitive_info,
    agreed_third_party,
    agreed_age_over_19,
    agreed_marketing
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
    coalesce((new.raw_user_meta_data->>'agreed_terms')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_privacy')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_sensitive_info')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_third_party')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_age_over_19')::boolean, false),
    coalesce((new.raw_user_meta_data->>'agreed_marketing')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

alter table public.user_profiles enable row level security;
alter table public.matching_cards enable row level security;
alter table public.matching_card_images enable row level security;
alter table public.social_accounts enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
on public.user_profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.user_profiles;
create policy "Users can delete own profile"
on public.user_profiles for delete
using (auth.uid() = id);

drop policy if exists "Users can manage own cards" on public.matching_cards;
create policy "Users can manage own cards"
on public.matching_cards for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own card images" on public.matching_card_images;
create policy "Users can manage own card images"
on public.matching_card_images for all
using (
  exists (
    select 1 from public.matching_cards
    where matching_cards.id = matching_card_images.card_id
    and matching_cards.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.matching_cards
    where matching_cards.id = matching_card_images.card_id
    and matching_cards.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own social accounts" on public.social_accounts;
create policy "Users can manage own social accounts"
on public.social_accounts for all
using (
  exists (
    select 1 from public.matching_cards
    where matching_cards.id = social_accounts.card_id
    and matching_cards.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.matching_cards
    where matching_cards.id = social_accounts.card_id
    and matching_cards.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-images', 'profile-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('card-gallery-images', 'card-gallery-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Users can upload profile images" on storage.objects;
create policy "Users can upload profile images"
on storage.objects for insert
with check (
  bucket_id = 'profile-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own profile images" on storage.objects;
create policy "Users can update own profile images"
on storage.objects for update
using (
  bucket_id = 'profile-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own profile images" on storage.objects;
create policy "Users can delete own profile images"
on storage.objects for delete
using (
  bucket_id = 'profile-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can upload gallery images" on storage.objects;
create policy "Users can upload gallery images"
on storage.objects for insert
with check (
  bucket_id = 'card-gallery-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own gallery images" on storage.objects;
create policy "Users can update own gallery images"
on storage.objects for update
using (
  bucket_id = 'card-gallery-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'card-gallery-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own gallery images" on storage.objects;
create policy "Users can delete own gallery images"
on storage.objects for delete
using (
  bucket_id = 'card-gallery-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
