"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import { RoomData } from "@/app/components/admin/ActiveRooms";

interface DistributionClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
  };
  initialRooms: RoomData[];
}

export default function DistributionClient({
  user,
  initialRooms,
}: DistributionClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>("winners_list_v2.xlsx");
  const [dragActive, setDragActive] = useState(false);

  // Simulation states
  const [timelineStep, setTimelineStep] = useState<"pending" | "processing" | "completed">("pending");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter rooms based on query
  const filteredRooms = initialRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
      setSuccessMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
      setSuccessMessage(null);
    }
  };

  // Run Batch Payment Simulation
  const handleInitiateBatchPay = () => {
    if (!selectedRoom) {
      alert("Please select a published room first.");
      return;
    }
    if (!uploadedFile) {
      alert("Please upload a prize list file.");
      return;
    }

    setIsProcessing(true);
    setTimelineStep("processing");
    setProgress(0);
    setSuccessMessage(null);

    // Simulate progress bar increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimelineStep("completed");
          setIsProcessing(false);
          setSuccessMessage(`Successfully distributed ${selectedRoom.prizePool ?? 0} CR to all verified winners for room ${selectedRoom.roomId}!`);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Statistics (Dynamic based on selected room, fallback to static defaults)
  const defaultParticipants = selectedRoom ? selectedRoom.playersCount || 84 : 1240;
  const validatedEntries = selectedRoom ? Math.max(0, defaultParticipants - 2) : 1238;
  const errorsDetected = selectedRoom ? (defaultParticipants > 0 ? 2 : 0) : 2;
  const prizePoolDisplay = selectedRoom ? `${(selectedRoom.prizePool ?? 0).toLocaleString()} CR` : "$25,000";

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
        <main className="flex-1 px-8 pt-28 pb-12 relative z-10 max-w-6xl w-full mx-auto">
          <header className="mb-12">
            <h1 className="font-orbitron text-3xl md:text-4xl text-on-surface font-extrabold tracking-tight uppercase orbitron-header">
              PRIZE DISTRIBUTION
            </h1>
            <p className="font-sora text-sm text-on-surface-variant mt-2 max-w-xl">
              Allocate winnings and distribute assets to tournament participants. Ensure all room data is validated before initiating the batch process.
            </p>
          </header>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-8 p-6 bg-green-500/10 border-2 border-green-500/30 rounded-2xl flex items-center gap-4 text-green-200 animate-fade-in shadow-[0_0_20px_rgba(34,197,94,0.15)]">
              <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
              <div>
                <h4 className="font-bold text-lg font-orbitron uppercase tracking-wider text-green-400">Transaction Finalized</h4>
                <p className="text-sm font-sora mt-1 text-on-surface/90">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                </div>
                <div>
                  <p className="text-xs font-jetbrains text-on-surface-variant uppercase tracking-wider">Payment Successful</p>
                  <h4 className="text-2xl font-extrabold text-green-400 font-sora mt-1">1,150</h4>
                </div>
              </div>
              <div className="text-xs text-green-500 font-bold">+12% vs last batch</div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-l-4 border-[#ffb4ab] shadow-[0_0_15px_rgba(255,180,171,0.15)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffb4ab]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ffb4ab]">error</span>
                </div>
                <div>
                  <p className="text-xs font-jetbrains text-on-surface-variant uppercase tracking-wider">Error Payments</p>
                  <h4 className="text-2xl font-extrabold text-[#ffb4ab] font-sora mt-1">88</h4>
                </div>
              </div>
              <div className="text-xs text-[#ffb4ab] font-bold">Requires Review</div>
            </div>
          </div>

          {/* Step Timeline */}
          <section className="mb-16">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative px-4">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 z-0">
                <div
                  className="h-full timeline-line transition-all duration-500"
                  style={{
                    width: timelineStep === "pending" ? "0%" : timelineStep === "processing" ? "50%" : "100%",
                  }}
                ></div>
              </div>

              {/* Steps */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    timelineStep === "pending"
                      ? "bg-surface-container border border-white/10 active-glow text-[#ffb4ab]"
                      : "bg-[#ffb4ab] text-[#690005] active-glow"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {timelineStep !== "pending" ? "check" : "schedule"}
                  </span>
                </div>
                <span className={`font-jetbrains text-xs tracking-wider uppercase ${timelineStep !== "pending" ? "text-[#ffb4ab]" : "text-on-surface-variant"}`}>
                  Pending
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    timelineStep === "processing"
                      ? "bg-surface-container border-2 border-[#ffb4ab] animate-pulse-red text-[#ffb4ab]"
                      : timelineStep === "completed"
                      ? "bg-[#ffb4ab] text-[#690005]"
                      : "bg-surface-container border border-white/10 opacity-50 text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {timelineStep === "completed" ? "check" : "sync"}
                  </span>
                </div>
                <span className={`font-jetbrains text-xs tracking-wider uppercase ${timelineStep === "processing" ? "text-on-surface" : "text-on-surface-variant"}`}>
                  Processing
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    timelineStep === "completed"
                      ? "bg-[#ffb4ab] text-[#690005] active-glow border-none"
                      : "bg-surface-container border border-white/10 opacity-50 text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined">done_all</span>
                </div>
                <span className={`font-jetbrains text-xs tracking-wider uppercase ${timelineStep === "completed" ? "text-[#ffb4ab]" : "text-on-surface-variant"}`}>
                  Completed
                </span>
              </div>
            </div>
          </section>

          {/* Control Panel Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Selection & Upload Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Dropdown Card */}
              <div className="glass-panel p-6 rounded-2xl relative" ref={dropdownRef}>
                <label className="font-jetbrains text-xs text-on-surface-variant uppercase tracking-wider mb-4 block">
                  Select Published Room
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between bg-white/5 px-6 py-4 rounded-xl border border-white/10 cursor-pointer hover:border-[#ffb4ab]/40 focus-within:border-[#ffb4ab] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        sports_esports
                      </span>
                      <span className={selectedRoom ? "text-on-surface font-semibold" : "text-on-surface-variant/50"}>
                        {selectedRoom
                          ? `${selectedRoom.name} (${selectedRoom.roomId})`
                          : "Search & select published rooms..."}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {isDropdownOpen ? "expand_less" : "expand_more"}
                    </span>
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1c1b1b]/95 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                      <div className="p-3 border-b border-white/5">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search room name or ID..."
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-[#ffb4ab]"
                        />
                      </div>
                      {filteredRooms.length === 0 ? (
                        <div className="p-4 text-sm text-on-surface-variant/50 text-center">
                          No published rooms found
                        </div>
                      ) : (
                        filteredRooms.map((room) => (
                          <div
                            key={room.roomId}
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsDropdownOpen(false);
                              setSearchQuery("");
                              setSuccessMessage(null);
                              setTimelineStep("pending");
                            }}
                            className="p-4 hover:bg-[#ffb4ab]/10 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface text-sm">{room.name}</span>
                              <span className="text-xs text-on-surface-variant/60">{room.roomId} • {room.map}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-[#ffb4ab]/20 text-[#ffb4ab] px-2 py-1 rounded-full uppercase tracking-wider">
                              Published
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drag & Drop Upload */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`glass-panel p-10 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 relative overflow-hidden transition-all duration-300 ${
                  dragActive
                    ? "border-[#ffb4ab] bg-[#ffb4ab]/5 shadow-[0_0_20px_rgba(255,180,171,0.1)]"
                    : "border-white/10 hover:border-[#ffb4ab]/40"
                }`}
              >
                {/* Progress bar overlay for pay animation */}
                {isProcessing && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-[#ffb4ab] shadow-[0_0_10px_#ffb4ab] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  ></div>
                )}

                <input
                  type="file"
                  id="prize-list-file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />

                <label
                  htmlFor="prize-list-file"
                  className="flex flex-col items-center justify-center cursor-pointer group w-full"
                >
                  <div className="w-20 h-20 bg-[#ffcb8d]/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[#ffcb8d] text-5xl">
                      description
                    </span>
                  </div>
                  <h3 className="font-orbitron font-extrabold text-lg text-on-surface uppercase mb-2">
                    Upload Prize List
                  </h3>
                  <p className="font-sora text-sm text-on-surface-variant text-center mb-8 max-w-sm">
                    Drag and drop your tournament excel sheet or .csv here. We will automatically map the winner IDs.
                  </p>
                </label>

                {uploadedFile && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10 shadow-lg">
                      <span className="material-symbols-outlined text-green-500 text-sm">table_view</span>
                      <span className="text-sm font-semibold font-jetbrains text-on-surface">
                        {uploadedFile}
                      </span>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setSuccessMessage(null);
                          setTimelineStep("pending");
                        }}
                        className="material-symbols-outlined text-[#ffb4ab] text-xs hover:text-white transition-colors ml-2"
                      >
                        close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validation/Status Sidebar */}
            <div className="lg:col-span-4 flex flex-col">
              {/* Summary Card */}
              <div className="glass-panel p-6 rounded-2xl border-t-4 border-[#ffb4ab] flex flex-col justify-between h-full shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                <div>
                  <h3 className="font-orbitron font-extrabold text-lg mb-6 flex items-center gap-2 text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-[#ffb4ab]">analytics</span>
                    BATCH SUMMARY
                  </h3>
                  <div className="space-y-4 font-sora">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-on-surface-variant text-sm">Total Participants</span>
                      <span className="font-bold text-on-surface text-base">{defaultParticipants}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-on-surface-variant text-sm">Validated Entries</span>
                      <span className="font-bold text-green-400 text-base">{validatedEntries}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-on-surface-variant text-sm">Errors Detected</span>
                      <span className={`font-bold text-base ${errorsDetected > 0 ? "text-[#ffb4ab]" : "text-on-surface"}`}>
                        {errorsDetected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-on-surface-variant text-sm">Total Prize Pool</span>
                      <span className="font-bold text-[#ffcb8d] text-base">{prizePoolDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleInitiateBatchPay}
                    disabled={isProcessing || !selectedRoom || !uploadedFile}
                    className="w-full bg-[#ffb4ab] text-[#690005] py-4 rounded-xl font-bold font-jetbrains text-xs tracking-widest uppercase hover:shadow-[0_0_25px_#ffb4ab] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(255,46,46,0.3)]"
                  >
                    {isProcessing ? "PROCESSING..." : "INITIATE BATCH PAY"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Background Decorative carbon fiber simulation */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]">
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVvKjb-crAd7Rmi92_fhaZAy0TpNXlIK_DixfzztBVIJLYRGKEr0jyGrG7Q7B7VZ-g7G4u8i1kab87Ldte6CsF0LK8z7MMVN0d8iYANRKCrFqDvgyu6N8SU4d9lx3POT-ysK2t91U7eCSQRwmELk7Tsx6ne9POnM4DPVUBVos2bDMV53LJMGakUD8eymkqgr47xsCiKRguJLtTB261bP5T_2yfYiZBshfMl71Ob-kuq29uiOJvoXSsIyEdRdhexp-LI3vx0AekphU')" }}></div>
      </div>
    </div>
  );
}
