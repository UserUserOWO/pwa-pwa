"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { FiCamera, FiX } from "react-icons/fi";

export default function ScanPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            // Try to navigate to the scanned URL
            try {
              const url = new URL(decodedText);
              if (url.pathname.startsWith("/profile/")) {
                html5QrCode.stop().catch(() => {});
                router.push(url.pathname);
              }
            } catch {
              // Not a valid URL, just show it
              setError(`Scanned: ${decodedText}`);
            }
          },
          () => {} // ignore scan failure
        );
        setScanning(true);
      } catch (err) {
        setError("Camera access denied or unsupported. Use the search instead.");
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("scan.title")}</h1>
        <p className="text-gray-500 mt-1 text-sm">{t("scan.desc")}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 overflow-hidden">
        <div
          id="qr-reader"
          className="w-full rounded-xl overflow-hidden"
          style={{
            aspectRatio: "1/1",
            maxHeight: "400px",
          }}
        />
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <FiCamera className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900">{t("scan.hint.title")}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{t("scan.hint.desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}