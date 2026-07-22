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
      <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffb4ab]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[120px]">meeting_room</span>
        </div>
        <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">ACTIVE ROOMS</p>
        <div className="flex items-center gap-4">
          <span className="font-sora text-4xl font-bold text-[#ffb4ab] glow-crimson counter">{stats.activeRooms}</span>
        </div>
      </div>

      {/* Total Player Count */}
      <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffb4ab]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[120px]">groups</span>
        </div>
        <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">TOTAL PLAYER COUNT</p>
        <div className="flex items-center gap-4">
          <span className="font-sora text-4xl font-bold text-[#ffb4ab] counter">{stats.playerCount}</span>
        </div>
      </div>

      {/* Total Received Amount */}
      <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#e9c400]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[120px]">payments</span>
        </div>
        <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">TOTAL RECEIVED AMOUNT</p>
        <div className="flex items-center gap-4">
          <span className="font-sora text-4xl font-bold text-[#e9c400] counter">{stats.totalReceived}</span>
        </div>
      </div>

      {/* Total Price Paid */}
      <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#e9c400]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[120px]">trophy</span>
        </div>
        <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">TOTAL PRICE PAID</p>
        <div className="flex items-center gap-4">
          <span className="font-sora text-4xl font-bold text-[#e9c400] counter">{stats.totalPrizePaid}</span>
        </div>
      </div>
    </div>
  );
}
