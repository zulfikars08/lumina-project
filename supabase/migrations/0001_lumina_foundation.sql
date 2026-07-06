-- Lumina foundation schema: custom auth, RBAC, catalog, orders, CMS
create extension if not exists pgcrypto;

create type user_status as enum ('PENDING_PASSWORD_CHANGE','ACTIVE','SUSPENDED');
create type order_status as enum ('PENDING_PAYMENT','PAID','PROCESSING','READY_TO_SEND','SHIPPED','COMPLETED','CANCELLED','EXPIRED','REFUNDED');
create type product_status as enum ('draft','active','archived');
create type discount_type as enum ('percentage','fixed');
create type payment_status as enum ('PENDING','PAID','FAILED','EXPIRED','REFUNDED');

create table roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('SUPER_ADMIN','ADMIN','CUSTOMER')),
  name text not null,
  created_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  status user_status not null default 'PENDING_PASSWORD_CHANGE',
  temp_password_expires_at timestamptz,
  password_changed_at timestamptz,
  reset_token_hash text,
  reset_token_expires_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete restrict,
  primary key (user_id, role_id)
);

create table customer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  phone text,
  birthdate date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  province text not null,
  city text not null,
  district text not null,
  postal_code text not null,
  full_address text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index addresses_one_default_per_user on addresses(user_id) where is_default;

create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  description text,
  ingredients text,
  how_to_use text,
  benefits text,
  price numeric(14,2) not null check (price >= 0),
  discount_price numeric(14,2) check (discount_price >= 0),
  status product_status not null default 'draft',
  has_variants boolean not null default false,
  stock int not null default 0 check (stock >= 0),
  weight_grams int check (weight_grams is null or weight_grams >= 0),
  tags text[] not null default '{}',
  concerns text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  file_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index product_images_one_primary on product_images(product_id) where is_primary;

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  option_values jsonb not null default '{}'::jsonb,
  price numeric(14,2) check (price is null or price >= 0),
  discount_price numeric(14,2) check (discount_price is null or discount_price >= 0),
  stock int not null default 0 check (stock >= 0),
  weight_grams int check (weight_grams is null or weight_grams >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  change_qty int not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (product_id is not null or variant_id is not null)
);

create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, product_id, variant_id)
);

create table wishlists (
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type discount_type not null,
  value numeric(14,2) not null check (value > 0),
  minimum_purchase numeric(14,2) not null default 0 check (minimum_purchase >= 0),
  usage_limit int check (usage_limit is null or usage_limit > 0),
  per_customer_usage_limit int check (per_customer_usage_limit is null or per_customer_usage_limit > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  product_ids uuid[] not null default '{}',
  category_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references users(id) on delete restrict,
  status order_status not null default 'PENDING_PAYMENT',
  subtotal numeric(14,2) not null default 0,
  discount_total numeric(14,2) not null default 0,
  shipping_fee numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null default 0,
  voucher_id uuid references vouchers(id) on delete set null,
  shipping_address jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  sku text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  total_price numeric(14,2) not null check (total_price >= 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  provider text not null default 'midtrans',
  provider_order_id text not null unique,
  snap_token text,
  snap_redirect_url text,
  status payment_status not null default 'PENDING',
  payment_method text,
  paid_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table midtrans_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  provider_order_id text,
  transaction_status text,
  fraud_status text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  invoice_number text not null unique,
  snapshot jsonb not null,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create table voucher_usages (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references vouchers(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  order_id uuid not null unique references orders(id) on delete cascade,
  used_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review_text text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, order_item_id)
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text not null,
  link_url text,
  placement text not null default 'home_hero',
  is_active boolean not null default true,
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  type text not null,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table blogs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  thumbnail_path text,
  status product_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table static_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  meta_title text,
  meta_description text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  action text not null,
  module text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index users_email_idx on users(lower(email));
create index products_search_idx on products using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(description,'')));
create index products_category_status_idx on products(category_id, status);
create index orders_user_idx on orders(user_id, created_at desc);
create index orders_status_idx on orders(status);
create index audit_logs_actor_idx on audit_logs(actor_id, created_at desc);

insert into roles(code, name) values
  ('SUPER_ADMIN','Super Admin'), ('ADMIN','Admin'), ('CUSTOMER','Customer');

insert into permissions(code, module, action, description) values
  ('dashboard.read','dashboard','read','View admin dashboard'),
  ('products.manage','products','manage','Manage products, variants, stock'),
  ('categories.manage','categories','manage','Manage categories'),
  ('orders.manage','orders','manage','Manage orders'),
  ('customers.read','customers','read','Read customers'),
  ('reviews.manage','reviews','manage','Manage reviews'),
  ('banners.manage','banners','manage','Manage banners and homepage sections'),
  ('blog.manage','blog','manage','Manage blog'),
  ('pages.manage','pages','manage','Manage static pages and FAQ'),
  ('admin_users.manage','admin_users','manage','Manage admin users'),
  ('roles.manage','roles','manage','Manage roles and permissions'),
  ('settings.manage','settings','manage','Manage store/payment/email settings'),
  ('discounts.manage','discounts','manage','Manage vouchers and discounts'),
  ('audit_logs.read','audit_logs','read','Read audit logs');

insert into role_permissions(role_id, permission_id)
select r.id, p.id from roles r cross join permissions p where r.code = 'SUPER_ADMIN';

insert into role_permissions(role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code in (
  'dashboard.read','products.manage','categories.manage','orders.manage','customers.read',
  'reviews.manage','banners.manage','blog.manage','pages.manage','admin_users.manage',
  'roles.manage','settings.manage','audit_logs.read'
) where r.code = 'ADMIN';

-- Storage buckets (run with Supabase owner/service role in migration context)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products','products',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('banners','banners',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('blog','blog',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('content','content',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
