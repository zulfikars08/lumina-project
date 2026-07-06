select 'category' as check, count(*) from categories where slug='runtime-skincare';
select 'product' as check, count(*) from products where sku='RUNTIME-SERUM-001';
select 'variant' as check, count(*) from product_variants where sku='RUNTIME-SERUM-001-30ML';
select 'product_images' as check, count(*) from product_images pi join products p on p.id=pi.product_id where p.sku='RUNTIME-SERUM-001';
select 'primary_images' as check, count(*) from product_images pi join products p on p.id=pi.product_id where p.sku='RUNTIME-SERUM-001' and pi.is_primary;
select 'inventory_logs' as check, count(*) from inventory_logs il left join products p on p.id=il.product_id left join product_variants pv on pv.id=il.variant_id where p.sku='RUNTIME-SERUM-001' or pv.sku='RUNTIME-SERUM-001-30ML';
select 'audit_logs' as check, count(*) from audit_logs where module in ('categories','products','product_variants') and action in ('create','update','upload_image','delete_image','set_primary_image');
