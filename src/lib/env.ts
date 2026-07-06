export function envValue(name: string, fallback?: string) {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const env = {
  supabaseUrl: envValue('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co'),
  supabaseServiceRoleKey: envValue('SUPABASE_SERVICE_ROLE_KEY', 'build-placeholder-service-role-key'),
  sessionSecret: envValue('SESSION_SECRET', 'build-placeholder-session-secret-change-me'),
  appUrl: process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://127.0.0.1:3000',
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY ?? '',
  midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
  midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  midtransNotificationUrl: process.env.MIDTRANS_NOTIFICATION_URL ?? '',
};
