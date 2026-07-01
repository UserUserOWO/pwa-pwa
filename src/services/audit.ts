import { supabase } from "@/lib/supabase";
import { AuditLog } from "@/types";

export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      user_id: params.userId ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      details: params.details ?? {},
      ip_address: params.ipAddress ?? null,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

export async function getAuditLogs(options: {
  limit?: number;
  offset?: number;
  userId?: string;
  action?: string;
  entityType?: string;
}): Promise<AuditLog[]> {
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);

  if (options.userId) query = query.eq("user_id", options.userId);
  if (options.action) query = query.eq("action", options.action);
  if (options.entityType) query = query.eq("entity_type", options.entityType);
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) return [];
  return (data as unknown as AuditLog[]) || [];
}