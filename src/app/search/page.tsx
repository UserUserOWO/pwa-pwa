"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { searchProfiles } from "@/services/profiles";
import { Profile } from "@/types";
import { FiSearch, FiUser } from "react-icons/fi";

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const data = await searchProfiles(query.trim());
      setResults(data);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search People</h1>

      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or hashtag..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm shadow-sm"
          autoFocus
        />
      </div>

      {searching && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!searching && query && results.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No results found</h2>
          <p className="text-gray-500">Try a different search query</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.name?.[0]?.toUpperCase() || "?"
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
                {profile.description && (
                  <p className="text-sm text-gray-500 truncate">{profile.description}</p>
                )}
                {profile.hashtags && profile.hashtags.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {profile.hashtags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-indigo-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <FiUser className="w-5 h-5 text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Find people</h2>
          <p className="text-gray-500">Search by name or hashtag to find people</p>
        </div>
      )}
    </div>
  );
}