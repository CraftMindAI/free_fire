"use client";

import React, { useState } from "react";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import StatsCards from "@/app/components/admin/StatsCards";
import ActiveRooms, { RoomData } from "@/app/components/admin/ActiveRooms";
import RoomControl from "@/app/components/admin/RoomControl";

interface DashboardClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
  };
  initialStats: {
    activeRooms: number;
    playerCount: number;
    totalReceived: string;
    totalPrizePaid: string;
  };
  initialRooms: RoomData[];
}

export default function DashboardClient({
  user,
  initialStats,
  initialRooms,
}: DashboardClientProps) {
  const [stats, setStats] = useState(initialStats);
  const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUpdatedData = async () => {
    try {
      const statsRes = await fetch("/api/stats");
      const roomsRes = await fetch("/api/rooms");

      if (statsRes.ok && roomsRes.ok) {
        const statsData = await statsRes.json();
        const roomsData = await roomsRes.json();

        setStats(statsData.stats);
        setRooms(roomsData.rooms);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  const handlePublishRoom = async (roomId: string) => {
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, action: "publish" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish room");
      }

      await fetchUpdatedData();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      throw err;
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, action: "delete" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete room");
      }

      await fetchUpdatedData();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      throw err;
    }
  };

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
        />

        <main className="flex-1 px-8 pt-28 pb-12 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h1 className="font-orbitron text-3xl md:text-4xl font-extrabold text-on-surface uppercase tracking-tight orbitron-header">
                System Terminal
              </h1>
              <p className="text-on-surface-variant font-sora text-sm mt-1">
                Real-time engagement and operational oversight.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#ffb4ab] font-jetbrains text-xs tracking-wider uppercase bg-[#ffb4ab]/5 px-3 py-1.5 rounded-full border border-[#ffb4ab]/10 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
              SYSTEMS OPERATIONAL
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm font-sora">
              {error}
            </div>
          )}

          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            <ActiveRooms rooms={rooms} />

            <RoomControl
              rooms={rooms}
              onPublish={handlePublishRoom}
              onDelete={handleDeleteRoom}
            />
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
