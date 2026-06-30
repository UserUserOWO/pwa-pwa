"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { FiDollarSign, FiAlertCircle } from "react-icons/fi";

const PACKAGES = [
  { credits: 10, price: "1", popular: false },
  { credits: 50, price: "4", popular: true },
  { credits: 100, price: "7", popular: false },
  { credits: 500, price: "30", popular: false },
];

export default function TopupPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("topup.title")}</h1>
        <p className="text-gray-500 mt-2">{t("topup.desc")}</p>
      </div>

      <div className="grid gap-4 mb-8">
        {PACKAGES.map((pkg, index) => (
          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${
              selected === index
                ? "border-amber-400 bg-amber-50 shadow-md"
                : "border-amber-100 bg-white hover:border-amber-200 hover:shadow-sm"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-2.5 left-4 px-3 py-0.5 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full">
                {t("topup.popular")}
              </span>
            )}

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === index ? "bg-amber-400" : "bg-amber-100"
              }`}>
                <FiDollarSign className={`w-6 h-6 ${
                  selected === index ? "text-amber-900" : "text-amber-500"
                }`} />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{pkg.credits} Credits</div>
                <div className="text-sm text-gray-500">≈ {pkg.price} USD</div>
              </div>
            </div>

            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selected === index ? "border-amber-400 bg-amber-400" : "border-gray-300"
            }`}>
              {selected === index && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Payment placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <FiAlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t("topup.unavailable.title")}</h3>
          <p className="text-sm text-gray-500 max-w-sm">{t("topup.unavailable.desc")}</p>
        </div>

        {/* Payment provider integration placeholder - replace with real provider */}
        {/*
          To integrate a real payment provider:
          1. Create a class implementing PaymentProvider (e.g., StripeProvider.ts)
          2. Update PaymentService.getProvider() to use it
          3. Replace this placeholder with the actual payment UI
          
          Supported providers:
          - Stripe
          - YooKassa (ЮKassa)
          - SBP (СБП)
          - CloudPayments
        */}
      </div>
    </div>
  );
}