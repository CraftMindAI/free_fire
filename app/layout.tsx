import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/common/Toast";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://titanarenagaming.com"),
  title: {
    default: "Titan Arena Gaming | Free Fire Custom Rooms & Tournaments",
    template: "%s | Titan Arena Gaming",
  },
  description:
    "Join daily Free Fire custom rooms, compete with elite squads, track your stats, and win instant cash rewards on Titan Arena Gaming.",
  keywords: [
    "Free Fire",
    "Free Fire India",
    "Esports",
    "Room Match",
    "Custom Match",
    "Custom Rooms",
    "Free Fire Custom Rooms",
    "Free Fire Room Match",
    "Free Fire Custom Match",
    "Daily Room Match",
    "Daily Custom Match",
    "Custom Room Match",
    "Free Fire Tournaments",
    "Free Fire Tournament Match",
    "Free Fire Solo Match",
    "Free Fire Duo Match",
    "Free Fire Squad Match",
    "Custom Room ID Password",
    "Free Fire Room Code",
    "Free Fire Paid Custom Room",
    "Earn Money Free Fire Custom Match",
    "Gaming Platform",
    "Titan Arena",
    "Titan Gaming",
    "Cash Rewards",
    "Free Fire Competitions",
    "Free Fire Bet Match",
    "Free Fire Bet Matches",
    "Ram Free Fire",
    "Ranking Free Fire",
    "Solo Custom Rooms",
    "Duo Custom Rooms",
    "Squad Custom Rooms",
    "Free Fire Max",
    "Online Gaming Tournament",
    "Esports Tournament Platform",
    "Instant Cash Payouts",
    "Free Fire Leaderboard",
    "Anti-Cheat Custom Rooms",
    "Victory Royale Cash Prize",
    "Free Fire Community",
    "Free Fire Daily Challenges",
    "Free Fire Competitive Gaming",
    "Free Fire Matchmaking",
    "Free Fire Weekend Tournaments",
    "Free Fire Squad Rush",
    "Solo Battle Royale",
    "Squad Arena",
    "1v1 Duels Free Fire",
    "Free Fire Prize Pool",
    "Free Fire Entry Fee Match",
    "Automated Matchmaking",
    "Live Match Stat Tracking",
    "Free Fire Win Rate Tracker",
    "Free Fire Kill Death Ratio",
    "Free Fire Cash Tournament India",
    "Cryptocurrency Gaming Rewards",
    "Instant Withdrawal Gaming",
    "Free Fire Battlegrounds",
    "Titan Arena Dashboard",
    "Pro Gaming Dashboard",
    "Free Fire Fair Play Anti-Cheat",
    "Free Fire Esports India",
    "Real Money Gaming Free Fire",
    "Free Fire Custom Room Booking",
  ],
  authors: [{ name: "Titan Arena Gaming Team" }],
  creator: "Titan Arena Gaming",
  publisher: "Titan Arena Gaming",
  openGraph: {
    title: "Titan Arena Gaming | Free Fire Custom Rooms & Tournaments",
    description:
      "Join daily Free Fire custom rooms with instant payouts and transparent anti-cheat leaderboards.",
    url: "https://titanarenagaming.com",
    siteName: "Titan Arena Gaming",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Titan Arena Gaming Logo",
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
    images: ["/favicon.ico"],
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
