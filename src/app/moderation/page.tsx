"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { getPendingReviews, approveReview, hideReview } from "@/services/moderation";
import { getPendingReports, dismissReport, actionReport } from "@/services/reviewReports";
import { Review, ReviewReport } from "@/types";
import { FiCheck, FiX, FiEye, FiFlag, FiClock } from "react-icons/fi";

export default function ModerationPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "reports">("reviews");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    // Note: In production, check for MODERATOR role here
    loadData();
  }, [user, loading]);

  const loadData = async () => {
    const [pendingReviews, pendingReports] = await Promise.all([
      getPendingReviews(),
      getPendingReports(),
    ]);
    setReviews(pendingReviews as Review[]);
    setReports(pendingReports as ReviewReport[]);
    setPageLoading(false);
  };

  const handleApproveReview = async (reviewId: string) => {
    await approveReview(reviewId, user!.id);
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  const handleHideReview = async (reviewId: string) => {
    await hideReview(reviewId, user!.id, "Moderator decision");
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  const handleDismissReport = async (reportId: string) => {
    await dismissReport(reportId, user!.id);
    setReports(reports.filter((r) => r.id !== reportId));
  };

  const handleActionReport = async (reportId: string) => {
    await actionReport(reportId, user!.id, "Action taken");
    setReports(reports.filter((r) => r.id !== reportId));
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderation Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "reviews"
              ? "bg-amber-400 text-amber-900"
              : "bg-white text-gray-600 hover:bg-amber-50 border border-amber-100"
          }`}
        >
          <FiClock className="w-4 h-4" />
          Pending Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "reports"
              ? "bg-amber-400 text-amber-900"
              : "bg-white text-gray-600 hover:bg-amber-50 border border-amber-100"
          }`}
        >
          <FiFlag className="w-4 h-4" />
          Reports ({reports.length})
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-amber-100">
              <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No pending reviews</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {review.reviewer?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? "text-amber-400" : "text-gray-200"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveReview(review.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                      title="Approve"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleHideReview(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Hide"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-amber-100">
              <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No pending reports</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FiFlag className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Review #{report.review_id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{report.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleActionReport(report.id)}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      Action
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}