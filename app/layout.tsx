import "./globals.css";
import type { ReactNode } from "react";

import NavBar from "@/components/NavBar";
import EnforcementBanner from "@/app/components/EnforcementBanner";
import Footer from "@/components/Footer";

export const metadata = {
  title: "St John AFM",
  description: "Church app",
  viewport: "width=device-width, initial-scale=1",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <NavBar />

        {/* Enforcement banner globally */}
        <EnforcementBanner />

        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}