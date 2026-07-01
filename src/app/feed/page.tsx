"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { getRecentReviews } from "@/services/reviews";
import { Review } from "@/types";
import ReviewCard from "@/components/ReviewCard";
import { FiMessageSquare } from "react-icons/fi";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      const data = await getRecentReviews(20);
      setReviews(data);
      setPageLoading(false);
    };
    load();
  }, []);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("feed.title")}</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-amber-100">
          <div className="text-5xl mb-4">�</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("feed.empty.title")}</h3>
          <p className="text-gray-500">{t("feed.empty.desc")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}