"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { depositCredits } from "@/services/wallet";
import { recordPurchase } from "@/services/purchaseHistory";
import { logAuditEvent } from "@/services/audit";
import { FiDollarSign, FiCheck, FiCreditCard, FiAlertCircle } from "react-icons/fi";

const PACKAGES = [
  { credits: 10, price: "1", popular: false },
  { credits: 50, price: "4", popular: true },
  { credits: 100, price: "7", popular: false },
  { credits: 250, price: "17", popular: false },
  { credits: 500, price: "30", popular: false },
  { credits: 1000, price: "55", popular: false },
];

export default function TopupPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSelectPackage = (index: number) => {
    setSelected(index);
    setShowPayment(true);
    setShowPlaceholder(false);
  };

  const handleTestPayment = async () => {
    if (selected === null || !user) return;
    setProcessing(true);

    try {
      const pkg = PACKAGES[selected];

      // Log audit event
      await logAuditEvent({
        userId: user.id,
        action: "CREDIT_PURCHASE",
        entityType: "wallet",
        details: { amount: pkg.credits, package: pkg.credits },
      });

      // Deposit credits
      const result = await depositCredits(
        user.id,
        pkg.credits,
        `Purchase ${pkg.credits} Credits`
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to deposit");
      }

      // Record purchase history
      await recordPurchase({
        userId: user.id,
        amount: Number(pkg.price),
        credits: pkg.credits,
        paymentProvider: "test",
        transactionId: `test_${Date.now()}`,
        status: "COMPLETED",
        metadata: { package: pkg.credits },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/balance");
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("topup.success.title")}</h2>
          <p className="text-gray-500">{t("topup.success.desc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("topup.title")}</h1>
        <p className="text-gray-500 mt-2">{t("topup.desc")}</p>
      </div>

      <div className="grid gap-3 mb-8">
        {PACKAGES.map((pkg, index) => (
          <button
            key={index}
            onClick={() => handleSelectPackage(index)}
            className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
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

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selected === index ? "bg-amber-400" : "bg-amber-100"
              }`}>
                <FiDollarSign className={`w-5 h-5 ${
                  selected === index ? "text-amber-900" : "text-amber-500"
                }`} />
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">{pkg.credits} Credits</div>
                <div className="text-xs text-gray-500">≈ {pkg.price} USD</div>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === index ? "border-amber-400 bg-amber-400" : "border-gray-300"
            }`}>
              {selected === index && <FiCheck className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && selected !== null && !showPlaceholder && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 animate-scale-in">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            {t("topup.payment")}
          </h3>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            {PACKAGES[selected].credits} Credits — ≈ ${PACKAGES[selected].price} USD
          </p>

          {/* Test payment button */}
          <button
            onClick={handleTestPayment}
            disabled={processing}
            className="w-full py-3 bg-amber-400 text-amber-900 font-semibold rounded-xl hover:bg-amber-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiCreditCard className="w-5 h-5" />
            {processing ? t("topup.processing") : t("topup.testpay")}
          </button>

          <button
            onClick={() => setShowPlaceholder(true)}
            className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Show placeholder (production mode)
          </button>

          {/* Provider integration placeholder */}
          {/*
          Replace handleTestPayment with real provider:
          
          // YooKassa
          const payment = await PaymentService.createPayment({
            userId: user.id,
            amount: PACKAGES[selected].credits,
            description: `Purchase ${PACKAGES[selected].credits} Credits`,
          });
          window.location.href = payment.paymentUrl!;
          
          // After successful webhook:
          await depositCredits(user.id, PACKAGES[selected].credits, "...");
          await recordPurchase({ ... });
          */}
        </div>
      )}

      {/* Payment Unavailable Placeholder */}
      {showPlaceholder && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 animate-scale-in">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("topup.unavailable.title")}</h3>
            <p className="text-sm text-gray-500 max-w-sm">{t("topup.unavailable.desc")}</p>
            <button
              onClick={() => setShowPlaceholder(false)}
              className="mt-4 px-6 py-2 bg-amber-400 text-amber-900 rounded-xl text-sm font-semibold hover:bg-amber-500"
            >
              Back to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}