import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MahaKrushi AI – Maharashtra Smart Farming Platform",
  description: "AI-powered agriculture intelligence for Maharashtra farmers. Real-time weather, satellite crop health, mandi prices, disease detection and more.",
};

import { AuthProvider } from "@/lib/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
