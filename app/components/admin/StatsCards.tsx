"use client";

import React from "react";

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
      <div className="glass-card neon-red-glow p-6 rounded-xl relative group transition-all hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/20">
            <span className="material-symbols-outlined text-[#ffb4ab]">
              meeting_room
            </span>
          </div>
          <span className="text-xs font-jetbrains text-on-surface-variant animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e2e]"></span>
            LIVE
          </span>
        </div>
        <p className="font-jetbrains text-on-surface-variant text-[10px] tracking-wider uppercase mb-1">
          Active Rooms
        </p>
        <h3 className="font-sora text-headline-lg text-on-surface">
          {stats.activeRooms}
        </h3>
      </div>

      {/* Total Players */}
      <div className="glass-card neon-red-glow p-6 rounded-xl relative group transition-all hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/20">
            <span className="material-symbols-outlined text-[#ffb4ab]">
              groups
            </span>
          </div>
          <span className="text-xs font-jetbrains text-on-surface-variant">
            ROLE: PLAYER
          </span>
        </div>
        <p className="font-jetbrains text-on-surface-variant text-[10px] tracking-wider uppercase mb-1">
          Total Player Count
        </p>
        <h3 className="font-sora text-headline-lg text-on-surface">
          {stats.playerCount}
        </h3>
      </div>

      {/* Total Received Amount */}
      <div className="glass-card neon-gold-glow p-6 rounded-xl relative group transition-all hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-[#e9c400]/10 border border-[#e9c400]/20">
            <span className="material-symbols-outlined text-[#e9c400]">
              payments
            </span>
          </div>
          <span className="text-xs font-jetbrains text-[#e9c400]/70 uppercase">
            INR
          </span>
        </div>
        <p className="font-jetbrains text-on-surface-variant text-[10px] tracking-wider uppercase mb-1">
          Total Received Amount
        </p>
        <h3 className="font-sora text-headline-lg text-[#e9c400]">
          {stats.totalReceived}
        </h3>
      </div>

      {/* Total Price Paid */}
      <div className="glass-card neon-gold-glow p-6 rounded-xl relative group transition-all hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-[#e9c400]/10 border border-[#e9c400]/20">
            <span className="material-symbols-outlined text-[#e9c400]">
              trophy
            </span>
          </div>
          <span className="text-xs font-jetbrains text-[#e9c400]/70">
            PAYOUT
          </span>
        </div>
        <p className="font-jetbrains text-on-surface-variant text-[10px] tracking-wider uppercase mb-1">
          Total Price Paid
        </p>
        <h3 className="font-sora text-headline-lg text-on-surface">
          {stats.totalPrizePaid}
        </h3>
      </div>
    </div>
  );
}
