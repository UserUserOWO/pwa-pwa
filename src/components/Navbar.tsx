"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/LanguageContext";
import { FiUser, FiLogOut, FiSearch, FiHome, FiGlobe, FiCamera, FiCreditCard } from "react-icons/fi";

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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-500 font-bold text-xl">
            <FiHome className="w-5 h-5" />
            <span className="hidden sm:inline">PeopleReview</span>
          </Link>
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 text-amber-500 font-bold text-xl">
          <FiHome className="w-5 h-5" />
          <span className="hidden sm:inline">{t("nav.home")}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/balance"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition-all"
          >
            <FiCreditCard className="w-4 h-4" />
            {t("nav.balance")}
          </Link>

          <Link
            href="/scan"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition-all"
          >
            <FiCamera className="w-4 h-4" />
            {t("nav.scan")}
          </Link>

          <LanguageToggle lang={lang} setLang={setLang} />

          <Link
            href="/search"
            className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
          >
            <FiSearch className="w-5 h-5" />
          </Link>

          <Link
            href={profile ? `/profile/${profile.id}` : "/"}
            className="hidden sm:flex items-center gap-2 p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
          >
            <FiUser className="w-5 h-5" />
          </Link>

          <Link
            href="/settings"
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-amber-500 transition-colors"
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all border border-amber-200"
      title={lang === "en" ? "Switch to Russian" : "Переключить на английский"}
    >
      <FiGlobe className="w-4 h-4" />
      <span>{lang === "en" ? "EN" : "RU"}</span>
    </button>
  );
}