import { StatusBadge } from '@/components/ui';

const stages = ['Created', 'Pending Payment', 'Paid', 'Processing', 'Shipping', 'Delivered'];
const rank: Record<string, number> = {
  created: 0,
  pending_payment: 1,
  pending: 1,
  paid: 2,
  processing: 3,
  shipping: 4,
  shipped: 4,
  delivered: 5,
};

export function OrderTimeline({ status }: { status?: string | null }) {
  const current = rank[String(status ?? 'created').toLowerCase()] ?? 0;
  return (
    <ol className="grid gap-3 sm:grid-cols-6" aria-label="Order timeline">
      {stages.map((stage, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={stage} className="relative rounded-2xl border p-3 theme-surface">
            <div className={`mb-2 h-2 rounded-full ${active ? 'bg-[var(--brand)]' : done ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />
            <p className={`text-sm font-medium ${active ? 'theme-heading' : done ? 'text-emerald-600 dark:text-emerald-300' : 'theme-text-muted'}`}>{stage}</p>
            {active ? <div className="mt-2"><StatusBadge status={status} /></div> : null}
          </li>
        );
      })}
    </ol>
  );
}
