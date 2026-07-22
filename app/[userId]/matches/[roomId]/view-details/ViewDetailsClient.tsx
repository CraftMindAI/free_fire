"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import ParticleCanvas from "@/app/components/ParticleCanvas";
import { RoomData } from "@/app/components/admin/ActiveRooms";
import { useRouter } from "next/navigation";

interface ViewDetailsClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  room: RoomData;
  bookedSeats: number[];
}

export default function ViewDetailsClient({ user, room, bookedSeats }: ViewDetailsClientProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [countdown, setCountdown] = useState("00:00:00");

  const isDuo = room.matchType?.toLowerCase() === "duo";
  const isSquad = room.matchType?.toLowerCase() === "squad";

  useEffect(() => {
    if (!room.matchDateIso) return;
    
    const interval = setInterval(() => {
      const targetTime = new Date(room.matchDateIso!).getTime();
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown("00:00:00");
        return;
      }

      const h = Math.floor(distance / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [room.matchDateIso]);

  return (
    <div className="flex bg-[#000] text-[#e5e2e1] min-h-screen font-sora overflow-hidden relative">
      {/* Cinematic Background prefered */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#131313]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]"></div>
        <img
          className="w-full h-full object-cover"
          alt="Cinematic Background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuMWIu9K9ojjXGGV5slkQjRyrZeZFeO_j89XI8miWv0JRrI7n4TVvrh68knezlnDp_i-st0zcrVduGJoBo1dikufmZ56jtWqwReXUplnd_yzrlSKeTzaTUa85ouME3ZDn0Qw20JaWBngiymQJzghy4pypFj3c1WYgEvJFw24A78YN1agjBtc_NeOpkGOhfCLG8dakRZ_UYHEMqAm3vuDWPT4JwYvJzbePYotshdpc5yU7_9bmVLuWukU_HJn4WUg2dk2OwxI5ZLp0"
        />
      </div>

      {/* Fire Canvas */}
      <ParticleCanvas count={90} />

      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        <Header
          role={user.role}
          userName={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="pt-[100px] pb-12 w-full max-w-[1440px] mx-auto z-10 relative px-4 sm:px-8">
          {/* Glassmorphism Header */}
          <section className="relative w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-[24px] shadow-[0_10px_40px_rgba(255,46,46,0.1)] p-8 md:p-12 mb-8 overflow-hidden">
            {/* Subtle internal glow */}
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-[#ffb4ab]/5 blur-[100px] pointer-events-none rounded-full"></div>
            
            <div className="relative z-20 flex flex-col">
              
              {/* Back Button */}
              <div className="mb-8">
                <Link href={`/${user.id}/matches`}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all backdrop-blur-md w-fit cursor-pointer">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="font-jetbrains text-sm font-semibold">BACK TO MATCHES</span>
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] font-jetbrains text-[12px] font-semibold tracking-widest rounded-sm">
                      ROOM ID: #{room.roomId}
                    </span>
                    <span className="px-3 py-1 bg-[#e9c400]/10 border border-[#e9c400]/30 text-[#e9c400] font-jetbrains text-[12px] font-semibold tracking-widest rounded-sm">
                      MAP: {room.name.toUpperCase()}
                    </span>
                  </div>
                  <h1 className="font-sora text-[40px] lg:text-[56px] font-extrabold uppercase tracking-tight text-white mb-6 leading-none drop-shadow-lg">
                    {room.name} Match
                  </h1>
                  
                  <div className="flex flex-wrap gap-6 md:gap-10 text-[#e8bcb7]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">person</span>
                      </div>
                      <div>
                        <p className="font-jetbrains text-[10px] text-white/50 tracking-widest font-bold mb-1">MODE</p>
                        <span className="font-sora text-[15px] font-bold text-white tracking-wide">{room.matchType?.toUpperCase() || "SOLO"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">payments</span>
                      </div>
                      <div>
                        <p className="font-jetbrains text-[10px] text-white/50 tracking-widest font-bold mb-1">ENTRY FEE</p>
                        <span className="font-sora text-[15px] font-bold text-white tracking-wide">{room.entryFee === 0 ? "FREE" : `₹${room.entryFee}`}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#e9c400] text-[20px]">emoji_events</span>
                      </div>
                      <div>
                        <p className="font-jetbrains text-[10px] text-white/50 tracking-widest font-bold mb-1">PRIZE POOL</p>
                        <span className="font-sora text-[15px] font-bold text-[#e9c400] tracking-wide">₹{room.prizePool}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4 lg:gap-6 justify-end items-stretch sm:items-center">
                  {room.map_img && (
                    <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg aspect-[16/9] w-full sm:w-[200px] lg:w-[240px] shrink-0">
                      <img 
                        src={room.map_img} 
                        alt={room.name} 
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="font-jetbrains text-[10px] tracking-widest text-[#ffb4ab] font-bold bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 px-2 py-0.5 rounded uppercase">
                          BATTLEFIELD
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/[0.03] backdrop-blur-[12px] border border-[#ffb4ab]/30 p-6 rounded-xl border-l-4 flex-1">
                    <div className="text-[#e8bcb7] font-jetbrains text-xs tracking-widest mb-1 font-semibold">STARTS IN</div>
                    <div className="font-sora font-bold text-[32px] text-[#ffb4ab] tracking-widest drop-shadow-[0_0_15px_rgba(255,46,46,0.4)]">
                      {countdown}
                    </div>
                    <div className="text-[#e8bcb7] font-sora text-[16px] mt-1">
                      {room.matchDate} • {room.matchTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side: Seat Selection (Read Only) */}
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 p-8 rounded-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h2 className="font-sora text-[32px] font-bold text-white leading-tight font-sora">Seat Status</h2>
                    <p className="text-[#e8bcb7] font-sora text-[16px]">Visual representation of booked positions on the battlefield.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
                      <span className="text-xs font-jetbrains font-semibold tracking-widest">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                      <span className="text-xs font-jetbrains font-semibold tracking-widest">Booked</span>
                    </div>
                  </div>
                </div>

                {/* Seat Grid */}
                {isSquad ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 p-6 sm:p-8 bg-black/40 rounded-lg border border-white/5 relative mx-auto overflow-x-auto min-w-[400px]">
                    {Array.from({ length: 12 }, (_, i) => i * 4 + 1).map((firstSeat) => {
                      const squad = [firstSeat, firstSeat + 1, firstSeat + 2, firstSeat + 3];
                      return (
                        <div key={`squad-${firstSeat}`} className="flex flex-wrap sm:flex-nowrap gap-1 p-1.5 bg-white/5 rounded-md border border-white/10 hover:border-white/20 transition-colors">
                          {squad.map(seat => {
                            if (seat > 48) return null;
                            const isBooked = bookedSeats.includes(seat);
                            const bgClass = isBooked 
                              ? "bg-[#ef4444] text-white shadow-[0_0_8px_rgba(239,68,68,0.4)] cursor-not-allowed" 
                              : "bg-[#4ade80] text-[#131313] cursor-not-allowed opacity-60";
                            return (
                              <div 
                                key={seat}
                                className={`flex-1 aspect-square min-w-[24px] rounded flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold transition-all duration-300 ${bgClass}`}
                              >
                                {seat < 10 ? `0${seat}` : seat}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : isDuo ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-6 gap-y-4 p-6 sm:p-8 bg-black/40 rounded-lg border border-white/5 relative mx-auto overflow-x-auto min-w-[400px]">
                    {Array.from({ length: 24 }, (_, i) => i * 2 + 1).map((firstSeatInPair) => {
                      const pair = [firstSeatInPair, firstSeatInPair + 1];
                      return (
                        <div key={`pair-${firstSeatInPair}`} className="flex gap-1 p-1.5 bg-white/5 rounded-md border border-white/10 hover:border-white/20 transition-colors">
                          {pair.map(seat => {
                            if (seat > 48) return null;
                            const isBooked = bookedSeats.includes(seat);
                            const bgClass = isBooked 
                              ? "bg-[#ef4444] text-white shadow-[0_0_8px_rgba(239,68,68,0.4)] cursor-not-allowed" 
                              : "bg-[#4ade80] text-[#131313] cursor-not-allowed opacity-60";
                            return (
                              <div 
                                key={seat}
                                className={`flex-1 aspect-square min-w-[24px] rounded flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold transition-all duration-300 ${bgClass}`}
                              >
                                {seat < 10 ? `0${seat}` : seat}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 p-6 sm:p-8 bg-black/40 rounded-lg border border-white/5 relative mx-auto overflow-x-auto min-w-[300px]">
                    {Array.from({ length: room.maxPlayers || 48 }, (_, i) => i + 1).map((seat) => {
                      const isBooked = bookedSeats.includes(seat);
                      const bgClass = isBooked 
                        ? "bg-[#ef4444] text-white shadow-[0_0_8px_rgba(239,68,68,0.4)] cursor-not-allowed" 
                        : "bg-[#4ade80] text-[#131313] cursor-not-allowed opacity-60";

                      return (
                        <div 
                          key={seat}
                          className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold transition-all duration-300 ${bgClass}`}
                        >
                          {seat < 10 ? `0${seat}` : seat}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Side: Info Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 p-8 rounded-xl border-t-2 border-t-[#ffb4ab]">
                <h2 className="font-sora text-[24px] font-semibold text-white mb-6 flex items-center gap-2 font-sora">
                  <span className="material-symbols-outlined text-[#ffb4ab]">info</span>
                  Arena Statistics
                </h2>
                <div className="space-y-6 text-[#e8bcb7] font-jetbrains text-sm">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span>Total Seats:</span>
                    <span className="text-white font-bold">
                      {isSquad ? 12 : isDuo ? 24 : 48}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span>Booked Seats:</span>
                    <span className="text-[#ffb4ab] font-bold">
                      {isSquad 
                        ? Math.floor(bookedSeats.length / 4) 
                        : isDuo 
                          ? Math.floor(bookedSeats.length / 2)
                          : bookedSeats.length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span>Available Seats:</span>
                    <span className="text-[#4ade80] font-bold">
                      {isSquad 
                        ? 12 - Math.floor(bookedSeats.length / 4) 
                        : isDuo 
                          ? 24 - Math.floor(bookedSeats.length / 2)
                          : (room.maxPlayers || 48) - bookedSeats.length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span>Fill Rate:</span>
                    <span className="text-[#ffcb8d] font-bold">
                      {isSquad 
                        ? `${Math.round((Math.floor(bookedSeats.length / 4) / 12) * 100)}%` 
                        : isDuo 
                          ? `${Math.round((Math.floor(bookedSeats.length / 2) / 24) * 100)}%`
                          : `${Math.round((bookedSeats.length / 48) * 100)}%`
                      }
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 p-8 rounded-xl border-t-2 border-t-[#ffb4ab]">
                <h2 className="font-sora text-[24px] font-semibold text-white mb-6 flex items-center gap-2 font-sora">
                  <span className="material-symbols-outlined text-[#ffb4ab]">gavel</span>
                  Rules & Guidelines
                </h2>
                <ul className="space-y-4 text-[#e8bcb7]">
                  <li className="flex gap-3">
                    <span className="text-[#ffb4ab] font-bold">01</span>
                    <p className="font-sora text-[16px]">Ensure your game version is updated before joining the lobby.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffb4ab] font-bold">02</span>
                    <p className="font-sora text-[16px]">Cheating or using emulators will result in a permanent ban.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffb4ab] font-bold">03</span>
                    <p className="font-sora text-[16px]">Join the custom room at least 10 minutes prior to start time.</p>
                  </li>
                </ul>
              </section>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
