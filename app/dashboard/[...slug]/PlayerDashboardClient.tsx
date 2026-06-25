"use client";

import React, { useState } from "react";
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



  return (
    <div className="flex bg-[#131313] text-on-surface min-h-screen font-sora overflow-hidden">
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
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffb4ab]/50 transition-all bg-white/[0.03] backdrop-blur-md border border-white/10" style={{ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)' }}>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">videogame_asset</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">TOTAL MATCHES PLAYED</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-[#ffb4ab] glow-crimson counter">1,458</span>
                  <span className="material-symbols-outlined text-[#ffb4ab]">trending_up</span>
                </div>
              </div>
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffcb8d]/50 transition-all bg-white/[0.03] backdrop-blur-md border border-white/10" style={{ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)' }}>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">schedule</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">UPCOMING MATCHES</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-[#ffcb8d] counter">{rooms.length}</span>
                  <span className="material-symbols-outlined text-[#ffcb8d]">notifications_active</span>
                </div>
              </div>
              <div className="p-8 rounded-xl relative overflow-hidden group border-t-2 border-[#e9c400]/30 hover:border-[#e9c400]/50 transition-all bg-white/[0.03] backdrop-blur-md border border-white/10" style={{ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)' }}>
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
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#ffb4ab]/20 transition-colors bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>
              
              {rooms.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-white/20 mb-4 block">event_busy</span>
                  <h3 className="font-sora text-xl text-white/60">No Upcoming Matches</h3>
                  <p className="text-sm text-white/40 mt-2">Check back later for new tournaments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room, idx) => {
                    const filledPercentage = room.maxPlayers > 0 ? (room.playersCount / room.maxPlayers) * 100 : 0;
                    const images = [
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCO3UPQ5_q7ZVYEkxzCi1D1Ri2XlvbtZsuaPt63XBvrHhd97l4VSSaZ0stnK5LKPN68XYKGzsn-r3UAfs2JZ6a3H5l_JMiPUTCa2npAWB0DCn___J_H-ssQQCG_KQw64mqT7WPvAWX6OltquVmS4U2jcEfqW-Pu2fv3OnKatRLQaTYBx4QznWbyxBUN0bZM9g9Enf4JKPGyMDVNT4IYJKar3CMCn9dzbNsHB0HL3bMrEmykSWsy99lUmyZSXVqK-lH4cojwdjS44VU",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG38wmnvIN02SWfvT02aNkc3Ss_T1wNYbGBgmCF1ePh_UYzJkXY0DW59LqseEekOP5buRMQ5sqYauJO-9HJFAnVZtCZlXqJWly5ZgZ2_kgIru5bP0QMIDszZAe7fbismQECBJ9LlfVr8PjqOCnp0iMofoZgC2h90a_YtPbvIaORH56Lz8BlqkbUsbodZZk--gXRTOk04MS2-GAnM-G6h03xBaXnRd6i_miTQSyls47xNGK2DCndKyxRhrQ0sp-JTuvHS-UwMHBDrA",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBF0J3W9g5qRvVGSsQEgqGuKQHKVC7thYJuwfgiPjsUZb3Yyto8dVyEOskHcunIvzuvf4XNe1LMbOdSpvzj_j26EY1zLVQ4Ea0NadvupVla3unPu2RWVQgvNAbv7w74YltDrx8Z34VFM2q-qdfvh1alI4fLUUP2-YIpOHycane56grc110eIcszEeHOYNZnRVHKUTkt-LX8Nep2eFaNWbunwd1Cq6G5JHjQJt4Tg0G--T53NOrXHqe5pUhwuGbcSyEMs6bsA24Ok1Y"
                    ];
                    const imgSrc = images[idx % images.length];

                    return (
                      <div
                        key={room.roomId}
                        className={`rounded-xl overflow-hidden group hover:border-[#ffb4ab]/50 transition-all flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/10 ${idx % 2 !== 0 ? 'border-t-2 border-[#ffb4ab]/30' : ''}`}
                        style={{ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)" }}
                      >
                        <div className="relative h-48">
                          <img
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt={room.map}
                            src={imgSrc}
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
                                  {room.matchType.includes("Solo") ? "person" : room.matchType.includes("Duo") ? "group" : "groups"}
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
                            <button className="flex-1 bg-white/[0.03] backdrop-blur-md border border-white/10 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors text-[#e5e2e1]">
                              View Details
                            </button>
                            <button className="flex-1 bg-[#ff544a] text-[#5c0004] py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-[0_0_15px_#ffb4ab] transition-all">
                              Book Slot
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
