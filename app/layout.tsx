import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}