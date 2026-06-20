"use client";

import React, { useState } from "react";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import { RoomData } from "@/app/components/admin/ActiveRooms";

interface MatchDetailsClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
  };
  initialRooms: RoomData[];
  initialStats: {
    activeRooms: number;
    draftRooms: number;
    closedRooms: number;
  };
}

export default function MatchDetailsClient({
  user,
  initialRooms,
  initialStats,
}: MatchDetailsClientProps) {
  const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
  const [stats, setStats] = useState(initialStats);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);

  // Form State
  const [map, setMap] = useState("Cyber-Grid 9");
  const [gameMode, setGameMode] = useState("Battle Royale (Squad)");
  const [entryFee, setEntryFee] = useState("50");
  const [prizePool, setPrizePool] = useState("5000");
  const [seats, setSeats] = useState("100");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setMap("Cyber-Grid 9");
    setGameMode("Battle Royale (Squad)");
    setEntryFee("50");
    setPrizePool("5000");
    setSeats("100");
    setStartDate(new Date().toISOString().split("T")[0]);
    setStartTime("18:00");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: RoomData) => {
    setEditingRoom(room);
    setMap(room.map);
    setGameMode(room.matchType || "Battle Royale (Squad)");
    setEntryFee(String(room.entryFee || 0));
    setPrizePool(String(room.prizePool || 0));
    setSeats(String(room.maxPlayers));
    
    if (room.matchTime) {
      const timeParts = room.matchTime.split(" ");
      setStartTime(timeParts[0] || "18:00");
    }
    setStartDate(room.matchDate || new Date().toISOString().split("T")[0]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      action: editingRoom ? "edit" : "create",
      roomId: editingRoom?.roomId,
      map,
      matchType: gameMode,
      entryFee: Number(entryFee),
      prizePool: Number(prizePool),
      maxPlayers: Number(seats),
      matchDate: startDate
        ? new Date(startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined,
      matchTime: startTime,
    };

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save match details");
      }

      setIsModalOpen(false);
      await fetchUpdatedData();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishMatch = async (roomId: string) => {
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, action: "publish" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish match");
      }

      await fetchUpdatedData();
    } catch (err) {
      console.error("Publish failed:", err);
    }
  };

  const handleDeleteMatch = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this match room?")) return;

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, action: "delete" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete match");
      }

      await fetchUpdatedData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="flex bg-[#131313] text-on-surface min-h-screen relative font-sora">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header username={user.name} />

        {/* Main Content Area */}
        <main className="flex-1 px-8 pt-28 pb-12 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-orbitron text-3xl md:text-4xl text-on-surface font-extrabold tracking-tight uppercase orbitron-header">
                  ROOM DETAILS
                </h1>
                <p className="font-sora text-sm text-on-surface-variant mt-2 max-w-xl">
                  Configure and deploy arena matches. Manage entries, prize pools, and live availability for the global elite.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="bg-[#ffb4ab] text-[#690005] px-6 py-3 rounded-xl font-jetbrains text-xs tracking-widest flex items-center gap-2 hover:shadow-[0_0_25px_#ffb4ab] transition-all active:scale-95 shadow-[0_0_15px_rgba(255,46,46,0.4)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                CREATE ROOM
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-[#ffb4ab]/20 shadow-[0_0_15px_rgba(255,46,46,0.1)]">
                <p className="font-jetbrains text-on-surface-variant text-xs tracking-widest uppercase mb-2">
                  CLOSED ROOMS
                </p>
                <div className="flex items-end justify-between">
                  <span className="font-sora text-4xl text-[#ffb4ab] font-extrabold">
                    {stats.closedRooms}
                  </span>
                  <span className="material-symbols-outlined text-[#ffb4ab] opacity-60">
                    cancel
                  </span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-[#ffcb8d]/20 shadow-[0_0_15px_rgba(255,203,141,0.1)]">
                <p className="font-jetbrains text-on-surface-variant text-xs tracking-widest uppercase mb-2">
                  ACTIVE ROOMS
                </p>
                <div className="flex items-end justify-between">
                  <span className="font-sora text-4xl text-[#ffcb8d] font-extrabold">
                    {stats.activeRooms}
                  </span>
                  <span className="material-symbols-outlined text-[#ffcb8d] opacity-60">
                    sensors
                  </span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <p className="font-jetbrains text-on-surface-variant text-xs tracking-widest uppercase mb-2">
                  DRAFT ROOMS
                </p>
                <div className="flex items-end justify-between">
                  <span className="font-sora text-4xl text-on-surface font-extrabold">
                    {stats.draftRooms}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-60">
                    draft
                  </span>
                </div>
              </div>
            </div>

            {/* Management Table */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-on-surface-variant text-[10px] font-jetbrains uppercase tracking-wider">
                      <th className="p-6">ROOM ID</th>
                      <th className="p-6">MAP</th>
                      <th className="p-6">MATCH TYPE</th>
                      <th className="p-6 text-right">ENTRY</th>
                      <th className="p-6 text-right">PRIZE POOL</th>
                      <th className="p-6 text-center">SEATS</th>
                      <th className="p-6">SCHEDULE</th>
                      <th className="p-6">STATUS</th>
                      <th className="p-6 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sora">
                    {rooms.map((room) => {
                      const isPublished = room.isPublished || room.status === "Published";
                      return (
                        <tr
                          key={room.roomId}
                          className={`transition-colors ${
                            isPublished
                              ? "published-row group"
                              : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="p-6 font-semibold text-on-surface">
                            {room.roomId}
                          </td>
                          <td className="p-6">
                            <span className="bg-[#353534]/80 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-[#ffb4ab]">
                              {room.map}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-on-surface-variant">
                            {room.matchType || "Battle Royale (Squad)"}
                          </td>
                          <td className="p-6 text-right font-semibold text-[#ffcb8d] text-sm">
                            {room.entryFee || 0} <span className="text-[10px]">CR</span>
                          </td>
                          <td className="p-6 text-right font-semibold text-[#ffb4ab] text-sm">
                            {room.prizePool || 0} <span className="text-[10px]">CR</span>
                          </td>
                          <td className="p-6 text-center text-sm text-on-surface-variant">
                            {room.playersCount}/{room.maxPlayers}
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold uppercase">
                                {room.matchDate || "Oct 26, 2023"}
                              </span>
                              <span className="text-xs opacity-60">
                                {room.matchTime || "12:00 UTC"}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            {isPublished ? (
                              <span className="published-badge px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                Published
                              </span>
                            ) : (
                              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 opacity-60">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(room)}
                                disabled={isPublished}
                                className={`p-2 rounded-lg transition-all ${
                                  isPublished
                                    ? "opacity-20 cursor-not-allowed text-on-surface-variant"
                                    : "bg-white/5 text-on-surface-variant hover:text-[#ffb4ab] hover:bg-white/10 cursor-pointer"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => handleDeleteMatch(room.roomId)}
                                disabled={isPublished}
                                className={`p-2 rounded-lg transition-all ${
                                  isPublished
                                    ? "opacity-20 cursor-not-allowed text-on-surface-variant"
                                    : "bg-white/5 text-on-surface-variant hover:text-[#ff2e2e] hover:bg-[#ff2e2e]/10 cursor-pointer"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                              <button
                                onClick={() => handlePublishMatch(room.roomId)}
                                disabled={isPublished}
                                className={`p-2 rounded-lg transition-all ${
                                  isPublished
                                    ? "opacity-20 cursor-not-allowed text-on-surface-variant"
                                    : "bg-[#ffb4ab]/20 text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-[#690005] animate-pulse-live cursor-pointer"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  publish
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>


      {/* Initialize Arena Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] items-center justify-center bg-black/80 backdrop-blur-md p-6 flex">
          <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden relative border border-[#ffb4ab]/20 shadow-[0_0_50px_rgba(255,46,46,0.15)]">
            {/* Modal Header */}
            <div className="bg-[#ffb4ab]/5 px-8 py-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#ffb4ab] rounded-full shadow-[0_0_10px_#ffb4ab]"></div>
                <h2 className="font-orbitron text-xl uppercase tracking-widest text-[#ffb4ab]">
                  {editingRoom ? "Configure Arena" : "Initialize Arena"}
                </h2>
              </div>
              <button
                className="text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            {/* Modal Content (Form) */}
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-2.5 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    ARENA MAP
                  </label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value)}
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  >
                    <option value="Cyber-Grid 9">Cyber-Grid 9</option>
                    <option value="Neon Canyon">Neon Canyon</option>
                    <option value="The Void">The Void</option>
                    <option value="Hyper-Spire">Hyper-Spire</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    GAME MODE
                  </label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value)}
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  >
                    <option value="Battle Royale (Squad)">Battle Royale (Squad)</option>
                    <option value="1v1 Duel">1v1 Duel</option>
                    <option value="Capture the Core">Capture the Core</option>
                    <option value="Search & Destroy">Search & Destroy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    ENTRY FEE (CR)
                  </label>
                  <input
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    required
                    type="number"
                    min="0"
                    placeholder="50"
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    PRIZE POOL (CR)
                  </label>
                  <input
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    required
                    type="number"
                    min="0"
                    placeholder="5000"
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    SEATS
                  </label>
                  <input
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    required
                    type="number"
                    min="1"
                    placeholder="100"
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    START DATE
                  </label>
                  <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    type="date"
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    START TIME (UTC)
                  </label>
                  <input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    type="time"
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold border border-white/20 hover:bg-white/5 transition-all uppercase tracking-widest text-sm rounded-xl cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 font-bold bg-[#ffb4ab] text-[#690005] hover:shadow-[0_0_25px_#ffb4ab] transition-all uppercase tracking-widest text-sm rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {loading ? "SAVING..." : editingRoom ? "Update Match" : "Deploy Match"}
                </button>
              </div>
            </form>
            {/* Bottom decorative gradient line */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#ffb4ab] to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}
