import Link from 'next/link';
import { StoreFooter, StoreHeader } from '@/components/storefront';

export default function ForbiddenPage() {
  return <><StoreHeader /><main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-12 theme-text"><section className="max-w-lg rounded-[2rem] border p-8 text-center theme-surface"><p className="text-sm uppercase tracking-[0.3em] theme-brand">403</p><h1 className="mt-4 text-3xl font-semibold theme-heading">Access denied</h1><p className="mt-3 theme-text-muted">You do not have access to this page.</p><Link href="/" className="mt-6 inline-block rounded-full px-6 py-3 theme-button">Back to home</Link></section></main><StoreFooter /></>;
}
