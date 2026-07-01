"use client";

import { Review } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { createReport } from "@/services/reviewReports";
import { useAuth } from "@/hooks/useAuth";
import { FiFlag, FiCheck, FiClock } from "react-icons/fi";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }: { review: Review }) {
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  const handleReport = async () => {
    if (!user || !reportReason.trim()) return;
    await createReport({
      reviewId: review.id,
      reportedBy: user.id,
      reason: reportReason,
    });
    setReportSent(true);
    setShowReport(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${review.profile_id}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-medium text-sm shrink-0">
            {review.reviewer?.name?.[0]?.toUpperCase() || "?"}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/profile/${review.profile_id}`}
              className="font-semibold text-sm text-gray-900 hover:text-amber-500 transition-colors truncate"
            >
              {review.reviewer?.name || "Unknown User"}
            </Link>
            <div className="flex items-center gap-2">
              {/* Status badge */}
              {(review as any).status === "PENDING" && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                  <FiClock className="w-3 h-3" />
                  Pending
                </span>
              )}
              {(review as any).status === "HIDDEN" && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                  Hidden
                </span>
              )}
              <span className="text-xs text-gray-400 shrink-0">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>

          <Stars rating={review.rating} />

          {(review as any).status === "HIDDEN" ? (
            <p className="mt-2 text-sm text-gray-400 italic">This review has been hidden</p>
          ) : (
            review.text && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {review.text}
              </p>
            )
          )}

          {/* Report button */}
          {user && (review as any).status !== "HIDDEN" && (
            <div className="mt-2">
              {reportSent ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Report sent
                </span>
              ) : showReport ? (
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Reason for report..."
                    className="flex-1 px-3 py-1.5 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={handleReport}
                    disabled={!reportReason.trim()}
                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowReport(true)}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <FiFlag className="w-3 h-3" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}