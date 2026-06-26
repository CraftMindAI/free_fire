"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import ParticleCanvas from "@/app/components/ParticleCanvas";
import { RoomData } from "@/app/components/admin/ActiveRooms";
import { useRouter, useParams } from "next/navigation";
interface MatchDetailsClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  room: RoomData;
}

export default function MatchDetailsClient({ user, room }: MatchDetailsClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const params = useParams();
  const encryptedUserId = params.userId as string;
  const encryptedRoomId = params.roomId as string;
  
  const filledPercentage = room.maxPlayers > 0 ? (room.playersCount / room.maxPlayers) * 100 : 0;
  const matchTag = room.maxPlayers === 48 ? "SOLO" : room.maxPlayers === 24 ? "DUO" : room.maxPlayers === 12 ? "SQUAD" : "CUSTOM";

  return (
    <div className="flex bg-[#131313] text-on-surface min-h-screen font-sora overflow-hidden relative">
      {/* Background with Fire Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <ParticleCanvas count={90} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#131313] z-20" />
        <img
          className="w-full h-full object-cover object-center brightness-50"
          alt="Cinematic Background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuMWIu9K9ojjXGGV5slkQjRyrZeZFeO_j89XI8miWv0JRrI7n4TVvrh68knezlnDp_i-st0zcrVduGJoBo1dikufmZ56jtWqwReXUplnd_yzrlSKeTzaTUa85ouME3ZDn0Qw20JaWBngiymQJzghy4pypFj3c1WYgEvJFw24A78YN1agjBtc_NeOpkGOhfCLG8dakRZ_UYHEMqAm3vuDWPT4JwYvJzbePYotshdpc5yU7_9bmVLuWukU_HJn4WUg2dk2OwxI5ZLp0"
        />
      </div>

      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 z-30">
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 px-4 sm:px-8 pt-24 sm:pt-28 pb-12 relative z-10 overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto relative z-10">
            
            {/* Back Button */}
            <div className="mb-6">
              <Link href={`/${encryptedUserId}/upcoming-matches`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span className="font-jetbrains text-sm font-semibold">BACK TO MATCHES</span>
                </button>
              </Link>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Image & Visuals */}
              <div className="lg:w-7/12 relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,46,46,0.15)] relative group bg-black/40 backdrop-blur-md">
                  <img
                    src={room.map_img}
                    alt={room.name}
                    className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    style={{ maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" }}
                  />
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <div className="bg-[#ffb4ab]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,180,171,0.4)]">
                      <span className="font-jetbrains text-xs text-[#5c0004] font-bold tracking-wider">{matchTag}</span>
                    </div>
                    <div className="bg-[#131313]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" style={{ boxShadow: "0 0 8px rgba(255, 180, 171, 0.6)" }}></span>
                      <span className="text-[10px] font-jetbrains text-[#e5e2e1] uppercase">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="font-sora text-4xl lg:text-5xl font-black text-white uppercase tracking-wide mb-2 drop-shadow-lg" style={{ textShadow: "0 0 10px rgba(255, 46, 46, 0.5)" }}>
                      {room.name}
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="font-jetbrains bg-[#ffb4ab] text-[#5c0004] px-3 py-1 rounded uppercase font-bold text-sm shadow-lg">{room.tier} TIER</span>
                      <span className="font-jetbrains text-sm text-[#e8bcb7] bg-black/50 px-3 py-1 rounded border border-white/10">ROOM #{room.roomId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details & Action */}
              <div className="lg:w-5/12 flex flex-col gap-6">
                
                {/* Prize & Entry Card */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb4ab]/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-6">
                    <div>
                      <p className="font-jetbrains text-xs text-[#e8bcb7] tracking-wider mb-1">TOTAL PRIZE POOL</p>
                      <h2 className="font-sora text-5xl font-bold text-[#ffb4ab]" style={{ textShadow: "0 0 15px rgba(255, 180, 171, 0.3)" }}>
                        ₹{room.prizePool}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="font-jetbrains text-xs text-white/50 mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">payments</span> ENTRY FEE</p>
                      <p className="font-sora text-2xl font-bold text-white">{room.entryFee === 0 ? "FREE" : `₹${room.entryFee}`}</p>
                    </div>
                    <div>
                      <p className="font-jetbrains text-xs text-white/50 mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">map</span> MAP</p>
                      <p className="font-sora text-2xl font-bold text-white uppercase">{room.map}</p>
                    </div>
                    <div>
                      <p className="font-jetbrains text-xs text-white/50 mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">schedule</span> DATE</p>
                      <p className="font-sora text-lg font-semibold text-[#e5e2e1]">{room.matchDate}</p>
                    </div>
                    <div>
                      <p className="font-jetbrains text-xs text-white/50 mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">timer</span> TIME</p>
                      <p className="font-sora text-lg font-semibold text-[#e5e2e1]">{room.matchTime}</p>
                    </div>
                  </div>
                </div>

                {/* Slots Card */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-sora text-lg font-bold text-white">Available Slots</h3>
                    <span className="font-jetbrains text-sm font-bold text-[#ffb4ab] bg-[#ffb4ab]/10 px-3 py-1 rounded-lg">
                      {room.maxPlayers - room.playersCount} Left
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs font-jetbrains text-[#e8bcb7] mb-2 uppercase">
                      <span>Seats Filled</span>
                      <span>{room.playersCount} / {room.maxPlayers}</span>
                    </div>
                    <div className="h-3 w-full bg-black/50 border border-white/10 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#ff544a] to-[#ffb4ab] transition-all duration-1000" style={{ width: `${filledPercentage}%`, boxShadow: "0 0 10px rgba(255,180,171,0.5)" }}></div>
                    </div>
                  </div>
                </div>

                {/* Book Action */}
                <div className="mt-auto pt-4">
                  <Link href={`/${encryptedUserId}/upcoming-matches/${encryptedRoomId}/book-now`}>
                    <button className="w-full group relative px-8 py-5 bg-[#ff544a] rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,84,74,0.3)]">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative font-sora font-bold text-xl text-[#5c0004] flex items-center justify-center gap-2 uppercase tracking-wide">
                        Book Now
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </span>
                    </button>
                  </Link>
                  <p className="text-center font-jetbrains text-xs text-white/40 mt-4">
                    By booking a slot, you agree to the tournament rules and guidelines.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
