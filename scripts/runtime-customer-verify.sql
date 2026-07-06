with u as (select id from users where email='customer-runtime@example.com')
select 'profile_name' as check, name::text as value from users where email='customer-runtime@example.com'
union all
select 'addresses_count', count(*)::text from addresses where user_id=(select id from u)
union all
select 'default_addresses', count(*)::text from addresses where user_id=(select id from u) and is_default
union all
select 'wishlist_count', count(*)::text from wishlists where user_id=(select id from u)
union all
select 'cart_items_count', count(*)::text from cart_items ci join carts c on c.id=ci.cart_id where c.user_id=(select id from u)
union all
select 'cart_quantity', coalesce(sum(ci.quantity),0)::text from cart_items ci join carts c on c.id=ci.cart_id where c.user_id=(select id from u)
union all
select 'orders_count', count(*)::text from orders where user_id=(select id from u)
union all
select 'payments_count', count(*)::text from payments p join orders o on o.id=p.order_id where o.user_id=(select id from u);
