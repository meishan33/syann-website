import "./globals.css";
import "./home.css";
import "../components/navbar.css";
import { headers } from "next/headers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "SYANN",
  description: "Personalized crystal bracelets",
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
