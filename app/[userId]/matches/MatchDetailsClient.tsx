"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import { RoomData } from "@/app/components/admin/ActiveRooms";
import { ToastProvider, useToast } from "@/app/components/common/Toast";
import ParticleCanvas from "@/app/components/ParticleCanvas";
import { encryptId } from "@/app/lib/encryption";

const MAP_OPTIONS = [
  { value: "Bermuda", label: "BERMUDA", src: "/assets/map/Bermuda.png" },
  { value: "Purgatory", label: "PURGATORY", src: "/assets/map/Purgatory.png" },
  { value: "Kalahari", label: "KALAHARI", src: "/assets/map/Kalahari.png" },
  { value: "Alpine", label: "ALPINE", src: "/assets/map/Alpine.png" },
  { value: "Nexterra", label: "NEXTERRA", src: "/assets/map/Nexterra.png" },
  { value: "Solara", label: "SOLARA", src: "/assets/map/Solara.png" },
];

// Infer matchType from maxPlayers since DB column not yet migrated
function inferMatchType(maxPlayers: number): string {
  if (maxPlayers <= 12) return "Squad";
  if (maxPlayers <= 24) return "Duo";
  return "Solo";
}

// ── Map Carousel ────────────────────────────────────────────────
function MapCarousel({
  map,
  setMap,
}: {
  map: string;
  setMap: (v: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardW = scrollRef.current.clientWidth / 3;
      scrollRef.current.scrollBy({ left: -cardW, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      const cardW = scrollRef.current.clientWidth / 3;
      scrollRef.current.scrollBy({ left: cardW, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
        ARENA MAP
      </label>

      {/* Outer group — hover on this reveals the arrows */}
      <div className="relative group/carousel w-full">
        {/* Left fade edge + arrow */}
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pointer-events-none">
          <div className="w-10 h-full bg-gradient-to-r from-[#111]/95 to-transparent" />
          <button
            type="button"
            onClick={scrollLeft}
            className="
              absolute left-1 w-7 h-7 rounded-full
              bg-[#1e1e1e]/90 border border-white/15
              flex items-center justify-center
              text-white/60 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/50 hover:bg-[#2a2a2a]
              transition-all duration-200 cursor-pointer
              opacity-0 pointer-events-none
              group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto
            "
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
        </div>

        {/* Hidden-scrollbar card row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-2 py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.map-scroll::-webkit-scrollbar{display:none}`}</style>
          {MAP_OPTIONS.map((m) => {
            const isSelected = map === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMap(m.value)}
                className={`relative flex-shrink-0 w-[calc(33.333%-8px)] rounded-xl overflow-hidden transition-all duration-200 group/card ${isSelected
                  ? "ring-2 ring-[#ffb4ab] shadow-[0_0_16px_rgba(255,180,171,0.55)] scale-105"
                  : "ring-1 ring-white/10 hover:ring-[#ffb4ab]/50 hover:scale-105"
                  }`}
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={m.src}
                  alt={m.label}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 33vw, 250px"
                />
                <div
                  className={`absolute inset-0 transition-all duration-200 ${isSelected
                    ? "bg-gradient-to-t from-[#690005]/90 via-black/20 to-transparent"
                    : "bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover/card:from-black/60"
                    }`}
                />
                <span
                  className={`absolute bottom-1.5 left-0 right-0 text-center font-jetbrains text-[8px] font-bold tracking-widest uppercase px-1 ${isSelected ? "text-[#ffb4ab]" : "text-white/80"
                    }`}
                >
                  {m.label}
                </span>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ffb4ab] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-[#690005] font-bold">
                      check
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right fade edge + arrow */}
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pointer-events-none">
          <div className="w-10 h-full bg-gradient-to-l from-[#111]/95 to-transparent" />
          <button
            type="button"
            onClick={scrollRight}
            className="
              absolute right-1 w-7 h-7 rounded-full
              bg-[#1e1e1e]/90 border border-white/15
              flex items-center justify-center
              text-white/60 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/50 hover:bg-[#2a2a2a]
              transition-all duration-200 cursor-pointer
              opacity-0 pointer-events-none
              group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto
            "
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────

// ── Custom 12-Hour Time Picker ─────────────────────────────────
function TimePicker12({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const parse24 = (time24: string) => {
    if (!time24) return { h: "12", m: "00", ampm: "PM" };
    const [hh, mm] = time24.split(":");
    let h = parseInt(hh, 10);
    if (isNaN(h)) h = 12;
    const ampm = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    if (h > 12) h -= 12;
    return { h: String(h).padStart(2, "0"), m: mm || "00", ampm };
  };

  const { h, m, ampm } = parse24(value);

  const handleUpdate = (newH: string, newM: string, newAmpm: string) => {
    let h24 = parseInt(newH, 10);
    if (newAmpm === "PM" && h24 !== 12) h24 += 12;
    if (newAmpm === "AM" && h24 === 12) h24 = 0;
    const time24 = `${String(h24).padStart(2, "0")}:${newM}`;
    onChange(time24);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="space-y-2 w-full">
      <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
        {label}
      </label>
      <div className="flex bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 rounded focus-within:border-[#ffb4ab] transition-all">
        <select
          value={h}
          onChange={(e) => handleUpdate(e.target.value, m, ampm)}
          className="bg-transparent outline-none py-3 px-1 text-on-surface w-full appearance-none text-center cursor-pointer"
        >
          {hours.map((hour) => (
            <option key={hour} value={hour} className="bg-[#1e1e1e] text-white">
              {hour}
            </option>
          ))}
        </select>
        <span className="text-on-surface-variant flex items-center">:</span>
        <select
          value={m}
          onChange={(e) => handleUpdate(h, e.target.value, ampm)}
          className="bg-transparent outline-none py-3 px-1 text-on-surface w-full appearance-none text-center cursor-pointer"
        >
          {minutes.map((min) => (
            <option key={min} value={min} className="bg-[#1e1e1e] text-white">
              {min}
            </option>
          ))}
        </select>
        <select
          value={ampm}
          onChange={(e) => handleUpdate(h, m, e.target.value)}
          className="bg-transparent outline-none py-3 px-1 text-[#ffb4ab] font-bold w-full appearance-none text-center cursor-pointer"
        >
          <option value="AM" className="bg-[#1e1e1e] text-white">AM</option>
          <option value="PM" className="bg-[#1e1e1e] text-white">PM</option>
        </select>
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────


interface MatchDetailsClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  initialRooms: RoomData[];
  initialStats: {
    activeRooms: number;
    draftRooms: number;
    closedRooms: number;
  };
}

function MatchDetailsClientInner({
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
  const [map, setMap] = useState("Bermuda");
  const [gameMode, setGameMode] = useState("Solo");
  const [entryFee, setEntryFee] = useState("50");
  const [prizePool, setPrizePool] = useState("5000");
  const [seats, setSeats] = useState("48");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Auto-clear the modal inline error after 4 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // Auto-set seats to the mode's max when mode changes
  const MODE_MAX: Record<string, number> = { Solo: 48, Duo: 24, Squad: 12 };
  useEffect(() => {
    setSeats(String(MODE_MAX[gameMode] ?? 48));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode]);

  const fetchUpdatedData = async () => {
    try {
      const [statsRes, roomsRes] = await Promise.all([
        fetch("/api/stats", { cache: 'no-store' }),
        fetch("/api/rooms", { cache: 'no-store' })
      ]);

      if (statsRes.ok && roomsRes.ok) {
        const statsData = await statsRes.json();
        const roomsData = await roomsRes.json();

        setStats(statsData.stats);

        // Map raw DB rooms to RoomData shape (same as page.tsx)
        const mappedRooms: RoomData[] = (roomsData.rooms ?? []).map(
          (r: any) => ({
            roomId: `${r.id}`,
            name: r.roomName,
            map: r.roomName,
            map_img: r.map_img || undefined,
            matchType: r.match_type ? `Battle Royale (${r.match_type})` : inferMatchType(r.maxPlayers),
            entryFee: r.entry_fee || 0,
            prizePool: r.total_price || 0,
            playersCount: r.currentPlayers,
            maxPlayers: r.maxPlayers,
            matchDate: r.startTime
              ? new Date(r.startTime).toISOString().split("T")[0]
              : "",
            matchTime: r.startTime
              ? new Date(r.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              : "",
            matchDateIso: r.startTime ? new Date(r.startTime).toISOString() : "",
            endTimeIso: r.endTime ? new Date(r.endTime).toISOString() : "",
            status: r.status,
            isPublished: r.status === "active",
            encryptedRoomId: encryptId(String(r.id)),
            tier: "Legendary",
            icon: "sports_esports",
          })
        );

        setRooms(mappedRooms);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setMap("Bermuda");
    setGameMode("Solo");
    setEntryFee("50");
    setPrizePool("5000");
    setSeats("48");
    setStartDate(new Date().toISOString().split("T")[0]);
    setStartTime("18:00");
    setEndTime("19:00");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: RoomData) => {
    setEditingRoom(room);
    setMap(room.map);
    let extractedMode = "Solo";
    if (room.matchType) {
      if (room.matchType.includes("Solo") || room.matchType === "Solo") extractedMode = "Solo";
      else if (room.matchType.includes("Duo") || room.matchType === "Duo") extractedMode = "Duo";
      else if (room.matchType.includes("Squad") || room.matchType === "Squad") extractedMode = "Squad";
    }
    setGameMode(extractedMode);
    setEntryFee(String(room.entryFee || 0));
    setPrizePool(String(room.prizePool || 0));
    setSeats(String(Math.min(48, room.maxPlayers)));

    if (room.matchDateIso) {
      const d = new Date(room.matchDateIso);
      setStartDate(d.toISOString().split("T")[0]);
      setStartTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    } else {
      setStartDate(new Date().toISOString().split("T")[0]);
      setStartTime("18:00");
    }

    if ((room as any).endTimeIso) {
      const ed = new Date((room as any).endTimeIso);
      setEndTime(`${String(ed.getHours()).padStart(2, "0")}:${String(ed.getMinutes()).padStart(2, "0")}`);
    } else if (room.matchDateIso) {
      const d = new Date(room.matchDateIso);
      d.setHours(d.getHours() + 1);
      setEndTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    } else {
      setEndTime("19:00");
    }

    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const selectedMapOption = MAP_OPTIONS.find(m => m.value === map);
    const map_img = selectedMapOption ? selectedMapOption.src : null;

    const payload = {
      action: editingRoom ? "edit" : "create",
      roomId: editingRoom?.roomId,
      map,
      map_img,
      matchType: gameMode,
      entryFee: Number(entryFee),
      prizePool: Number(prizePool),
      maxPlayers: Number(seats),
      matchDate: startDate,
      matchTime: startTime,
      endTime: endTime,
    };

    console.log("Client payload matchType:", payload.matchType);

    // Enforce: when initializing (creating) a match, the start datetime must be in the future
    if (!editingRoom) {
      const scheduled = new Date(`${startDate}T${startTime}:00`);
      if (isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
        const msg = "Start time must be in the future to deploy a match.";
        setError(msg);
        toast.error("Invalid Start Time", msg);
        setLoading(false);
        return;
      }
    }

    let statusCode = 200;
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      statusCode = res.status;
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save match details");
      }

      setIsModalOpen(false);
      await fetchUpdatedData();

      if (editingRoom) {
        toast.update("Room Updated", `${map} room has been reconfigured.`);
      } else {
        toast.success("Room Created", `${map} arena is ready — publish when set!`);
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred";
      setError(msg);
      toast.error(
        statusCode === 409 ? "Duplicate Room" : "Failed to Save",
        msg
      );
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
      toast.success("Room Published", `Room #${roomId} is now live in the arena!`);
    } catch (err: any) {
      console.error("Publish failed:", err);
      toast.error("Publish Failed", err.message || "Could not publish the room.");
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
      toast.delete("Room Deleted", `Room #${roomId} has been permanently removed.`);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("Delete Failed", err.message || "Could not delete the room.");
    }
  };

  return (
    <div className="flex bg-transparent text-on-surface min-h-screen font-sora overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

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
              {/* Closed Rooms */}
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffb4ab]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">cancel</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">CLOSED ROOMS</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-[#ffb4ab] glow-crimson counter">{stats.closedRooms}</span>
                </div>
              </div>

              {/* Active Rooms */}
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-[#ffcb8d]/50 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">sensors</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">ACTIVE ROOMS</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-[#ffcb8d] counter">{stats.activeRooms}</span>
                </div>
              </div>

              {/* Draft Rooms */}
              <div className="p-8 rounded-xl relative overflow-hidden group hover:border-white/30 hover:-translate-y-1 transition-all duration-300 bg-white/[0.03] backdrop-blur-md border border-white/10">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">draft</span>
                </div>
                <p className="font-jetbrains text-[10px] text-[#e8bcb7] mb-2 tracking-wider">DRAFT ROOMS</p>
                <div className="flex items-center gap-4">
                  <span className="font-sora text-4xl font-bold text-on-surface counter">{stats.draftRooms}</span>
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
                      <th className="p-6 text-center">MAP</th>
                      <th className="p-6">MATCH TYPE</th>
                      <th className="p-6 text-right">ENTRY</th>
                      <th className="p-6 text-right">PRIZE POOL</th>
                      <th className="p-6 text-center">SEATS</th>
                      <th className="p-6">SCHEDULE</th>
                      <th className="p-6">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sora">
                    {rooms.map((room) => {
                      const normalizedStatus = (room.status || "").toLowerCase();
                      const isClosed = normalizedStatus === "closed" || normalizedStatus === "completed" || normalizedStatus === "finished";
                      return (
                        <tr
                          key={room.roomId}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-6 font-semibold text-on-surface">
                            {room.roomId}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              {room.map_img && (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                  <Image
                                    src={room.map_img}
                                    alt={room.map}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-sm text-on-surface-variant">
                                {room.map}
                              </span>
                            </div>
                          </td>
                          <td className="p-6 text-sm text-on-surface-variant">
                            {room.matchType || "Battle Royale (Squad)"}
                          </td>
                          <td className="p-6 text-right font-semibold text-[#ffcb8d] text-sm">
                            {room.entryFee || 0} <span className="text-[10px]">INR</span>
                          </td>
                          <td className="p-6 text-right font-semibold text-[#ffb4ab] text-sm">
                            {room.prizePool || 0} <span className="text-[10px]">INR</span>
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
                            {isClosed ? (
                              <span className="bg-[#690005]/50 border border-[#ffb4ab]/30 text-[#ffb4ab] px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 opacity-80">
                                Closed
                              </span>
                            ) : normalizedStatus === "active" ? (
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
          <div className="glass-panel w-full max-w-2xl rounded-3xl relative border border-[#ffb4ab]/20 shadow-[0_0_50px_rgba(255,46,46,0.15)] overflow-y-auto max-h-[90vh]">
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

              <MapCarousel map={map} setMap={setMap} />

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="font-jetbrains text-on-surface-variant text-[10px] uppercase tracking-wider">
                    GAME MODE
                  </label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value)}
                    className="w-full bg-[#353534]/80 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  >
                    <option value="Solo" className="bg-[#1e1e1e] text-white">Solo </option>
                    <option value="Duo" className="bg-[#1e1e1e] text-white">Duo </option>
                    <option value="Squad" className="bg-[#1e1e1e] text-white">Squad </option>
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
                    PRIZE POOL
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
                    SEATS{" "}
                    <span className="text-[#ffb4ab]">
                      (MAX {MODE_MAX[gameMode] ?? 48})
                    </span>
                  </label>
                  <input
                    value={seats}
                    onChange={(e) => {
                      const max = MODE_MAX[gameMode] ?? 48;
                      const v = Math.min(max, Math.max(1, Number(e.target.value)));
                      setSeats(String(v));
                    }}
                    required
                    type="number"
                    min="1"
                    max={MODE_MAX[gameMode] ?? 48}
                    placeholder={String(MODE_MAX[gameMode] ?? 48)}
                    className="w-full bg-[#353534]/50 border-b-2 border-[#ffb4ab]/30 focus:border-[#ffb4ab] outline-none py-3 px-2 text-on-surface transition-all rounded"
                  />

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <TimePicker12
                  value={startTime}
                  onChange={handleStartTimeChange}
                  label="START TIME"
                />
                <TimePicker12
                  value={endTime}
                  onChange={setEndTime}
                  label="END TIME"
                />
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

export default function MatchDetailsClient(props: MatchDetailsClientProps) {
  return (
    <ToastProvider>
      <MatchDetailsClientInner {...props} />
    </ToastProvider>
  );
}
