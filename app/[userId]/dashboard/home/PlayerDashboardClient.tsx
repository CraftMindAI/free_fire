"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import { RoomData } from "@/app/components/admin/ActiveRooms";

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
  const [filterType, setFilterType] = useState<"All" | "Today" | "Tomorrow" | "Weekend">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredRooms = rooms.filter((room) => {
    if (filterType === "All") return true;
    if (!room.matchDateIso) return false;

    const matchDate = new Date(room.matchDateIso);
    const today = new Date();

    if (filterType === "Today") {
      return (
        matchDate.getDate() === today.getDate() &&
        matchDate.getMonth() === today.getMonth() &&
        matchDate.getFullYear() === today.getFullYear()
      );
    }

    if (filterType === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return (
        matchDate.getDate() === tomorrow.getDate() &&
        matchDate.getMonth() === tomorrow.getMonth() &&
        matchDate.getFullYear() === tomorrow.getFullYear()
      );
    }

    if (filterType === "Weekend") {
      const day = matchDate.getDay();
      return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    }

    return true;
  });



  return (
    <div className="flex bg-transparent text-on-surface min-h-screen font-sora overflow-hidden">
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

        <main className="flex-1 px-4 sm:px-8 pt-24 sm:pt-28 pb-12 relative z-10 overflow-x-hidden">
          <div className="max-w-[1440px] mx-auto relative z-10">
            {/* Hero Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffb4ab]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">videogame_asset</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">TOTAL MATCHES PLAYED</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-[#ffb4ab] glow-crimson counter">1,458</span>
                  <span className="material-symbols-outlined text-[#ffb4ab]">trending_up</span>
                </div>
              </div>
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffcb8d]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">schedule</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">UPCOMING MATCHES</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-[#ffcb8d] counter">{rooms.length}</span>
                  <span className="material-symbols-outlined text-[#ffcb8d]">notifications_active</span>
                </div>
              </div>
              <div className="p-8 rounded-xl relative overflow-hidden group border-t-2 border-[#e9c400]/30 hover:border-[#e9c400]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">payments</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">TOTAL PRIZE WON</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-sora font-bold text-[#e9c400]">$</span>
                  <span className="font-sora text-4xl font-bold text-[#e9c400] counter">25,400</span>
                </div>
              </div>
            </section>

            {/* Upcoming Matches Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-sora text-2xl font-bold text-[#e5e2e1] flex items-center gap-3">
                  <span className="w-2 h-8 bg-[#ffb4ab] rounded-full"></span>
                  Upcoming Matches
                </h2>
                <div className="relative flex gap-2">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="p-2 rounded-lg hover:bg-[#ffb4ab]/20 transition-colors bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center gap-2 px-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    <span className="text-sm font-jetbrains">{filterType}</span>
                  </button>
                  
                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 font-jetbrains text-sm">
                      <button
                        onClick={() => { setFilterType("All"); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${filterType === "All" ? "text-[#ffb4ab]" : "text-white/70"}`}
                      >
                        All Matches
                      </button>
                      <button
                        onClick={() => { setFilterType("Today"); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${filterType === "Today" ? "text-[#ffb4ab]" : "text-white/70"}`}
                      >
                        Today's Match
                      </button>
                      <button
                        onClick={() => { setFilterType("Tomorrow"); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${filterType === "Tomorrow" ? "text-[#ffb4ab]" : "text-white/70"}`}
                      >
                        Tomorrow's Match
                      </button>
                      <button
                        onClick={() => { setFilterType("Weekend"); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${filterType === "Weekend" ? "text-[#ffb4ab]" : "text-white/70"}`}
                      >
                        Weekend Match
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {filteredRooms.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-white/20 mb-4 block">event_busy</span>
                  <h3 className="font-sora text-xl text-white/60">No Upcoming Matches</h3>
                  <p className="text-sm text-white/40 mt-2">Check back later for new tournaments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.slice(0, 3).map((room, idx) => {
                    const filledPercentage = room.maxPlayers > 0 ? (room.playersCount / room.maxPlayers) * 100 : 0;
                    const matchTag = room.maxPlayers === 48 ? "Solo" : room.maxPlayers === 24 ? "Duo" : room.maxPlayers === 12 ? "Squad" : "CUSTOM";
                    

                    return (
                      <div
                        key={room.roomId}
                        className={`rounded-xl overflow-hidden group hover:border-[#ffb4ab]/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,180,171,0.15)] transition-all duration-300 flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/10 ${idx % 2 !== 0 ? 'border-t-2 border-[#ffb4ab]/30' : ''}`}
                      >
                        <div className="relative h-40 w-full">
                          <img
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                            alt={room.map}
                            src={room.map_img}
                          />
                          <div className="absolute top-4 left-4 bg-[#131313]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <span className="font-jetbrains text-[10px] text-[#ffb4ab]">MAP: {room.map.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-sora text-xl font-bold mb-1 text-[#e5e2e1]">{room.name}</h3>
                              <p className="text-sm text-[#e8bcb7] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  {matchTag.includes("Solo") ? "person" : matchTag.includes("Duo") ? "group" : "groups"}
                                </span>{" "}
                                {room.matchType}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-sora font-bold text-[#ffb4ab]">₹{room.prizePool}</p>
                              <p className="font-jetbrains text-[10px] text-[#e8bcb7]">PRIZE POOL</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                              <p className="text-[10px] text-[#e8bcb7] font-jetbrains mb-1">DATE &amp; TIME</p>
                              <p className="text-sm font-semibold text-[#e5e2e1]">{room.matchDate} • {room.matchTime}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                              <p className="text-[10px] text-[#e8bcb7] font-jetbrains mb-1">ENTRY FEE</p>
                              <p className="text-sm font-semibold text-[#e5e2e1]">{room.entryFee === 0 ? "FREE" : `₹${room.entryFee}`}</p>
                            </div>
                          </div>
                          <div className="mb-6 mt-auto">
                            <div className="flex justify-between text-xs font-jetbrains text-[#e8bcb7] mb-2">
                              <span>SEATS FILLED</span>
                              <span className="text-[#ffb4ab]">{room.playersCount} / {room.maxPlayers}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#ffb4ab] rounded-full transition-all duration-500" style={{ width: `${filledPercentage}%` }}></div>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-auto">
                                <Link
                                  href={`/${user.id}/upcoming-matches/${room.encryptedRoomId || room.roomId}/view`}
                                  className="flex-1 bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white font-sora font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                  View Details
                                </Link>
                            <Link
                              href={`/${user.id}/upcoming-matches/${room.encryptedRoomId || room.roomId}/book-now`}
                              className="flex-1"
                            >
                              <button className="w-full h-full bg-[#ff544a] text-[#5c0004] py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-[0_0_15px_#ffb4ab] transition-all">
                                Book Slot
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Pagination / Load More */}
              <div className="mt-12 flex justify-center">
                <Link href={`/${user.id}/upcoming-matches`}>
                  <button className="group relative px-8 py-4 bg-background border-2 border-[#ffb4ab] rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 bg-[#ffb4ab]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative font-bold text-[#ffb4ab] flex items-center gap-2">
                      LOAD MORE TOURNAMENTS
                      <span className="material-symbols-outlined">expand_more</span>
                    </span>
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]"></div>
        <img
          className="w-full h-full object-cover"
          alt="Cinematic Background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuMWIu9K9ojjXGGV5slkQjRyrZeZFeO_j89XI8miWv0JRrI7n4TVvrh68knezlnDp_i-st0zcrVduGJoBo1dikufmZ56jtWqwReXUplnd_yzrlSKeTzaTUa85ouME3ZDn0Qw20JaWBngiymQJzghy4pypFj3c1WYgEvJFw24A78YN1agjBtc_NeOpkGOhfCLG8dakRZ_UYHEMqAm3vuDWPT4JwYvJzbePYotshdpc5yU7_9bmVLuWukU_HJn4WUg2dk2OwxI5ZLp0"
        />
      </div>
    </div>
  );
}
