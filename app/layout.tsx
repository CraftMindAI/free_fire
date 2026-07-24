import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: "Free Fire — Ultimate Battle Tournament",
  description:
    "Join Daily Custom Rooms, Win Cash Rewards and  Compete with the Best Players",
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
        <Navbar />
        {children}
        <Footer />
        <ToastContainer theme="dark" />
      </body>
    </html>
  );
}
