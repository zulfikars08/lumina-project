import 'server-only';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function auditLog(actorId: string | null, action: string, module: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  await supabaseAdmin.from('audit_logs').insert({ actor_id: actorId, action, module, entity_id: entityId, metadata });
}
