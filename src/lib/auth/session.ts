import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export type Session = { userId: string; exp: number };

const COOKIE = 'lumina_session';
const TTL_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string) {
  return createHmac('sha256', env.sessionSecret).update(payload).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(value?: string): Session | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
  return session.exp > Math.floor(Date.now() / 1000) ? session : null;
}

export async function setSession(userId: string) {
  (await cookies()).set(COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_SECONDS,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession() {
  return parseSessionToken((await cookies()).get(COOKIE)?.value);
}
