import Image from "next/image";
import type { Metadata } from "next";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export const metadata: Metadata = {
  title: "About Us | Titan Arena Gaming - Free Fire Esports Platform",
  description:
    "Discover the story, mission, and vision behind Titan Arena Gaming — India's premier platform for daily Free Fire custom rooms, fair play anti-cheat tournaments, and instant cash rewards.",
  alternates: {
    canonical: "https://titanareanagaming.com/about",
  },
  openGraph: {
    title: "About Us | Titan Arena Gaming - Free Fire Esports Platform",
    description:
      "Discover the story, mission, and vision behind Titan Arena Gaming — India's premier platform for daily Free Fire custom rooms, fair play anti-cheat tournaments, and instant cash rewards.",
    url: "https://titanareanagaming.com/about",
    siteName: "Titan Arena Gaming",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Titan Arena Gaming Emblem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Titan Arena Gaming",
    description:
      "Learn how Titan Arena Gaming empowers Free Fire players with fair custom rooms, transparent prize pools, and instant rewards.",
    images: ["/favicon.ico"],
  },
  keywords: [
    "About Titan Arena",
    "Free Fire Custom Room Platform",
    "Free Fire Tournament Platform India",
    "Fair Play Free Fire",
    "Free Fire Anti-Cheat Monitoring",
    "Instant Cash Rewards Free Fire",
    "Free Fire Community Platform",
    "Built by Gamers",
  ],
};

const STATS = [
  { label: "Active Players", value: "1K+" },
  { label: "Matches Hosted", value: "500+" },
  { label: "Cash Rewarded", value: "₹15K+" },
  { label: "Custom Rooms Daily", value: "20+" },
];

const VALUES = [
  {
    title: "Fair Play & Anti-Cheat",
    description:
      "Every match runs under strict anti-cheat monitoring and transparent rules, so pure skill and squad coordination decide the winner.",
  },
  {
    title: "Instant Cash Rewards",
    description:
      "Cash prizes are credited fast with transparent payout logs, giving players reliable reward distribution after every victory.",
  },
  {
    title: "Built by Gamers",
    description:
      "Our team lives and breathes Free Fire esports. We design every room format, match timing, and prize pool around what competitive players truly want.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Us | Titan Arena Gaming",
  "url": "https://titanareanagaming.com/about",
  "description":
    "Titan Arena Gaming is India's leading Free Fire esports and custom room tournament platform.",
  "publisher": {
    "@type": "Organization",
    "name": "Titan Arena Gaming",
    "url": "https://titanareanagaming.com",
    "logo": "https://titanareanagaming.com/favicon.ico",
  },
};

export default function AboutPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cinematic background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          alt="Titan Arena Gaming Esports Background"
          aria-hidden="true"
          src="/card2.jpg"
        />
        <ParticleCanvas count={60} />
      </div>

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          About Titan Arena Gaming
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-6">
          We Built The Arena<br className="hidden md:block" /> You&apos;ve Been Grinding For
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Titan Arena Gaming is a premier Free Fire custom room and tournament platform where
          every solo player and squad gets a fair shot at competitive glory, skill validation, and real cash rewards.
        </p>
      </section>

      {/* Stats */}
      <section className="px-6 max-w-[1440px] w-full mx-auto pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl py-8 px-4 text-center border-t-4 border-crimson"
            >
              <div className="font-orbitron text-3xl md:text-4xl font-black text-[#ffb4ab]">
                {stat.value}
              </div>
              <div className="mt-2 text-on-surface-variant text-[10px] md:text-xs font-bold tracking-widest uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="px-6 max-w-[1440px] w-full mx-auto pb-16">
        <div className="glass rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="shrink-0 flex items-center justify-center bg-transparent">
            <Image
              src="/favicon.ico"
              alt="Titan Arena Gaming Official Emblem"
              width={180}
              height={180}
              className="w-32 h-32 md:w-44 md:h-44 object-contain filter drop-shadow-[0_0_20px_rgba(255,180,171,0.25)] mix-blend-screen bg-transparent"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-sora text-2xl md:text-3xl font-bold mb-6">Our Story &amp; Origin</h2>
            <p className="text-on-surface-variant leading-relaxed text-base mb-4">
              Titan Arena Gaming started with a simple frustration: finding a legit,
              well-managed Free Fire custom room shouldn&apos;t feel like a hassle. So we built a dedicated platform.
              What began as a handful of late-night competitive squad matches has grown into a daily battleground hosting thousands of players across India competing for real cash prizes.
            </p>
            <p className="text-on-surface-variant leading-relaxed text-base">
              Today, Titan Arena Gaming hosts Solo, Duo, and Squad custom rooms around the clock with instant withdrawal payouts, live match stat tracking, and an intuitive player dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 max-w-[1440px] w-full mx-auto pb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-2xl border-t-4 border-crimson">
          <h2 className="font-sora text-2xl font-bold mb-4 text-on-surface">Our Mission</h2>
          <p className="text-on-surface-variant leading-relaxed text-base">
            To provide every mobile esports competitor in India with an automated, transparent, and cheat-free environment to showcase their skills, climb competitive ranks, and earn cash rewards seamlessly.
          </p>
        </div>

        <div className="glass p-10 rounded-2xl border-t-4 border-secondary">
          <h2 className="font-sora text-2xl font-bold mb-4 text-on-surface">Our Vision</h2>
          <p className="text-on-surface-variant leading-relaxed text-base">
            To become South Asia&apos;s leading competitive tournament hub for battle royale titles, empowering aspiring esports athletes from grassroots custom rooms to professional league showcases.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 max-w-[1440px] w-full mx-auto pb-24">
        <h2 className="font-sora text-2xl md:text-3xl font-bold mb-8 text-center">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VALUES.map((value) => (
            <div key={value.title} className="glass p-8 rounded-2xl border-t-4 border-crimson">
              <h3 className="font-sora text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
