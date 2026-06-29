"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { getRecentReviews } from "@/services/reviews";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/types";
import { FiRefreshCw } from "react-icons/fi";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadReviews = async () => {
      const data = await getRecentReviews();
      setReviews(data);
      setFeedLoading(false);
    };
    if (user) loadReviews();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("feed.title")}</h1>
        <button
          onClick={() => {
            setFeedLoading(true);
            getRecentReviews().then((data) => {
              setReviews(data);
              setFeedLoading(false);
            });
          }}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <FiRefreshCw className={`w-5 h-5 ${feedLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {feedLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("feed.empty.title")}</h2>
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