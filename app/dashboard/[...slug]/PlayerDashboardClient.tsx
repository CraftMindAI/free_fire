"use client";

import React, { useState } from "react";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import ActiveRooms, { RoomData } from "@/app/components/admin/ActiveRooms";

interface PlayerDashboardClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  initialRooms: RoomData[];
}

export default function PlayerDashboardClient({
  user,
  initialRooms,
}: PlayerDashboardClientProps) {
  const [rooms] = useState<RoomData[]>(initialRooms);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const playerStats = [
    { label: "Matches Played", value: "28", icon: "sports_esports", color: "#ffb4ab", glow: "neon-red-glow" },
    { label: "Total Earnings", value: "₹8,450.00", icon: "payments", color: "#e9c400", glow: "neon-gold-glow" },
    { label: "Win Rate", value: "42.8%", icon: "trophy", color: "#ffb4ab", glow: "neon-red-glow" },
    { label: "Squad Rank", value: "Platinum IV", icon: "military_tech", color: "#e9c400", glow: "neon-gold-glow" }
  ];

  return (
    <div className="flex bg-[#131313] text-on-surface min-h-screen relative font-sora">
      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
        />

        <main className="flex-1 px-8 pt-28 pb-12 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h1 className="font-orbitron text-3xl md:text-4xl font-extrabold text-on-surface uppercase tracking-tight orbitron-header">
                Player Terminal
              </h1>
              <p className="text-on-surface-variant font-sora text-sm mt-1">
                Your combat stats, active tournaments, and ranking.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#ffb4ab] font-jetbrains text-xs tracking-wider uppercase bg-[#ffb4ab]/5 px-3 py-1.5 rounded-full border border-[#ffb4ab]/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              SQUAD ONLINE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {playerStats.map((stat, i) => (
              <div
                key={i}
                className={`glass-card ${stat.glow} p-6 rounded-xl relative group transition-all hover:-translate-y-1`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${stat.color}0a`,
                      borderColor: `${stat.color}20`,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: stat.color }}>
                      {stat.icon}
                    </span>
                  </div>
                </div>
                <p className="font-jetbrains text-on-surface-variant text-[10px] tracking-wider uppercase mb-1">
                  {stat.label}
                </p>
                <h3 className="font-sora text-headline-lg text-on-surface" style={{ color: stat.color === "#e9c400" ? "#e9c400" : undefined }}>
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8">
            <ActiveRooms rooms={rooms} />
          </div>
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02] mix-blend-screen overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1kAd1DAydejLi9dWJ4pVlEa1iib-4lGbGw0xTOCFWmWGisk3zfXVWxCBeyoiNP7dFCRMsZwX2m8jupngdTBZk1Qa_lwTW4KdWHu3U-OQ4PrAly7y88CzcjU3Bq5uAq-tbJ6NJDHR5yLUIwLUczg1u9IRRL4NyeyeHvg8h_f1OpieE-KyIr0wC2Shjl4lQhX0iCDrCwpL_jEHj8LL_RTwDeAcS8vQ4_NCJxVLTJPSMP8y-pw-aHRqpiodolCzP0ZCI6_kyp_filjI')`,
          }}
        ></div>
      </div>
    </div>
  );
}
