import { supabase } from "@/lib/supabase";

export interface TrustScore {
  id: string;
  user_id: string;
  score: number;
  email_verified: boolean;
  account_age_days: number;
  total_reports: number;
  total_complaints: number;
  quality_reviews: number;
  blocks_count: number;
  last_updated: string;
}

export async function getTrustScore(userId: string): Promise<TrustScore | null> {
  const { data } = await supabase
    .from("user_trust_scores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data as unknown as TrustScore | null;
}

export async function adjustTrustScore(
  userId: string,
  delta: number
): Promise<void> {
  const current = await getTrustScore(userId);
  if (!current) return;

  const newScore = Math.max(0, Math.min(100, current.score + delta));
  await supabase
    .from("user_trust_scores")
    .update({
      score: newScore,
      last_updated: new Date().toISOString(),
    } as any)
    .eq("user_id", userId);
}

export async function incrementUserStat(
  userId: string,
  field: "total_reports" | "total_complaints" | "quality_reviews" | "blocks_count"
): Promise<void> {
  const current = await getTrustScore(userId);
  if (!current) return;

  await supabase
    .from("user_trust_scores")
    .update({
      [field]: current[field] + 1,
      last_updated: new Date().toISOString(),
    } as any)
    .eq("user_id", userId);
}