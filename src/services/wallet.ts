import { supabase } from "@/lib/supabase";
import { Wallet, Transaction, TransactionType, TransactionStatus } from "@/types";

export async function getWallet(userId: string): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  
  if (!data) {
    // No wallet exists yet - create one (for existing users before trigger)
    const { data: newWallet, error: insertError } = await supabase
      .from("wallets")
      .insert({ user_id: userId, balance: 0 })
      .select()
      .single();

    if (insertError) return null;
    return newWallet as unknown as Wallet;
  }

  return data as unknown as Wallet;
}

export async function getTransactions(
  userId: string,
  limit = 50
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as Transaction[]) || [];
}

export async function getRecentDeposits(
  userId: string,
  limit = 5
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "DEPOSIT")
    .eq("status", "COMPLETED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as Transaction[]) || [];
}

export async function getRecentSpends(
  userId: string,
  limit = 5
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "SPEND")
    .eq("status", "COMPLETED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as Transaction[]) || [];
}

export async function depositCredits(
  userId: string,
  amount: number,
  description: string = "Credit purchase"
): Promise<{ success: boolean; error?: string }> {
  const wallet = await getWallet(userId);
  if (!wallet) return { success: false, error: "Wallet not found" };

  const newBalance = wallet.balance + amount;
  const { error: updateError } = await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() } as any)
    .eq("user_id", userId);

  if (updateError) return { success: false, error: updateError.message };

  const { error: txError } = await supabase
    .from("transactions")
    .insert({ user_id: userId, type: "DEPOSIT", amount, description, status: "COMPLETED" } as any);

  if (txError) return { success: false, error: txError.message };

  return { success: true };
}

export async function spendCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const wallet = await getWallet(userId);
  if (!wallet) return { success: false, error: "Wallet not found" };

  if (wallet.balance < amount) {
    return { success: false, error: "Insufficient credits" };
  }

  const newBalance = wallet.balance - amount;
  const { error: updateError } = await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() } as any)
    .eq("user_id", userId);

  if (updateError) return { success: false, error: updateError.message };

  const { error: txError } = await supabase
    .from("transactions")
    .insert({ user_id: userId, type: "SPEND", amount, description, status: "COMPLETED" } as any);

  if (txError) return { success: false, error: txError.message };

  return { success: true };
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const wallet = await getWallet(userId);
  if (!wallet) return { success: false, error: "Wallet not found" };

  const newBalance = wallet.balance + amount;
  const { error: updateError } = await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() } as any)
    .eq("user_id", userId);

  if (updateError) return { success: false, error: updateError.message };

  const { error: txError } = await supabase
    .from("transactions")
    .insert({ user_id: userId, type: "REFUND", amount, description, status: "COMPLETED" } as any);

  if (txError) return { success: false, error: txError.message };

  return { success: true };
}