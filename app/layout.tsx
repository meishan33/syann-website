import "./globals.css";
import "./home.css";
import "../components/navbar.css";
import { headers } from "next/headers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { supabaseAdmin } from "@/lib/supabase-admin";

import type { Metadata } from "next";

const SITE_URL = "https://syann.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SYANN.CO — Personalized Crystal Bracelets",
    template: "%s | SYANN.CO",
  },
  description: "Discover your personalized crystal bracelet powered by Five Elements wisdom and AI. Every bracelet is uniquely curated for your energy, birth date, and intentions.",
  keywords: ["crystal bracelet", "personalized bracelet", "Five Elements", "crystal healing", "energy bracelet", "SYANN"],
  openGraph: {
    type: "website",
    siteName: "SYANN.CO",
    title: "SYANN.CO — Personalized Crystal Bracelets",
    description: "Discover your personalized crystal bracelet powered by Five Elements wisdom and AI.",
    url: SITE_URL,
    images: [{ url: "/NewLogo.png", width: 600, height: 600, alt: "SYANN.CO Crystal Bracelets" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYANN.CO — Personalized Crystal Bracelets",
    description: "Discover your personalized crystal bracelet powered by Five Elements wisdom and AI.",
    images: ["/NewLogo.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vercel's Edge Network injects this header with the visitor's actual IP-based
  // country on every request — present in production/preview, absent in local dev.
  const headerList = await headers();
  const geoCountry = headerList.get("x-vercel-ip-country");

  const { data: settings } = await supabaseAdmin.from("site_settings").select("shop_enabled").eq("id", 1).maybeSingle();
  const shopEnabled = settings?.shop_enabled ?? false;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <CurrencyProvider initialCountry={geoCountry}>
          <Navbar shopEnabled={shopEnabled} />
          {children}
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
