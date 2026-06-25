import "./globals.css";
import "./home.css";
import "../components/navbar.css";
import { headers } from "next/headers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";

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

  return (
    <html lang="en">
      <body>
        <CurrencyProvider initialCountry={geoCountry}>
          <Navbar />
          {children}
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
