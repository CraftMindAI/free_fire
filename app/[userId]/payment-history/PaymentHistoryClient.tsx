"use client";

import React, { useState, useMemo } from 'react';
import Image from "next/image";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import ParticleCanvas from "@/app/components/ParticleCanvas";

type PaymentData = {
  id: number;
  userId: number;
  username: string;
  amount: number;
  prizeAmount: number;
  status: string;
  distributionStatus: string;
  createdAt: string;
  room: {
    id: number;
    roomName: string;
    match_type: string;
    total_price: number;
    entry_fee: number;
  };
};

export default function PaymentHistoryClient({
  initialPayments,
  user
}: {
  initialPayments: PaymentData[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [roomFilter, setRoomFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const rooms = useMemo(() => {
    const map = new Map<number, string>();
    initialPayments.forEach((p) => map.set(p.room.id, p.room.roomName));
    return Array.from(map.entries()).map(([id, roomName]) => ({ id, roomName }));
  }, [initialPayments]);

  const filteredPayments = useMemo(() => {
    let result = initialPayments;

    // Room filter
    if (roomFilter !== "ALL") {
      result = result.filter((p) => String(p.room.id) === roomFilter);
    }

    // Status filter (based on distributionStatus)
    if (statusFilter !== "ALL") {
      result = result.filter(
        (p) => (p.distributionStatus || "pending").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.room.roomName.toLowerCase().includes(q) ||
        `#RM-${p.room.id}`.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialPayments, roomFilter, statusFilter, searchQuery]);

  const totalReceived = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [filteredPayments]);

  const totalPaidOut = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (p.prizeAmount || 0), 0);
  }, [filteredPayments]);

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

        <main className="flex-1 flex flex-col overflow-y-auto relative z-10 font-body-md px-4 md:px-12 pt-28 pb-12 w-full">
          <div className="space-y-6 max-w-[1440px] mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
              <div>
                <h1 className="font-orbitron text-3xl md:text-4xl text-on-surface font-extrabold tracking-tight uppercase orbitron-header">
                  PAYMENT HISTORY
                </h1>
                <p className="text-on-surface-variant font-sora text-sm mt-2 max-w-xl">
                  Review every entry fee collected and every prize distributed, filtered by room.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-[18px] text-[#ffb4ab]">sports_esports</span>
                  <select
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    className="bg-transparent text-[11px] font-jetbrains font-bold tracking-widest outline-none text-on-surface focus:ring-0"
                  >
                    <option value="ALL" className="bg-[#131313]">ALL ROOMS</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={String(r.id)} className="bg-[#131313]">
                        #RM-{r.id} — {r.roomName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Received */}
              <div className="p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-[#ffb4ab]/60 shadow-[0_0_40px_rgba(255,46,46,0.08)] hover:shadow-[0_0_50px_rgba(255,46,46,0.2)]">
                {/* Scoped Fire Particle Animation */}
                <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
                  <ParticleCanvas count={30} />
                </div>

                {/* Profile Image Overlay: Matched to Dashboard Card Image Size */}
                <div className="absolute right-0 top-0 bottom-0 w-1/4 max-w-[160px] opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                  <Image
                    src="/assets/profiles/Pic7.png"
                    alt="Total Amount Received"
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
                </div>

                {/* Ambient Fire Glow Overlay */}
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#ff2e2e]/20 via-[#ff544a]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

                <div className="relative z-20 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(255,180,171,0.2)] shrink-0">
                    <span className="material-symbols-outlined text-[32px]">payments</span>
                  </div>
                  <div>
                    <p className="text-[#e8bcb7] font-jetbrains text-[10px] tracking-widest font-bold mb-1 uppercase">TOTAL AMOUNT RECEIVED</p>
                    <h3 className="font-sora text-4xl font-extrabold text-on-surface neon-red">₹{totalReceived.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              {/* Total Paid Out */}
              <div className="p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-[#ffcb8d]/60 shadow-[0_0_40px_rgba(255,46,46,0.08)] hover:shadow-[0_0_50px_rgba(255,46,46,0.2)]">
                {/* Scoped Fire Particle Animation */}
                <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
                  <ParticleCanvas count={30} />
                </div>

                {/* Profile Image Overlay: Matched to Dashboard Card Image Size */}
                <div className="absolute right-0 top-0 bottom-0 w-1/4 max-w-[160px] opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                  <Image
                    src="/assets/profiles/Pic8.png"
                    alt="Total Amount Paid"
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
                </div>

                {/* Ambient Fire Glow Overlay */}
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#ff2e2e]/20 via-[#ff544a]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

                <div className="relative z-20 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#ffcb8d]/10 border border-[#ffcb8d]/30 flex items-center justify-center text-[#ffcb8d] group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(255,203,141,0.2)] shrink-0">
                    <span className="material-symbols-outlined text-[32px]">trophy</span>
                  </div>
                  <div>
                    <p className="text-[#e8bcb7] font-jetbrains text-[10px] tracking-widest font-bold mb-1 uppercase">TOTAL AMOUNT PAID</p>
                    <h3 className="font-sora text-4xl font-extrabold text-[#ffcb8d] neon-red">₹{totalPaidOut.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table Container */}
            <div className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-xl overflow-hidden mt-8 mb-12">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h4 className="font-sora text-[24px] font-semibold text-on-surface">Transactions</h4>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e8bcb7] text-[18px]">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search room or player..."
                      className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-[12px] focus:border-[#ffb4ab] outline-none transition-all w-56 text-on-surface placeholder:text-[#e8bcb7]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-jetbrains font-bold tracking-widest text-[#e8bcb7] opacity-60">STATUS:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-[11px] font-jetbrains font-bold tracking-widest outline-none text-on-surface focus:border-[#ffb4ab]"
                    >
                      <option value="ALL" className="bg-[#131313]">ALL</option>
                      <option value="Success" className="bg-[#131313]">SUCCESS</option>
                      <option value="Error" className="bg-[#131313]">ERROR</option>
                      <option value="pending" className="bg-[#131313]">PENDING</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">ROOM ID</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">MATCH</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">PLAYER</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">TYPE</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">AMOUNT RECEIVED</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">PRIZE POOL</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">AMOUNT PAID</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">STATUS</th>
                      <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-[#e8bcb7] opacity-60 font-sora">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map(payment => {
                        const normalizedStatus = (payment.distributionStatus || "pending").toLowerCase();
                        const isSuccess = normalizedStatus === "success";
                        const isError = normalizedStatus === "error";

                        return (
                          <tr key={payment.id} className="hover:bg-[#ffb4ab]/5 transition-colors">
                            <td className="p-4 font-jetbrains text-[11px] font-bold text-on-surface whitespace-nowrap">#RM-{payment.room.id}</td>
                            <td className="p-4 font-sora font-bold text-sm text-on-surface whitespace-nowrap">{payment.room.roomName}</td>
                            <td className="p-4 font-sora text-sm text-on-surface-variant whitespace-nowrap">{payment.username}</td>
                            <td className="p-4 font-jetbrains text-[11px] text-[#e8bcb7] uppercase">{payment.room.match_type}</td>
                            <td className="p-4 font-sora font-bold text-[#ffb4ab]">₹{payment.amount}</td>
                            <td className="p-4 font-sora font-bold text-on-surface/60">₹{payment.room.total_price}</td>
                            <td className="p-4 font-sora font-bold text-[#ffb95c]">₹{payment.prizeAmount}</td>
                            <td className="p-4">
                              {isSuccess ? (
                                <span className="px-3 py-1 rounded-full border border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa] text-[10px] font-jetbrains font-bold tracking-widest shadow-[0_0_15px_rgba(96,165,250,0.5)]">SUCCESS</span>
                              ) : isError ? (
                                <span className="px-3 py-1 rounded-full border border-[#ff2e2e]/30 bg-[#ff2e2e]/10 text-[#ff2e2e] text-[10px] font-jetbrains font-bold tracking-widest shadow-[0_0_15px_rgba(255,46,46,0.5)]">ERROR</span>
                              ) : (
                                <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-on-surface/60 text-[10px] font-jetbrains font-bold tracking-widest">PENDING</span>
                              )}
                            </td>
                            <td className="p-4 font-jetbrains text-[11px] text-[#e8bcb7] opacity-60 whitespace-nowrap">
                              {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
