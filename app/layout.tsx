import "./globals.css";
import "./home.css";
import "../components/navbar.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";

export const metadata = {
  title: "SYANN",
  description: "Personalized crystal bracelets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <Navbar />
          {children}
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
