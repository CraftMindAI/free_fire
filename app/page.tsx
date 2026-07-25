import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "./lib/auth";
import { encryptId } from "./lib/encryption";
import HeroSection from "./components/HeroSection";
import UpcomingRooms from "./components/UpcomingRooms";
import FeaturesSection from "./components/FeaturesSection";
import DashboardSection from "./components/DashboardSection";
import FireShaderBackground from "./components/FireShaderBackground";

/**
 * SEO IMPROVEMENT 1: Next.js App Router Page-Specific Metadata
 * Provides page title, meta description, canonical URL, Open Graph, and Twitter Cards
 * specifically tailored to the homepage for maximum search engine indexability and social sharing.
 */
export const metadata: Metadata = {
  title: "Titan Arena Gaming | Daily Free Fire Custom Rooms & Tournaments",
  description:
    "Compete in daily Free Fire custom rooms, join solo, duo, and squad tournament matches, track live player statistics, and win instant cash prizes on Titan Arena Gaming.",
  alternates: {
    canonical: "https://titanareanagaming.com",
  },
  openGraph: {
    title: "Titan Arena Gaming | Daily Free Fire Custom Rooms & Tournaments",
    description:
      "Compete in daily Free Fire custom rooms, join solo, duo, and squad tournament matches, track live player statistics, and win instant cash prizes on Titan Arena Gaming.",
    url: "https://titanareanagaming.com",
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
    title: "Titan Arena Gaming | Daily Free Fire Custom Rooms & Tournaments",
    description:
      "Compete in daily Free Fire custom rooms, join solo, duo, and squad tournament matches, track live player statistics, and win instant cash prizes on Titan Arena Gaming.",
    images: ["/favicon.ico"],
  },
};

/**
 * SEO IMPROVEMENT 2: Schema.org Structured Data (JSON-LD)
 * Defines WebSite, Organization, and WebPage entities so search engines like Google
 * can generate Rich Snippets, Knowledge Graph panels, and enhanced search results.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://titanareanagaming.com/#website",
      "url": "https://titanareanagaming.com",
      "name": "Titan Arena Gaming",
      "description":
        "Ultimate Free Fire custom room and tournament platform with instant cash rewards and live stat tracking.",
      "publisher": {
        "@id": "https://titanareanagaming.com/#organization",
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "Organization",
      "@id": "https://titanareanagaming.com/#organization",
      "name": "Titan Arena Gaming",
      "url": "https://titanareanagaming.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://titanareanagaming.com/favicon.ico",
      },
      "sameAs": [],
    },
    {
      "@type": "WebPage",
      "@id": "https://titanareanagaming.com/#webpage",
      "url": "https://titanareanagaming.com",
      "name": "Titan Arena Gaming | Daily Free Fire Custom Rooms & Tournaments",
      "isPartOf": {
        "@id": "https://titanareanagaming.com/#website",
      },
      "about": {
        "@id": "https://titanareanagaming.com/#organization",
      },
      "description":
        "Compete in daily Free Fire custom rooms, join solo, duo, and squad tournament matches, track live player statistics, and win instant cash prizes on Titan Arena Gaming.",
      "inLanguage": "en-US",
    },
  ],
};

export default async function Home() {
  // Existing business logic: Check authentication and handle role-based redirection
  const user = await getSessionUser();

  if (user) {
    const encryptedId = encryptId(String(user.id));
    if (user.role.toLowerCase() === "admin") {
      redirect(`/profile/v2/dashboard/${encryptedId}/home`);
    } else {
      redirect(`/profile/v1/${encryptedId}/dashboard/home`);
    }
  }

  return (
    <>
      {/* SEO IMPROVEMENT 3: Embedded JSON-LD Script for Search Engine Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FireShaderBackground />
      <div className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
        {/* SEO IMPROVEMENT 4: Semantic HTML Container (<main>) Wrapping Primary Page Sections */}
        <main className="flex-1">
          {/* Note: HeroSection renders the single primary <h1> heading for the homepage */}
          <HeroSection />
          <UpcomingRooms />
          <FeaturesSection />
          <DashboardSection />
        </main>
      </div>
    </>
  );
}
