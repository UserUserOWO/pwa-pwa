"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { FiCamera, FiX } from "react-icons/fi";

export default function ScanPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const scannerInitialized = useRef(false);
  const scannerInstance = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const stopScanner = useCallback(async () => {
    if (scannerInstance.current) {
      try {
        await scannerInstance.current.stop();
      } catch {}
      scannerInstance.current = null;
    }
    scannerInitialized.current = false;
  }, []);

  useEffect(() => {
    if (!user || !isBrowser) return;
    if (scannerInitialized.current) return;

    const initScanner = async () => {
      scannerInitialized.current = true;
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerInstance.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            try {
              const url = new URL(decodedText);
              if (url.pathname.startsWith("/profile/")) {
                stopScanner();
                router.push(url.pathname);
              }
            } catch {
              setError(`Scanned: ${decodedText}`);
            }
          },
          () => {}
        );
        setScanning(true);
      } catch (err: any) {
        scannerInitialized.current = false;
        setError("Camera access denied or unsupported. Use the search instead.");
      }
    };

    initScanner();

    return () => {
      stopScanner();
    };
  }, [user, isBrowser, router, stopScanner]);

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
        {isBrowser ? (
          <div
            id="qr-reader"
            className="w-full rounded-xl overflow-hidden"
            style={{
              aspectRatio: "1/1",
              maxHeight: "400px",
            }}
          />
        ) : (
          <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {scanning && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm text-center animate-fade-in">
          {t("scan.active")}
        </div>
      )}

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