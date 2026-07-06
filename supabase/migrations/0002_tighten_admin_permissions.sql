delete from role_permissions rp
using roles r, permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.code = 'ADMIN'
  and p.code in ('roles.manage','settings.manage');
