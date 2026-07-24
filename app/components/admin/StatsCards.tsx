"use client";

import React from "react";
import Image from "next/image";
import ParticleCanvas from "@/app/components/ParticleCanvas";

interface StatsCardsProps {
  stats: {
    activeRooms: number;
    playerCount: number;
    totalReceived: string;
    totalPrizePaid: string;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Active Rooms */}
      <div className="p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-[#ffb4ab]/60 shadow-[0_0_40px_rgba(255,46,46,0.08)] hover:shadow-[0_0_50px_rgba(255,46,46,0.2)]">
        {/* Scoped Fire Particle Animation */}
        <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
          <ParticleCanvas count={30} />
        </div>

        {/* Profile Image Overlay: Medium (opacity-50) -> Full (opacity-100) */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
          <Image
            src="/assets/profiles/Pic11.png"
            alt="Active Rooms"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
        </div>

        {/* Ambient Fire Glow Overlay */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#ff2e2e]/20 via-[#ff544a]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

        <div className="relative z-20">
          <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-4 tracking-wider uppercase font-bold">ACTIVE ROOMS</p>
          <div className="flex items-center gap-4">
            <span className="font-sora text-4xl font-extrabold text-[#ffb4ab] neon-red counter">{stats.activeRooms}</span>
          </div>
        </div>
      </div>

      {/* Total Player Count */}
      <div className="p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-[#ffb4ab]/60 shadow-[0_0_40px_rgba(255,46,46,0.08)] hover:shadow-[0_0_50px_rgba(255,46,46,0.2)]">
        {/* Scoped Fire Particle Animation */}
        <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
          <ParticleCanvas count={30} />
        </div>

        {/* Profile Image Overlay: Medium (opacity-50) -> Full (opacity-100) */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
          <Image
            src="/assets/profiles/Pic13.png"
            alt="Player Count"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
        </div>

        {/* Ambient Fire Glow Overlay */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#ff2e2e]/20 via-[#ff544a]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

        <div className="relative z-20">
          <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-4 tracking-wider uppercase font-bold">TOTAL PLAYER COUNT</p>
          <div className="flex items-center gap-4">
            <span className="font-sora text-4xl font-extrabold text-[#ffb4ab] neon-red counter">{stats.playerCount}</span>
          </div>
        </div>
      </div>

      {/* Total Received Amount */}
      <div className="p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-[#ffcb8d]/60 shadow-[0_0_40px_rgba(255,46,46,0.08)] hover:shadow-[0_0_50px_rgba(255,46,46,0.2)]">
        {/* Scoped Fire Particle Animation */}
        <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
          <ParticleCanvas count={30} />
        </div>

        {/* Profile Image Overlay: Medium (opacity-50) -> Full (opacity-100) */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
          <Image
            src="/assets/profiles/Pic15.png"
            alt="Total Received"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
        </div>

        {/* Ambient Fire Glow Overlay */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#ff2e2e]/20 via-[#ff544a]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

        <div className="relative z-20">
          <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-4 tracking-wider uppercase font-bold">TOTAL RECEIVED AMOUNT</p>
          <div className="flex items-center gap-4">
            <span className="font-sora text-4xl font-extrabold text-[#ffcb8d] neon-red counter">{stats.totalReceived}</span>
          </div>
        </div>
      </div>

      {/* Total Price Paid */}
      <div className="p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-[#ffcb8d]/60 shadow-[0_0_40px_rgba(255,46,46,0.08)] hover:shadow-[0_0_50px_rgba(255,46,46,0.2)]">
        {/* Scoped Fire Particle Animation */}
        <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
          <ParticleCanvas count={30} />
        </div>

        {/* Profile Image Overlay: Medium (opacity-50) -> Full (opacity-100) */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
          <Image
            src="/assets/profiles/Pic12.png"
            alt="Total Price Paid"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
        </div>

        {/* Ambient Fire Glow Overlay */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#ff2e2e]/20 via-[#ff544a]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

        <div className="relative z-20">
          <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-4 tracking-wider uppercase font-bold">TOTAL PRICE PAID</p>
          <div className="flex items-center gap-4">
            <span className="font-sora text-4xl font-extrabold text-[#ffcb8d] neon-red counter">{stats.totalPrizePaid}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
