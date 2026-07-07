'use client';

import { useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  function toggle() {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('lumina-theme', next);
    document.documentElement.dataset.theme = next;
  }
  const label = theme === 'dark' ? 'Light' : 'Dark';
  return <button type="button" onClick={toggle} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--surface-muted)]" aria-label="Toggle theme">{label}</button>;
}
