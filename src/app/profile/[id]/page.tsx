"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { getProfileById } from "@/services/profiles";
import { getReviewsForProfile, getReviewStats, createReview } from "@/services/reviews";
import { Profile, Review } from "@/types";
import ReviewCard from "@/components/ReviewCard";
import { QRCodeSVG } from "qrcode.react";
import { FiStar, FiMessageSquare, FiX, FiDownload } from "react-icons/fi";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: myProfile } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ count: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [origin, setOrigin] = useState("");

  const isMyProfile = myProfile?.id === id;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const load = async () => {
      const [profileData, reviewsData, statsData] = await Promise.all([
        getProfileById(id),
        getReviewsForProfile(id),
        getReviewStats(id),
      ]);
      setProfile(profileData);
      setReviews(reviewsData);
      setStats(statsData);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !myProfile) return;
    setSubmitting(true);
    try {
      await createReview(id, myProfile.id, rating, text);
      const [reviewsData, statsData] = await Promise.all([
        getReviewsForProfile(id),
        getReviewStats(id),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      setShowReviewForm(false);
      setText("");
      setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${profile?.name || "profile"}.png`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-lg font-semibold text-gray-900">{t("profile.notfound")}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.name?.[0]?.toUpperCase() || "?"
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>

            {profile.description && (
              <p className="text-gray-500 mt-1">{profile.description}</p>
            )}

            {profile.hashtags && profile.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {profile.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 mt-4 justify-center sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
                <div className="text-xs text-gray-500">{t("profile.reviews")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{stats.average}</div>
                <div className="text-xs text-gray-500">{t("profile.rating")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              {origin && (
                <QRCodeSVG
                  id="qr-code"
                  value={`${origin}/profile/${id}`}
                  size={120}
                  level="L"
                />
              )}
            </div>
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              {t("profile.download_qr")}
            </button>
          </div>
        </div>

        {/* Review Button */}
        {!isMyProfile && user && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FiMessageSquare className="w-5 h-5" />
              {showReviewForm ? t("profile.review.cancel") : t("profile.review.btn")}
            </button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mt-6 p-5 bg-gray-50 rounded-xl animate-scale-in">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile.review.rating")}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-all hover:scale-110"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile.review.text")}</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("profile.review.placeholder")}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? t("profile.review.submitting") : t("profile.review.submit")}
            </button>
          </form>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("profile.reviews")} ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500">{t("profile.noreviews")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}