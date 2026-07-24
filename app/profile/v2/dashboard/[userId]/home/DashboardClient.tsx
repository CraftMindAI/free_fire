"use client";

import React, { useState } from "react";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import StatsCards from "@/app/components/admin/StatsCards";
import ActiveRooms, { RoomData } from "@/app/components/admin/ActiveRooms";
import RoomControl from "@/app/components/admin/RoomControl";
import ParticleCanvas from "@/app/components/ParticleCanvas";

interface DashboardClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  initialStats: {
    activeRooms: number;
    playerCount: number;
    totalReceived: string;
    totalPrizePaid: string;
  };
  initialRooms: RoomData[];
  encryptedUserId: string;
}

export default function DashboardClient({
  user,
  initialStats,
  initialRooms,
  encryptedUserId,
}: DashboardClientProps) {
  const [stats, setStats] = useState(initialStats);
  const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUpdatedData = async () => {
    try {
      const [statsRes, roomsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/rooms")
      ]);

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
    <div className="flex bg-transparent text-on-surface min-h-screen font-sora overflow-hidden relative">
      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 px-8 pt-28 pb-12 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h1 className="font-sora text-3xl md:text-4xl font-bold text-[#e5e2e1] flex items-center gap-3">
                <span className="w-2.5 h-9 bg-[#ffb4ab] rounded-full"></span>
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
              userId={encryptedUserId}
              onPublish={handlePublishRoom}
              onDelete={handleDeleteRoom}
            />
          </div>
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#131313]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]"></div>
        <img
          className="w-full h-full object-cover"
          alt="Cinematic Background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuMWIu9K9ojjXGGV5slkQjRyrZeZFeO_j89XI8miWv0JRrI7n4TVvrh68knezlnDp_i-st0zcrVduGJoBo1dikufmZ56jtWqwReXUplnd_yzrlSKeTzaTUa85ouME3ZDn0Qw20JaWBngiymQJzghy4pypFj3c1WYgEvJFw24A78YN1agjBtc_NeOpkGOhfCLG8dakRZ_UYHEMqAm3vuDWPT4JwYvJzbePYotshdpc5yU7_9bmVLuWukU_HJn4WUg2dk2OwxI5ZLp0"
        />
      </div>
      <ParticleCanvas count={90} />
    </div>
  );
}
