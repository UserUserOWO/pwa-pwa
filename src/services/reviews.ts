import { supabase } from "@/lib/supabase";
import { Review } from "@/types";
import { evaluateReview } from "./moderation";
import { logAuditEvent } from "./audit";
import { adjustTrustScore } from "./trustScore";

export async function createReview(
  profileId: string,
  reviewerId: string,
  rating: number,
  text: string
) {
  // Validate content before saving
  const moderation = await evaluateReview({ text, reviewerId });

  if (moderation.action === "REJECTED") {
    throw new Error(moderation.reason || "Review was rejected by moderation");
  }

  const { data, error } = await supabase.from("reviews").insert({
    profile_id: profileId,
    reviewer_id: reviewerId,
    rating,
    text,
    status: moderation.action === "PENDING" ? "PENDING" : "PUBLISHED",
    rejection_reason: moderation.reason ?? null,
  }).select().single();

  if (error) throw error;

  // Log the review creation
  await logAuditEvent({
    userId: reviewerId,
    action: moderation.action === "PENDING" ? "REVIEW_CREATED_PENDING" : "REVIEW_CREATED",
    entityType: "review",
    entityId: data?.id ?? undefined,
  });

  if (moderation.action === "APPROVED") {
    await adjustTrustScore(reviewerId, 2);
  }

  return data;
}

export async function getReviewsForProfile(
  profileId: string,
  limit = 50
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles(id, name, photo_url, description, hashtags, user_id, created_at, updated_at)")
    .eq("profile_id", profileId)
    .in("status", ["PUBLISHED", "PENDING"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getReviewsForProfile error:", error);
    return [];
  }
  return (data as unknown as Review[]) || [];
}

export async function getRecentReviews(
  limit = 20
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles(id, name, photo_url, description, hashtags, user_id, created_at, updated_at)")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentReviews error:", error);
    return [];
  }
  return (data as unknown as Review[]) || [];
}

export async function getReviewStats(profileId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("profile_id", profileId)
    .eq("status", "PUBLISHED");

  if (error) return { count: 0, average: 0 };

  const ratings: number[] = data.map((r: { rating: number }) => r.rating);
  const count = ratings.length;
  const average = count > 0
    ? ratings.reduce((a: number, b: number) => a + b, 0) / count
    : 0;

  return { count, average: Math.round(average * 10) / 10 };
}