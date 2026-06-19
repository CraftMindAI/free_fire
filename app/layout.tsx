import type { Metadata } from "next";
import { Orbitron, Sora } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Free Fire — Ultimate Battle Tournament",
  description: "Join Daily Custom Rooms • Win Cash Rewards • Compete with the Best Players",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#131313]">{children}</body>
    </html>
  );
}
