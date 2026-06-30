"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { FiHome, FiSearch, FiCamera, FiUser, FiSettings, FiCreditCard } from "react-icons/fi";

export default function MobileNav() {
  const { user, profile } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-amber-200 sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          href="/feed"
          className="flex flex-col items-center gap-0.5 text-amber-600 hover:text-amber-700 transition-colors"
        >
          <FiHome className="w-5 h-5" />
          <span className="text-[10px] font-medium">Feed</span>
        </Link>

        <Link
          href="/search"
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-amber-600 transition-colors"
        >
          <FiSearch className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link
          href="/scan"
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-amber-600 transition-colors"
        >
          <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center -mt-5 border-4 border-white shadow-lg">
            <FiCamera className="w-5 h-5 text-amber-900" />
          </div>
          <span className="text-[10px] font-medium">Scan QR</span>
        </Link>

        <Link
          href="/balance"
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-amber-600 transition-colors"
        >
          <FiCreditCard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Credits</span>
        </Link>

        <Link
          href="/settings"
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-amber-600 transition-colors"
        >
          <FiSettings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}