import { supabase } from "@/lib/supabase";
import { Review } from "@/types";

export async function createReview(
  profileId: string,
  reviewerId: string,
  rating: number,
  text: string
) {
  const { error } = await supabase.from("reviews").insert({
    profile_id: profileId,
    reviewer_id: reviewerId,
    rating,
    text,
  });

  if (error) throw error;
}

export async function getReviewsForProfile(
  profileId: string,
  limit = 50
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(*)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as Review[]) || [];
}

export async function getRecentReviews(
  limit = 20
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as Review[]) || [];
}

export async function getReviewStats(profileId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("profile_id", profileId);

  if (error) return { count: 0, average: 0 };

  const ratings: number[] = data.map((r: { rating: number }) => r.rating);
  const count = ratings.length;
  const average = count > 0
    ? ratings.reduce((a: number, b: number) => a + b, 0) / count
    : 0;

  return { count, average: Math.round(average * 10) / 10 };
}