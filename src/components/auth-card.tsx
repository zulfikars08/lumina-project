import Link from 'next/link';
import { StoreFooter, StoreHeader } from '@/components/storefront';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <><StoreHeader /><main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12 theme-text"><section className="w-full max-w-md rounded-[2rem] border p-8 theme-surface"><Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] theme-brand">Lumina</Link><h1 className="mt-4 text-3xl font-semibold theme-heading">{title}</h1><p className="mt-2 text-sm theme-text-muted">{subtitle}</p>{children}</section></main><StoreFooter /></>;
}

export const authInput = 'mt-2 w-full rounded-full border px-4 py-3 theme-border bg-[var(--surface)] theme-text';
export const authLabel = 'block text-sm font-medium theme-text';
export const authForm = 'mt-6 grid gap-4';
