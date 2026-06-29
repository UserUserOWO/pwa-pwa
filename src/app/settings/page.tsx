"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { updateProfile, uploadProfilePhoto } from "@/services/profiles";
import { FiCamera, FiSave, FiAlertCircle } from "react-icons/fi";

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hashtagsStr, setHashtagsStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDescription(profile.description || "");
      setHashtagsStr(profile.hashtags?.join(", ") || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const hashtags = hashtagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await updateProfile(profile.id, {
        name,
        description,
        hashtags,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setPhotoUploading(true);
    try {
      const url = await uploadProfilePhoto(file);
      await updateProfile(profile.id, { photo_url: url });
      window.location.reload();
    } catch (err) {
      setError("Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("settings.title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
              <FiCamera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={photoUploading}
              />
            </label>
          </div>
          {photoUploading && <p className="text-sm text-gray-500 mt-2">{t("settings.uploading")}</p>}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm text-center">
            {t("settings.success")}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("settings.name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("settings.description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm resize-none"
            placeholder="Tell about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("settings.hashtags")}
          </label>
          <input
            type="text"
            value={hashtagsStr}
            onChange={(e) => setHashtagsStr(e.target.value)}
            placeholder={t("settings.hashtags.placeholder")}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FiSave className="w-5 h-5" />
          {saving ? t("settings.saving") : t("settings.save")}
        </button>
      </form>
    </div>
  );
}