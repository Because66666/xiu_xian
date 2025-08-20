import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "修仙世界模拟器",
  description: "体验修仙世界的残酷与辉煌，见证修士们的成长与陨落",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
