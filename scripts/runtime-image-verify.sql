select 'product_images' as check, count(*) from product_images pi join products p on p.id=pi.product_id where p.sku='RUNTIME-SERUM-001';
select 'primary_images' as check, count(*) from product_images pi join products p on p.id=pi.product_id where p.sku='RUNTIME-SERUM-001' and pi.is_primary;
select 'image_audit_logs' as check, count(*) from audit_logs where module='products' and action in ('upload_image','delete_image','set_primary_image');
