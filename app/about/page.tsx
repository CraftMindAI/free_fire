import type { Metadata } from "next";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export const metadata: Metadata = {
  title: "About Us — Titan Arena",
  description:
    "Learn more about Titan Arena, the ultimate Free Fire custom room and tournament platform.",
};

const STATS = [
  { label: "Active Players", value: "1K+" },
  { label: "Matches Hosted", value: "500" },
  { label: "Cash Rewarded", value: "₹15K+" },
  { label: "Custom Rooms Daily", value: "20+" },
];

const VALUES = [
  {
    title: "Fair Play",
    description:
      "Every match runs on strict anti-cheat monitoring and transparent rules, so skill decides the winner — not exploits.",
  },
  {
    title: "Instant Rewards",
    description:
      "Cash prizes are credited fast, with a clear distribution history so players always know where they stand.",
  },
  {
    title: "Built by Gamers",
    description:
      "Our team lives and breathes Free Fire. We design every room, mode, and reward around what players actually want.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
      {/* Cinematic background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          alt=""
          aria-hidden="true"
          src="/card2.jpg"
        />
        <ParticleCanvas count={60} />
      </div>

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          About Titan Arena
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-6">
          We Built The Arena<br className="hidden md:block" /> You've Been Grinding For
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Titan Arena is a Free Fire custom room and tournament platform where
          every squad gets a fair shot at glory and hard cash. Daily
          rooms, real rewards.
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
        <div className="glass rounded-2xl p-10 md:p-14">
          <h2 className="font-sora text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-on-surface-variant leading-relaxed text-base mb-4">
            Titan Arena started with a simple frustration: finding a legit,
            well-run custom room shouldn't feel like a side quest. So we built
            one. What began as a handful of late-night squad matches has grown
            into a daily arena hosting thousands of players competing for real
            cash rewards.
          </p>
          <p className="text-on-surface-variant leading-relaxed text-base">
            Today, Titan Arena runs solo, duo, and squad rooms around the
            clock, with instant payouts and a dashboard that keeps every
            player in the loop — from registration to the victory royale.
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
