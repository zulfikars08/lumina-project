import { EmptyState, PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/rbac';

export default async function Page() {
  await requirePermission('customers.read');
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Customers" description="Review customer accounts." />
      <EmptyState icon="✦" title="No records to show" description="This module keeps existing functionality and now uses the shared admin surface." />
    </div>
  );
}
