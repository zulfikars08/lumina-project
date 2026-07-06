'use client';

import Script from 'next/script';
import { useState } from 'react';

declare global { interface Window { snap?: { pay: (token: string, options?: Record<string, unknown>) => void } } }

export function PayNow({ orderId, clientKey, redirectUrl }: { orderId: string; clientKey: string; redirectUrl?: string | null }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function pay() {
    setBusy(true); setError('');
    const res = await fetch(`/account/orders/${orderId}/pay`, { method: 'POST' });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? 'Unable to start payment.');
    if (window.snap) return window.snap.pay(data.token);
    if (data.redirect_url || redirectUrl) location.href = data.redirect_url ?? redirectUrl;
    else setError('Payment popup failed to load.');
  }
  return <><Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={clientKey} strategy="afterInteractive" /><button onClick={pay} disabled={busy} className="mt-4 rounded-full bg-rose-900 px-6 py-3 text-white disabled:bg-stone-200">{busy ? 'Preparing payment...' : 'Pay Now'}</button>{error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}</>;
}
