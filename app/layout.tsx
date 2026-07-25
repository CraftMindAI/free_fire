import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/common/Toast";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SEO_KEYWORDS } from "./lib/seo-keywords";

export const metadata: Metadata = {
 metadataBase: new URL("https://titanareanagaming.com"),
   alternates: {
    canonical: "https://titanareanagaming.com",
  },applicationName: "Titan Arena Gaming",

  category: "Gaming",
title: {
    default: "Titan Arena Gaming | Free Fire Custom Rooms & Tournaments",
    template: "%s | Titan Arena Gaming",
  },
  
  description:
    "Join daily Free Fire custom rooms, compete with elite squads, track your stats, and win instant cash rewards on Titan Arena Gaming.",
  keywords: SEO_KEYWORDS,
  authors: [{ name: "Titan Arena Gaming Team" }],
  creator: "Titan Arena Gaming",
  publisher: "Titan Arena Gaming",
 icons: {
  icon: "/favicon_b.ico",
  shortcut: "/favicon_b.ico",
  apple: "/apple-touch-icon.png",
},
  openGraph: {
  title: "Titan Arena Gaming | Free Fire Custom Rooms & Tournaments",
  description:
    "Join daily Free Fire custom rooms with instant payouts and transparent anti-cheat leaderboards.",
  url: "https://titanareanagaming.com",
  siteName: "Titan Arena Gaming",
  images: [
    {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Titan Arena Gaming",
    },
  ],
  locale: "en_US",
  type: "website",
},

twitter: {
  card: "summary_large_image",
  title: "Titan Arena Gaming | Free Fire Custom Rooms",
  description:
    "Daily Free Fire custom rooms, live tournament rooms, and instant cash rewards.",
  images: ["/og-image.png"],
},
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#131313] font-sora">
        <ToastProvider>
          <Navbar />
          {children}
          <Footer />
        </ToastProvider>
        <ToastContainer theme="dark" />
      </body>
    </html>
  );
}
