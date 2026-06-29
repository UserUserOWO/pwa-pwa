import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "PeopleReview - Service reviews about people",
  description: "Create a profile, get a QR code and receive reviews from people you interact with",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <LanguageProvider>
          <Navbar />
          <main className="pb-16">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
