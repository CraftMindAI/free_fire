"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";

type PaymentData = {
  id: number;
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
  const [dateRange, setDateRange] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = useMemo(() => {
    let result = initialPayments;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.room.roomName.toLowerCase().includes(q) ||
        `#RM-${p.room.id}`.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      if (statusFilter === "PAID") {
        result = result.filter(p => p.status === "paid" && p.distributionStatus === "pending");
      } else if (statusFilter === "RECEIVED") {
        result = result.filter(p => p.status === "paid" && p.distributionStatus === "paid");
      }
    }

    // Date range filter
    if (dateRange !== "ALL") {
      const now = new Date();
      let cutoff = new Date();
      if (dateRange === "LAST_3_DAYS") {
        cutoff.setDate(now.getDate() - 3);
      } else if (dateRange === "LAST_WEEK") {
        cutoff.setDate(now.getDate() - 7);
      } else if (dateRange === "LAST_MONTH") {
        cutoff.setMonth(now.getMonth() - 1);
      }
      result = result.filter(p => new Date(p.createdAt) >= cutoff);
    }

    return result;
  }, [initialPayments, dateRange, statusFilter, searchQuery]);

  const totalPaid = useMemo(() => {
    return filteredPayments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [filteredPayments]);

  const totalPrizeWon = useMemo(() => {
    return filteredPayments
      .filter(p => p.status === "paid" && p.distributionStatus === "paid")
      .reduce((sum, p) => sum + (p.prizeAmount || 0), 0);
  }, [filteredPayments]);

  return (
    <div className="flex bg-transparent text-white min-h-screen font-sora overflow-hidden">
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

        <main className="flex-1 flex flex-col overflow-y-auto relative font-body-md px-4 md:px-12 pt-24 pb-12 w-full">
          <div className="space-y-6 max-w-[1440px] mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="font-sora text-[32px] font-bold text-white mb-2">Payment History</h2>
            <p className="text-[#e8bcb7] font-hanken text-[16px] max-w-xl">
              Review your financial performance, tournament entries, and recent prize claims in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
              <span className="material-symbols-outlined text-[18px] text-[#ffb4ab]">calendar_today</span>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-[11px] font-jetbrains font-bold tracking-widest outline-none text-white focus:ring-0"
              >
                <option value="ALL" className="bg-[#131313]">ALL TIME</option>
                <option value="LAST_3_DAYS" className="bg-[#131313]">LAST 3 DAYS</option>
                <option value="LAST_WEEK" className="bg-[#131313]">LAST WEEK</option>
                <option value="LAST_MONTH" className="bg-[#131313]">LAST MONTH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Paid */}
          <div className="bg-white/[0.03] backdrop-blur-[12px] border border-[#ffb4ab]/30 p-6 rounded-xl flex items-center justify-between group overflow-hidden relative shadow-[0_0_15px_rgba(255,46,46,0.1)] hover:shadow-[0_0_20px_rgba(255,46,46,0.4)] transition-all duration-300">
            <div className="relative z-10">
              <p className="text-[#e8bcb7] font-jetbrains text-[10px] tracking-widest font-bold mb-2">TOTAL PAID</p>
              <h3 className="font-sora text-[40px] font-extrabold text-white">₹{totalPaid.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#ffb4ab]/10 flex items-center justify-center text-[#ffb4ab] group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[32px]">payments</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#ffb4ab]/5 rounded-full blur-2xl"></div>
          </div>
          
          {/* Total Prize Won */}
          <div className="bg-white/[0.03] backdrop-blur-[12px] border border-[#ffb95c]/30 p-6 rounded-xl flex items-center justify-between group overflow-hidden relative shadow-[0_0_15px_rgba(255,185,92,0.1)] hover:shadow-[0_0_20px_rgba(255,185,92,0.4)] transition-all duration-300">
            <div className="relative z-10">
              <p className="text-[#e8bcb7] font-jetbrains text-[10px] tracking-widest font-bold mb-2">TOTAL PRIZE WON</p>
              <h3 className="font-sora text-[40px] font-extrabold text-[#ffb95c]">₹{totalPrizeWon.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#ffb95c]/10 flex items-center justify-center text-[#ffb95c] group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[32px]">trophy</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#ffb95c]/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Transactions Table Container */}
        <div className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-xl overflow-hidden mt-8 mb-12">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h4 className="font-sora text-[24px] font-semibold text-white">Recent Transactions</h4>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e8bcb7] text-[18px]">search</span>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches..."
                  className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-[12px] focus:border-[#ffb4ab] outline-none transition-all w-48 text-white placeholder:text-[#e8bcb7]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-jetbrains font-bold tracking-widest text-[#e8bcb7] opacity-60">STATUS:</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-[11px] font-jetbrains font-bold tracking-widest outline-none text-white focus:border-[#ffb4ab]"
                >
                  <option value="ALL" className="bg-[#131313]">ALL</option>
                  <option value="PAID" className="bg-[#131313]">PAID</option>
                  <option value="RECEIVED" className="bg-[#131313]">RECEIVED</option>
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
                  <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">TYPE</th>
                  <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">ENTRY FEE</th>
                  <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">PRIZE POOL</th>
                  <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">PRIZE WON</th>
                  <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">STATUS</th>
                  <th className="p-4 font-jetbrains text-[12px] font-bold tracking-widest text-[#e8bcb7] opacity-60 whitespace-nowrap">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#e8bcb7] opacity-60 font-sora">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => {
                    const isReceived = payment.status === "paid" && payment.distributionStatus === "paid";
                    const isPaidOnly = payment.status === "paid" && payment.distributionStatus === "pending";
                    
                    return (
                      <tr key={payment.id} className="hover:bg-[#ffb4ab]/5 transition-colors">
                        <td className="p-4 font-jetbrains text-[11px] font-bold text-white whitespace-nowrap">#RM-{payment.room.id}</td>
                        <td className="p-4 font-sora font-bold text-sm text-white whitespace-nowrap">{payment.room.roomName}</td>
                        <td className="p-4 font-jetbrains text-[11px] text-[#e8bcb7] uppercase">{payment.room.match_type}</td>
                        <td className="p-4 font-sora font-bold text-[#ffb4ab]">₹{payment.amount}</td>
                        <td className="p-4 font-sora font-bold text-white/60">₹{payment.room.total_price}</td>
                        <td className="p-4 font-sora font-bold text-[#ffb95c]">₹{payment.prizeAmount}</td>
                        <td className="p-4">
                          {isReceived ? (
                            <span className="px-3 py-1 rounded-full border border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa] text-[10px] font-jetbrains font-bold tracking-widest shadow-[0_0_15px_rgba(96,165,250,0.5)]">RECEIVED</span>
                          ) : isPaidOnly ? (
                            <span className="px-3 py-1 rounded-full border border-[#ff2e2e]/30 bg-[#ff2e2e]/10 text-[#ff2e2e] text-[10px] font-jetbrains font-bold tracking-widest shadow-[0_0_15px_rgba(255,46,46,0.5)]">PAID</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-[10px] font-jetbrains font-bold tracking-widest">PENDING</span>
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
    </div>
  );
}
