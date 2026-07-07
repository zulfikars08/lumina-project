import Link from 'next/link';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' };

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <button className={buttonClass({ className, variant, size })} {...props} />;
}

export function ButtonLink({ className, variant = 'primary', size = 'md', href, children }: { className?: string; variant?: ButtonProps['variant']; size?: ButtonProps['size']; href: string; children: React.ReactNode }) {
  return <Link href={href} className={buttonClass({ className, variant, size })}>{children}</Link>;
}

export function buttonClass({ className, variant = 'primary', size = 'md' }: { className?: string; variant?: ButtonProps['variant']; size?: ButtonProps['size'] }) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60',
    focus,
    size === 'sm' && 'px-3 py-1.5 text-sm',
    size === 'md' && 'px-5 py-2.5 text-sm',
    size === 'lg' && 'px-6 py-3',
    variant === 'primary' && 'theme-button shadow-[var(--shadow)]',
    variant === 'secondary' && 'theme-button-soft',
    variant === 'ghost' && 'theme-text hover:bg-[var(--surface-muted)]',
    variant === 'danger' && 'border border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200',
    className,
  );
}

export function IconButton({ className, label, children, ...props }: ButtonProps & { label: string }) {
  return <button aria-label={label} title={label} className={cx('inline-flex h-10 w-10 items-center justify-center rounded-full border theme-border theme-text transition hover:-translate-y-0.5 hover:bg-[var(--surface-muted)]', focus, className)} {...props}>{children}</button>;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cx('rounded-[2rem] border p-6 theme-surface', className)}>{children}</section>;
}

export function Section({ eyebrow, title, description, action, children, className }: { eyebrow?: string; title?: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cx('mx-auto max-w-7xl px-4 py-12', className)}><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] theme-brand">{eyebrow}</p> : null}{title ? <h2 className="mt-2 text-3xl font-semibold theme-heading md:text-4xl">{title}</h2> : null}{description ? <p className="mt-2 max-w-2xl theme-text-muted">{description}</p> : null}</div>{action}</div>{children}</section>;
}

export function Badge({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'success' | 'warning' | 'muted' | 'danger' }) {
  return <span className={cx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', tone === 'brand' && 'theme-button-soft', tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200', tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200', tone === 'danger' && 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200', tone === 'muted' && 'theme-muted theme-border')}>{children}</span>;
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = (status ?? 'pending').replaceAll('_', ' ');
  const lower = value.toLowerCase();
  const tone = lower.includes('paid') || lower.includes('active') || lower.includes('delivered') ? 'success' : lower.includes('cancel') || lower.includes('failed') ? 'danger' : lower.includes('pending') || lower.includes('draft') ? 'warning' : 'brand';
  return <Badge tone={tone}>{value}</Badge>;
}

export function Alert({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'danger' | 'success' | 'warning' }) {
  return <div className={cx('rounded-2xl border p-4 text-sm', tone === 'brand' && 'theme-muted theme-border', tone === 'danger' && 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200', tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200', tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200')}>{children}</div>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium theme-text">{label}<span className="mt-2 block">{children}</span></label>;
}

export function EmptyState({ icon = '♡', title, description, action }: { icon?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-dashed p-10 text-center theme-muted theme-border"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)] text-xl theme-brand">{icon}</div><h3 className="mt-4 text-xl font-semibold theme-heading">{title}</h3>{description ? <p className="mt-2 theme-text-muted">{description}</p> : null}{action ? <div className="mt-6">{action}</div> : null}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-2xl bg-[var(--surface-muted)]', className)} />;
}

export function Divider() { return <hr className="border-[var(--border)]" />; }

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="rounded-[2rem] p-8 theme-muted"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] theme-brand">{eyebrow}</p> : null}<h1 className="mt-2 text-4xl font-semibold theme-heading">{title}</h1>{description ? <p className="mt-3 theme-text-muted">{description}</p> : null}</div>{action}</div></div>;
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="table-scroll rounded-[2rem] border theme-surface">{children}</div>;
}

export function PaginationNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm theme-text-muted">{children}</p>;
}

export function ModalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="rounded-[2rem] border p-6 theme-surface"><h2 id="dialog-title" className="text-xl font-semibold theme-heading">{title}</h2><div className="mt-4">{children}</div></div>;
}

export function ConfirmDialog({ title, description }: { title: string; description: string }) {
  return <ModalShell title={title}><p className="theme-text-muted">{description}</p><div className="mt-6 flex gap-3"><Button variant="danger">Confirm</Button><Button variant="secondary">Cancel</Button></div></ModalShell>;
}
