import 'server-only';

const buckets = new Map<string, number[]>();

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (hits.length >= limit) throw new Error('Too many attempts. Please try again later.');
  hits.push(now);
  buckets.set(key, hits);
}
