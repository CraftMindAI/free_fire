"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import { RoomData } from "@/app/components/admin/ActiveRooms";

interface UpcomingMatchesClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  initialRooms: RoomData[];
}

export default function UpcomingMatchesClient({
  user,
  initialRooms,
}: UpcomingMatchesClientProps) {
  const [rooms] = useState<RoomData[]>(initialRooms);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapFilter, setMapFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [entryFilter, setEntryFilter] = useState("All");

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.roomId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMap = mapFilter === "All" || room.map === mapFilter;
    
    let matchesEntry = true;
    if (entryFilter === "Free") matchesEntry = !room.entryFee || room.entryFee === 0;
    else if (entryFilter === "Paid") matchesEntry = (room.entryFee || 0) > 0;

    let matchesType = true;
    if (typeFilter === "Solo") matchesType = room.maxPlayers === 48;
    else if (typeFilter === "Duo") matchesType = room.maxPlayers === 24;
    else if (typeFilter === "Squad") matchesType = room.maxPlayers === 12;
    
    return matchesSearch && matchesMap && matchesEntry && matchesType;
  });

  // Get unique maps for filter
  const uniqueMaps = ["All", ...Array.from(new Set(rooms.map(r => r.map)))];

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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="font-sora text-4xl lg:text-5xl font-extrabold text-[#e5e2e1] tracking-tight mb-2">Upcoming Matches</h1>
                <p className="text-[#e8bcb7] font-sora text-lg">Compete in high-stakes arenas and dominate the leaderboard.</p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl transition-all">
              <div className="flex-1 min-w-[200px] relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ffb4ab]">search</span>
                <input 
                  type="text" 
                  placeholder="Search by Room ID or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#131313]/50 border-0 border-b-2 border-white/10 focus:border-[#ffb4ab] focus:ring-0 pl-10 py-3 text-sm transition-all text-white placeholder-white/40"
                />
              </div>
              <select 
                value={mapFilter}
                onChange={(e) => setMapFilter(e.target.value)}
                className="bg-[#131313]/50 border-0 border-b-2 border-white/10 focus:border-[#ffb4ab] focus:ring-0 py-3 text-sm rounded-lg min-w-[120px] text-white"
              >
                {uniqueMaps.map(map => (
                  <option key={map} value={map}>{map}</option>
                ))}
              </select>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#131313]/50 border-0 border-b-2 border-white/10 focus:border-[#ffb4ab] focus:ring-0 py-3 text-sm rounded-lg min-w-[140px] text-white"
              >
                <option value="All">Type: All</option>
                <option value="Solo">Solo</option>
                <option value="Duo">Duo</option>
                <option value="Squad">Squad</option>
              </select>
              <select 
                value={entryFilter}
                onChange={(e) => setEntryFilter(e.target.value)}
                className="bg-[#131313]/50 border-0 border-b-2 border-white/10 focus:border-[#ffb4ab] focus:ring-0 py-3 text-sm rounded-lg min-w-[120px] text-white"
              >
                <option value="All">Entry: All</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
              <button className="bg-[#353534] hover:bg-[#ffb4ab] hover:text-[#5c0004] transition-all p-3 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>

            {/* Matches Grid */}
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-4 block">event_busy</span>
                <h3 className="font-sora text-xl text-white/60">No Matches Found</h3>
                <p className="text-sm text-white/40 mt-2">Adjust your filters or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => {
                  let playersPerTeam = 1;
                  let label = "Seats Filled";
                  if (room.maxPlayers === 24) {
                    playersPerTeam = 2;
                    label = "Duos Filled";
                  } else if (room.maxPlayers === 12) {
                    playersPerTeam = 4;
                    label = "Squads Filled";
                  } else if (room.maxPlayers === 48) {
                    playersPerTeam = 1;
                    label = "Solos Filled";
                  }

                  const displayCount = Math.floor(room.playersCount / playersPerTeam);
                  const filledPercentage = room.maxPlayers > 0 ? (displayCount / room.maxPlayers) * 100 : 0;
                  const matchTag = room.maxPlayers === 48 ? "SOLO" : room.maxPlayers === 24 ? "DUO" : room.maxPlayers === 12 ? "SQUAD" : "CUSTOM";

                  return (
                    <div
                      key={room.roomId}
                      className="rounded-2xl overflow-hidden group hover:border-[#ffb4ab]/50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,46,46,0.2)] transition-all duration-300 flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/10 relative"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                          alt={room.map}
                          src={room.map_img}
                          style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}
                        />
                        <div className="absolute top-4 left-4 bg-[#131313]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" style={{ boxShadow: "0 0 8px rgba(255, 180, 171, 0.6)" }}></span>
                          <span className="text-[10px] font-jetbrains text-[#e5e2e1] uppercase">OPEN</span>
                        </div>
                        
                        <div className="absolute bottom-4 left-4">
                          <span className="text-xs font-jetbrains bg-[#ffb4ab] text-[#5c0004] px-2 py-1 rounded uppercase font-bold">{room.tier} TIER</span>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-[#131313]/90 px-3 py-1 rounded-lg border border-white/10">
                          <span className="text-xs font-jetbrains text-[#e8bcb7]">ROOM: </span>
                          <span className="text-xs font-bold text-[#ffb4ab]">#{room.roomId}</span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-sora text-xl font-bold mb-1 text-[#e5e2e1] uppercase">{room.name}</h3>
                            <p className="text-xs font-jetbrains text-[#ffcb8d] uppercase">{room.matchType}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-jetbrains text-[#e8bcb7] uppercase">Prize Pool</span>
                            <span className="text-xl font-sora font-bold text-[#ffb4ab]">₹{room.prizePool}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] text-[#e8bcb7] font-jetbrains uppercase block mb-1">Entry Fee</span>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#ffcb8d] text-lg">payments</span>
                              <span className="font-bold text-[#e5e2e1]">{room.entryFee === 0 ? "FREE" : `₹${room.entryFee}`}</span>
                            </div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] text-[#e8bcb7] font-jetbrains uppercase block mb-1">Date & Time</span>
                            <div className="flex items-center gap-2 text-[#ffb4ab]">
                              <span className="material-symbols-outlined text-lg">schedule</span>
                              <span className="font-bold text-sm">{room.matchDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6 mt-auto">
                          <div className="flex justify-between text-[10px] font-jetbrains text-[#e8bcb7] mb-1 uppercase">
                            <span>{label}</span>
                            <span>{displayCount}/{room.maxPlayers}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ffb4ab] transition-all duration-500" style={{ width: `${filledPercentage}%` }}></div>
                          </div>
                        </div>

                        {/* Updated Buttons as requested by User */}
                        <div className="flex gap-3 mt-auto">
                          <Link href={`/profile/v1/${user.id}/upcoming-matches/${(room as any).encryptedRoomId || room.roomId}/view`} className="flex-1">
                            <button className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors text-[#e5e2e1]">
                              View Details
                            </button>
                          </Link>
                          <Link
                            href={`/profile/v1/${user.id}/upcoming-matches/${(room as any).encryptedRoomId || room.roomId}/book-now`}
                            className="flex-1"
                          >
                            <button className="w-full h-full bg-[#ff544a] text-[#5c0004] py-3 rounded-lg text-sm font-bold shadow-lg hover:shadow-[0_0_15px_#ffb4ab] transition-all">
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
