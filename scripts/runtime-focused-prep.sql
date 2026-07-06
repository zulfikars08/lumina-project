with cu as (select id from users where email='customer-runtime@example.com')
delete from wishlists where user_id=(select id from cu);
with cu as (select id from users where email='customer-runtime@example.com'), c as (select id from carts where user_id=(select id from cu))
delete from cart_items where cart_id in (select id from c);
update products set status='active', stock=10 where sku='RUNTIME-SERUM-001';
update product_variants set is_active=true, stock=5 where sku='RUNTIME-SERUM-001-30ML';
insert into users(email,name,password_hash,status,password_changed_at)
select 'customer-other@example.com','Other Customer',(select password_hash from users where email='customer-runtime@example.com'),'ACTIVE',now()
where not exists(select 1 from users where email='customer-other@example.com');
insert into user_roles(user_id, role_id)
select u.id, r.id from users u, roles r where u.email='customer-other@example.com' and r.code='CUSTOMER'
on conflict do nothing;
insert into addresses(user_id,recipient_name,phone,province,city,district,postal_code,full_address,is_default)
select u.id,'Other Receiver','081234567891','Bali','Denpasar','Kuta','80361','Other protected address',true
from users u where u.email='customer-other@example.com'
and not exists(select 1 from addresses a where a.user_id=u.id);
