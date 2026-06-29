"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/LanguageContext";
import { FiUser, FiLogOut, FiSearch, FiHome, FiGlobe } from "react-icons/fi";

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { lang, setLang, t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <FiHome className="w-5 h-5" />
            <span className="hidden sm:inline">PeopleReview</span>
          </Link>
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <FiHome className="w-5 h-5" />
          <span className="hidden sm:inline">{t("nav.home")}</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageToggle lang={lang} setLang={setLang} />

          <Link
            href="/search"
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <FiSearch className="w-5 h-5" />
          </Link>

          <Link
            href={profile ? `/profile/${profile.id}` : "/"}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <FiUser className="w-5 h-5" />
          </Link>

          <Link
            href="/settings"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            {profile?.name || t("nav.profile")}
          </Link>

          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function LanguageToggle({ lang, setLang }: { lang: string; setLang: (l: "en" | "ru") => void }) {
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ru" : "en")}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-200"
      title={lang === "en" ? "Switch to Russian" : "Переключить на английский"}
    >
      <FiGlobe className="w-4 h-4" />
      <span>{lang === "en" ? "EN" : "RU"}</span>
    </button>
  );
}