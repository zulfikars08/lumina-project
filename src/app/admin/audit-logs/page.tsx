import { EmptyState, PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/rbac';

export default async function Page() {
  await requirePermission('audit_logs.read');
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Audit Logs" description="Review admin events and system changes." />
      <EmptyState icon="✦" title="No records to show" description="This module keeps existing functionality and now uses the shared admin surface." />
    </div>
  );
}
