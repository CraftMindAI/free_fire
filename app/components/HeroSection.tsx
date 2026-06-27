"use client";

import ParticleCanvas from "./ParticleCanvas";

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden pt-20 md:pt-24
                 bg-[url('/card2.jpg')] bg-cover bg-[center_20%] bg-blend-overlay bg-black/40"
    >
      {/* Subtle overlay for readability, transparent enough for fire animation */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Floating particle dots — yellow / orange / red */}
      <ParticleCanvas count={90} />

      {/* ── Three-panel image strip ─────────────────────────── */}
      <div
        className="relative flex  w-full overflow-hidden px-14 md:px-24 lg:px-40
                      h-[200px] sm:h-[260px] md:h-[320px] lg:h-[370px]"
      >
        {/* LEFT panel */}
        <div className="relative overflow-hidden flex-[0.9] ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/imega1.jpg"
            alt="Soldier left"
            className="w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/50 to-transparent" />
        </div>

        {/* CENTER panel — wider */}
        <div className="relative overflow-hidden flex-[1.2] ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/imegae2.jpg"
            alt="Soldier center"
            className="w-full h-full object-cover object-center brightness-95"
          />
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/40 to-transparent" />
        </div>

        {/* RIGHT panel */}
        <div className="relative overflow-hidden flex-[0.9] ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image3.jpg"
            alt="Soldier right"
            className="w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/50 to-transparent" />
        </div>

        {/* Full-width bottom fade into title */}
        <div
          className="absolute bottom-0 inset-x-0 h-32
                         bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent
                         pointer-events-none z-10"
        />
      </div>

      {/* ── Title section ──────────────────────────────────── */}
      <div className="relative w-full text-center -mt-px">
        {/* Gradient overlay — darkens toward bottom so it blends into page */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#131313]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(80,0,0,0.4)_0%,transparent_60%)]" />

        {/* BATTLEZONE ghost text */}
        <p
          className="absolute right-6 md:right-16 top-6 font-orbitron font-black uppercase
                       text-white/10 tracking-widest leading-snug select-none hidden md:block
                       text-xs lg:text-base"
        >
          BATTLEZONE:
          <br />
          RESURGENCE
        </p>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4">
          {/* Title */}
          <h1
            className="font-orbitron font-black uppercase leading-[0.92] tracking-tight
                          text-[2rem] sm:text-[3rem] md:text-[4.2rem] lg:text-[5.5rem] xl:text-[6.5rem]
                          pt-4 md:pt-6 pb-2 w-full overflow-hidden"
          >
            <span className="block text-white neon-red">Ultimate</span>
            <span className="block text-white neon-red">Battle</span>
            <span className="block text-white neon-red">Tournament</span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-sora text-on-surface-variant font-semibold max-w-2xl
                         text-sm md:text-lg lg:text-xl mt-4 mb-6 md:mb-8"
          >
            Join Daily Custom Rooms • Win Cash Rewards • Compete with
            <br className="hidden md:block" /> the Best Players
          </p>

          {/* Red divider */}
          <div
            className="w-48 md:w-72 h-px mb-8 md:mb-12
                           bg-gradient-to-r from-transparent via-crimson to-transparent
                           shadow-[0_0_10px_rgba(255,46,46,0.6)]"
          />
        </div>
      </div>
    </section>
  );
}
