import { supabase } from "@/lib/supabase";
import { validateReviewContent, validateUsername } from "./contentFilter";
import { logAuditEvent } from "./audit";
import { adjustTrustScore, incrementUserStat } from "./trustScore";

export type ModerationAction = "APPROVED" | "PENDING" | "REJECTED" | "HIDDEN";

export interface ModerationResult {
  action: ModerationAction;
  reason?: string;
}

/**
 * Evaluate a review before publishing.
 * Returns the recommended action based on content analysis.
 */
export async function evaluateReview(params: {
  text: string;
  reviewerId: string;
}): Promise<ModerationResult> {
  const validation = validateReviewContent(params.text);

  if (validation.action === "REJECTED") {
    await logAuditEvent({
      userId: params.reviewerId,
      action: "REVIEW_REJECTED_AUTO",
      entityType: "review",
      details: { reason: validation.reason, score: validation.score },
    });
    await adjustTrustScore(params.reviewerId, -10);
    return { action: "REJECTED", reason: validation.reason };
  }

  if (validation.action === "PENDING") {
    await logAuditEvent({
      userId: params.reviewerId,
      action: "REVIEW_PENDING_MODERATION",
      entityType: "review",
      details: { reason: validation.reason, score: validation.score },
    });
    return { action: "PENDING", reason: validation.reason };
  }

  return { action: "APPROVED" };
}

/**
 * Evaluate a username before allowing registration.
 */
export async function evaluateUsername(name: string): Promise<ModerationResult> {
  const validation = validateUsername(name);

  if (validation.action === "REJECTED") {
    return { action: "REJECTED", reason: validation.reason };
  }

  return { action: "APPROVED" };
}

/**
 * Evaluate a report for potential abuse.
 */
export async function evaluateReport(params: {
  reporterId: string;
  targetUserId: string;
}): Promise<ModerationResult> {
  // Check if reporter has low trust score (potential abuse)
  const reporterTrust = await import("./trustScore").then((m) =>
    m.getTrustScore(params.reporterId)
  );

  if (reporterTrust && reporterTrust.score < 20) {
    return { action: "PENDING", reason: "Low trust reporter" };
  }

  return { action: "APPROVED" };
}

/**
 * Hide a review (soft delete).
 */
export async function hideReview(
  reviewId: string,
  moderatorId: string,
  reason?: string
): Promise<void> {
  await supabase
    .from("reviews")
    .update({
      status: "HIDDEN",
      rejection_reason: reason ?? null,
      moderated_at: new Date().toISOString(),
    } as any)
    .eq("id", reviewId);

  await logAuditEvent({
    userId: moderatorId,
    action: "REVIEW_HIDDEN",
    entityType: "review",
    entityId: reviewId,
    details: { reason },
  });
}

/**
 * Approve a pending review.
 */
export async function approveReview(
  reviewId: string,
  moderatorId: string
): Promise<void> {
  await supabase
    .from("reviews")
    .update({
      status: "PUBLISHED",
      moderated_at: new Date().toISOString(),
    } as any)
    .eq("id", reviewId);

  await logAuditEvent({
    userId: moderatorId,
    action: "REVIEW_APPROVED",
    entityType: "review",
    entityId: reviewId,
  });
}

/**
 * Get all reviews pending moderation.
 */
export async function getPendingReviews() {
  const { data } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles(id, name, photo_url)")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}