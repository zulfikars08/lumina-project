with u as (select id from users where email='customer-runtime@example.com')
delete from wishlists where user_id=(select id from u);
with u as (select id from users where email='customer-runtime@example.com'), c as (select id from carts where user_id=(select id from u))
delete from cart_items where cart_id in (select id from c);
update products set status='active', stock=10 where sku='RUNTIME-SERUM-001';
update product_variants set is_active=true, stock=5 where sku='RUNTIME-SERUM-001-30ML';
