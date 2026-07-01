import { supabase } from "@/lib/supabase";
import { logAuditEvent } from "./audit";

export interface ReviewReport {
  id: string;
  review_id: string;
  reported_by: string;
  reason: string;
  status: "PENDING" | "DISMISSED" | "ACTIONED";
  created_at: string;
}

export async function createReport(params: {
  reviewId: string;
  reportedBy: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  // Rate limit: check if user has reported too many times recently
  const recentCount = await getRecentReportsCount(params.reportedBy);
  if (recentCount >= 10) {
    return { success: false, error: "Too many reports. Please slow down." };
  }

  // Cooldown: check if already reported this review
  const alreadyReported = await hasReportedReview(params.reviewId, params.reportedBy);
  if (alreadyReported) {
    return { success: false, error: "You already reported this review." };
  }

  const { error } = await supabase.from("review_reports").insert({
    review_id: params.reviewId,
    reported_by: params.reportedBy,
    reason: params.reason,
    status: "PENDING",
  });

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    userId: params.reportedBy,
    action: "REVIEW_REPORT",
    entityType: "review",
    entityId: params.reviewId,
    details: { reason: params.reason },
  });

  return { success: true };
}

async function getRecentReportsCount(userId: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("review_reports")
    .select("*", { count: "exact", head: true })
    .eq("reported_by", userId)
    .gte("created_at", oneHourAgo);

  return count ?? 0;
}

async function hasReportedReview(reviewId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("review_reports")
    .select("id")
    .eq("review_id", reviewId)
    .eq("reported_by", userId)
    .maybeSingle();

  return !!data;
}

export async function getPendingReports(): Promise<ReviewReport[]> {
  const { data, error } = await supabase
    .from("review_reports")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data as unknown as ReviewReport[]) || [];
}

export async function dismissReport(
  reportId: string,
  moderatorId: string
): Promise<void> {
  await supabase
    .from("review_reports")
    .update({ status: "DISMISSED", moderator_id: moderatorId } as any)
    .eq("id", reportId);
}

export async function actionReport(
  reportId: string,
  moderatorId: string,
  note?: string
): Promise<void> {
  await supabase
    .from("review_reports")
    .update({
      status: "ACTIONED",
      moderator_id: moderatorId,
      moderation_note: note ?? null,
    } as any)
    .eq("id", reportId);
}