import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arsenal Global Fan Platform",
  description: "Unite with Arsenal fans worldwide. Check in to matches, earn badges, and compete on global leaderboards.",
  keywords: ["Arsenal", "Arsenal FC", "Gooners", "Football", "Soccer", "Fan Platform"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
