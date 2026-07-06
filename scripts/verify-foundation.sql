select 'roles' as check, json_agg(code order by code) as result from roles;
select 'permissions_count' as check, count(*) as result from permissions;
select 'super_admin_permissions' as check, count(*) as result
from role_permissions rp join roles r on r.id=rp.role_id where r.code='SUPER_ADMIN';
select 'all_permissions' as check, count(*) as result from permissions;
select 'admin_has_discounts' as check, exists(
  select 1 from role_permissions rp join roles r on r.id=rp.role_id join permissions p on p.id=rp.permission_id
  where r.code='ADMIN' and p.code='discounts.manage'
) as result;
select 'customer_admin_permissions' as check, count(*) as result
from role_permissions rp join roles r on r.id=rp.role_id where r.code='CUSTOMER';
select 'buckets' as check, json_agg(id order by id) as result from storage.buckets where id in ('products','banners','blog','content');
select 'core_tables' as check, json_agg(table_name order by table_name) as result
from information_schema.tables
where table_schema='public' and table_name in (
  'users','roles','permissions','role_permissions','user_roles','categories','products','product_variants','inventory_logs','carts','orders','payments','invoices','vouchers','reviews','banners','homepage_sections','blogs','static_pages','faqs','settings','audit_logs'
);
