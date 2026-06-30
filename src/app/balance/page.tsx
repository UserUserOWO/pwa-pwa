"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { getWallet, getTransactions, getRecentDeposits, getRecentSpends } from "@/services/wallet";
import { Wallet, Transaction } from "@/types";
import { FiCreditCard, FiArrowUp, FiArrowDown, FiRefreshCw, FiPlus } from "react-icons/fi";

export default function BalancePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentDeposits, setRecentDeposits] = useState<Transaction[]>([]);
  const [recentSpends, setRecentSpends] = useState<Transaction[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    const [walletData, txData, deposits, spends] = await Promise.all([
      getWallet(user.id),
      getTransactions(user.id),
      getRecentDeposits(user.id),
      getRecentSpends(user.id),
    ]);
    setWallet(walletData);
    setTransactions(txData);
    setRecentDeposits(deposits);
    setRecentSpends(spends);
    setPageLoading(false);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("balance.title")}</h1>
        <button
          onClick={() => { setPageLoading(true); loadData(); }}
          className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
        >
          <FiRefreshCw className={`w-5 h-5 ${pageLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {pageLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 animate-pulse">
          <div className="h-8 bg-amber-100 rounded w-1/3 mx-auto mb-4" />
          <div className="h-12 bg-amber-100 rounded w-1/2 mx-auto" />
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-8 shadow-lg text-center mb-6">
            <p className="text-amber-900/70 text-sm font-medium mb-2">{t("balance.current")}</p>
            <div className="text-5xl font-bold text-amber-900 mb-2">
              {wallet?.balance || 0}
            </div>
            <p className="text-amber-900/60 text-sm">{t("balance.credits")}</p>

            <Link
              href="/topup"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-900 text-amber-100 font-semibold rounded-xl hover:bg-amber-950 active:scale-[0.98] transition-all"
            >
              <FiPlus className="w-5 h-5" />
              {t("balance.topup")}
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiArrowUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{t("balance.deposits")}</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{recentDeposits.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiArrowDown className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{t("balance.spends")}</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{recentSpends.length}</div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("balance.history")}</h2>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <FiCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("balance.history.empty")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === "DEPOSIT" ? "bg-green-100" :
                        tx.type === "SPEND" ? "bg-red-100" : "bg-blue-100"
                      }`}>
                        {tx.type === "DEPOSIT" ? (
                          <FiArrowUp className="w-4 h-4 text-green-600" />
                        ) : tx.type === "SPEND" ? (
                          <FiArrowDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <FiRefreshCw className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      tx.type === "DEPOSIT" ? "text-green-600" :
                      tx.type === "SPEND" ? "text-red-600" : "text-blue-600"
                    }`}>
                      {tx.type === "DEPOSIT" ? "+" : tx.type === "REFUND" ? "+" : "-"}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}