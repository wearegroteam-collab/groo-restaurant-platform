create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null default 'manager' check (role in ('admin', 'manager')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  address text not null,
  whatsapp_url text not null,
  google_maps_url text not null,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  owner_id uuid references public.users(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurants
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.restaurants
add column if not exists theme text not null default 'light';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurants_theme_check'
      and conrelid = 'public.restaurants'::regclass
  ) then
    alter table public.restaurants
    add constraint restaurants_theme_check check (theme in ('light', 'dark'));
  end if;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  currency text not null default 'COP' check (currency in ('COP', 'USD')),
  image_url text,
  tags text[] not null default '{}',
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  title text not null,
  subtitle text,
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addon_groups (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  required boolean not null default false,
  multiple boolean not null default true,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer check (max_select is null or max_select >= min_select),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addon_options (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  group_id uuid not null references public.addon_groups(id) on delete cascade,
  name text not null,
  price integer not null default 0 check (price >= 0),
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_addon_groups (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  addon_group_id uuid not null references public.addon_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, addon_group_id)
);

create index if not exists restaurants_slug_idx on public.restaurants(slug);
create index if not exists categories_restaurant_id_sort_order_idx
  on public.categories(restaurant_id, sort_order);
create index if not exists products_restaurant_id_category_id_sort_order_idx
  on public.products(restaurant_id, category_id, sort_order);
create index if not exists banners_restaurant_id_sort_order_idx
  on public.banners(restaurant_id, sort_order);
create index if not exists addon_groups_restaurant_id_idx on public.addon_groups(restaurant_id);
create index if not exists addon_options_group_id_sort_order_idx
  on public.addon_options(group_id, sort_order);
create index if not exists product_addon_groups_restaurant_id_idx
  on public.product_addon_groups(restaurant_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_restaurants_updated_at on public.restaurants;
create trigger set_restaurants_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_banners_updated_at on public.banners;
create trigger set_banners_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

drop trigger if exists set_addon_groups_updated_at on public.addon_groups;
create trigger set_addon_groups_updated_at
before update on public.addon_groups
for each row execute function public.set_updated_at();

drop trigger if exists set_addon_options_updated_at on public.addon_options;
create trigger set_addon_options_updated_at
before update on public.addon_options
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.addon_groups enable row level security;
alter table public.addon_options enable row level security;
alter table public.product_addon_groups enable row level security;

drop policy if exists "Public can read restaurants" on public.restaurants;
create policy "Public can read restaurants"
on public.restaurants for select
using (true);

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
using (is_active = true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select
using (true);

drop policy if exists "Public can read active banners" on public.banners;
create policy "Public can read active banners"
on public.banners for select
using (is_active = true);

drop policy if exists "Public can read addon groups" on public.addon_groups;
create policy "Public can read addon groups"
on public.addon_groups for select
using (true);

drop policy if exists "Public can read available addon options" on public.addon_options;
create policy "Public can read available addon options"
on public.addon_options for select
using (available = true);

drop policy if exists "Public can read product addon groups" on public.product_addon_groups;
create policy "Public can read product addon groups"
on public.product_addon_groups for select
using (true);

drop policy if exists "MVP can insert restaurants" on public.restaurants;
drop policy if exists "MVP can update restaurants" on public.restaurants;
drop policy if exists "MVP can delete restaurants" on public.restaurants;
drop policy if exists "MVP can insert categories" on public.categories;
drop policy if exists "MVP can update categories" on public.categories;
drop policy if exists "MVP can delete categories" on public.categories;
drop policy if exists "MVP can insert products" on public.products;
drop policy if exists "MVP can update products" on public.products;
drop policy if exists "MVP can delete products" on public.products;
drop policy if exists "MVP can insert banners" on public.banners;
drop policy if exists "MVP can update banners" on public.banners;
drop policy if exists "MVP can delete banners" on public.banners;
drop policy if exists "MVP can insert addon groups" on public.addon_groups;
drop policy if exists "MVP can update addon groups" on public.addon_groups;
drop policy if exists "MVP can delete addon groups" on public.addon_groups;
drop policy if exists "MVP can insert addon options" on public.addon_options;
drop policy if exists "MVP can update addon options" on public.addon_options;
drop policy if exists "MVP can delete addon options" on public.addon_options;
drop policy if exists "MVP can insert product addon groups" on public.product_addon_groups;
drop policy if exists "MVP can update product addon groups" on public.product_addon_groups;
drop policy if exists "MVP can delete product addon groups" on public.product_addon_groups;

drop policy if exists "Owners can insert restaurants" on public.restaurants;
create policy "Owners can insert restaurants"
on public.restaurants for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Owners can update restaurants" on public.restaurants;
create policy "Owners can update restaurants"
on public.restaurants for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Owners can delete restaurants" on public.restaurants;
create policy "Owners can delete restaurants"
on public.restaurants for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Owners can insert categories" on public.categories;
create policy "Owners can insert categories"
on public.categories for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = categories.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update categories" on public.categories;
create policy "Owners can update categories"
on public.categories for update
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = categories.restaurant_id
      and restaurants.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = categories.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete categories" on public.categories;
create policy "Owners can delete categories"
on public.categories for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = categories.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can insert products" on public.products;
create policy "Owners can insert products"
on public.products for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = products.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update products" on public.products;
create policy "Owners can update products"
on public.products for update
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = products.restaurant_id
      and restaurants.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = products.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete products" on public.products;
create policy "Owners can delete products"
on public.products for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = products.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can insert banners" on public.banners;
create policy "Owners can insert banners"
on public.banners for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = banners.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update banners" on public.banners;
create policy "Owners can update banners"
on public.banners for update
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = banners.restaurant_id
      and restaurants.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = banners.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete banners" on public.banners;
create policy "Owners can delete banners"
on public.banners for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = banners.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can insert addon groups" on public.addon_groups;
create policy "Owners can insert addon groups"
on public.addon_groups for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_groups.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update addon groups" on public.addon_groups;
create policy "Owners can update addon groups"
on public.addon_groups for update
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_groups.restaurant_id
      and restaurants.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_groups.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete addon groups" on public.addon_groups;
create policy "Owners can delete addon groups"
on public.addon_groups for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_groups.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can insert addon options" on public.addon_options;
create policy "Owners can insert addon options"
on public.addon_options for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_options.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update addon options" on public.addon_options;
create policy "Owners can update addon options"
on public.addon_options for update
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_options.restaurant_id
      and restaurants.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_options.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete addon options" on public.addon_options;
create policy "Owners can delete addon options"
on public.addon_options for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = addon_options.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can insert product addon groups" on public.product_addon_groups;
create policy "Owners can insert product addon groups"
on public.product_addon_groups for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = product_addon_groups.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete product addon groups" on public.product_addon_groups;
create policy "Owners can delete product addon groups"
on public.product_addon_groups for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = product_addon_groups.restaurant_id
      and restaurants.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read menu images" on storage.objects;
create policy "Public can read menu images"
on storage.objects for select
using (bucket_id = 'menu-images');

drop policy if exists "MVP can upload menu images" on storage.objects;
create policy "MVP can upload menu images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'menu-images');

drop policy if exists "MVP can update menu images" on storage.objects;
create policy "MVP can update menu images"
on storage.objects for update
to authenticated
using (bucket_id = 'menu-images')
with check (bucket_id = 'menu-images');

drop policy if exists "MVP can delete menu images" on storage.objects;
create policy "MVP can delete menu images"
on storage.objects for delete
to authenticated
using (bucket_id = 'menu-images');
