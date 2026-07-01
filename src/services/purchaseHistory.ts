import { supabase } from "@/lib/supabase";
import { PurchaseHistory } from "@/types";

export async function recordPurchase(params: {
  userId: string;
  amount: number;
  credits: number;
  paymentProvider?: string;
  transactionId?: string;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("purchase_history").insert({
    user_id: params.userId,
    amount: params.amount,
    credits: params.credits,
    payment_provider: params.paymentProvider ?? "test",
    transaction_id: params.transactionId ?? null,
    status: params.status ?? "COMPLETED",
    metadata: params.metadata ?? {},
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getPurchaseHistory(
  userId: string,
  limit = 50
): Promise<PurchaseHistory[]> {
  const { data, error } = await supabase
    .from("purchase_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as PurchaseHistory[]) || [];
}

export async function getAllPurchases(options: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<PurchaseHistory[]> {
  let query = supabase
    .from("purchase_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);

  if (options.status) query = query.eq("status", options.status);
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) return [];
  return (data as unknown as PurchaseHistory[]) || [];
}