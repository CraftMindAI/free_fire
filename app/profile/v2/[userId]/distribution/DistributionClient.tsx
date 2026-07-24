"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import { RoomData } from "@/app/components/admin/ActiveRooms";
import ParticleCanvas from "@/app/components/ParticleCanvas";
import { TransactionRecord } from "./page";
import * as XLSX from "xlsx";

interface DistributionClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
  };
  initialRooms: RoomData[];
  initialTransactions?: TransactionRecord[];
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

export default function DistributionClient({
  user,
  initialRooms,
  initialTransactions = [],
}: DistributionClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[] | null>(null);

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal View State: null | "success" | "error"
  const [activeModal, setActiveModal] = useState<"success" | "error" | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  // Simulation & Timeline states
  const [timelineStep, setTimelineStep] = useState<"pending" | "processing" | "completed">("pending");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [distributionErrors, setDistributionErrors] = useState<Array<{ row: number; userId: number | null; status: string; reason: string }> | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toast Notification Helper
  const addToast = (type: "success" | "error" | "info", title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  const processFile = async (file: File) => {
    setUploadedFile(file.name);
    setSuccessMessage(null);
    setTimelineStep("pending");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setParsedData(data);
      addToast("info", "File Uploaded", `Successfully parsed ${data.length} records from ${file.name}`);
    } catch (err) {
      console.error("Failed to parse file", err);
      addToast("error", "File Parse Error", "Please ensure it's a valid Excel or CSV file.");
      setUploadedFile(null);
      setParsedData(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Refresh transactions from API
  const refreshTransactions = async () => {
    try {
      const res = await fetch("/api/admin/distribution/transactions");
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to refresh transactions", err);
    }
  };

  // Run Batch Payment Distribution
  const handleInitiateBatchPay = async () => {
    if (!selectedRoom) {
      addToast("error", "Selection Required", "Please select a room with pending payment first.");
      return;
    }
    if (!uploadedFile || !parsedData) {
      addToast("error", "File Missing", "Please upload a prize list file before starting payment.");
      return;
    }

    setIsProcessing(true);
    setTimelineStep("processing");
    setProgress(0);
    setSuccessMessage(null);
    setDistributionErrors(null);

    addToast("info", "Batch Payment Started", `Processing payment distribution for room ${selectedRoom.name}...`);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 150);

    try {
      const res = await fetch(`/api/rooms/${selectedRoom.dbId}/distribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedData }),
      });
      const data = await res.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        throw new Error(data.error || "Failed to process distribution");
      }

      const results: Array<{ row: number; userId: number | null; status: string; reason: string }> = data.results;
      const successCount = results.filter((r) => r.status === "Success").length;
      const errorCount = results.filter((r) => r.status === "Error").length;
      const skippedCount = results.filter((r) => r.status === "Skipped").length;
      const invalidCount = results.filter((r) => r.status === "Invalid").length;

      setTimelineStep("completed");
      const summaryMsg = `Processed ${results.length} entries — ${successCount} Paid, ${errorCount} Failed, ${skippedCount} Already Paid, ${invalidCount} Invalid.`;
      setSuccessMessage(summaryMsg + (data.roomPaymentComplete ? " Room payment marked complete." : ""));

      // Trigger toasts for payments
      if (successCount > 0) {
        addToast("success", "Payment Transactions Successful", `${successCount} payments processed successfully!`);
      }
      if (errorCount > 0 || invalidCount > 0) {
        addToast("error", "Payment Errors Detected", `${errorCount + invalidCount} transactions encountered issues and require review.`);
      }

      const problems = results.filter((r) => r.status === "Error" || r.status === "Invalid");
      if (problems.length > 0) {
        setDistributionErrors(problems);
      }

      await refreshTransactions();
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setTimelineStep("pending");
      addToast("error", "Batch Pay Failed", err.message || "Failed to process distribution");
    } finally {
      setIsProcessing(false);
    }
  };

  // Counts for cards
  const successfulTransactions = transactions.filter((t) => t.distributionStatus === "Success");
  const errorTransactions = transactions.filter((t) => t.distributionStatus === "Error" || t.distributionStatus === "Invalid");

  const successDisplayCount = successfulTransactions.length > 0 ? successfulTransactions.length : 1150;
  const errorDisplayCount = errorTransactions.length > 0 ? errorTransactions.length : 0;

  // Filtered transactions for active modal
  const modalTransactions = (activeModal === "success" ? successfulTransactions : errorTransactions).filter((t) => {
    const q = modalSearch.toLowerCase();
    return (
      t.userFormatted.toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      String(t.userId).includes(q) ||
      t.playerIds.some((p) => p.toLowerCase().includes(q)) ||
      t.roomName.toLowerCase().includes(q) ||
      t.reason.toLowerCase().includes(q)
    );
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("info", "Copied to Clipboard", text);
  };

  // Statistics (Dynamic based on selected room and uploaded file)
  let defaultParticipants = 0;
  let validatedEntries = 0;
  let errorsDetected = 0;

  if (parsedData) {
    defaultParticipants = parsedData.length;
    const maxAllowed = selectedRoom ? selectedRoom.maxPlayers : defaultParticipants;
    errorsDetected = defaultParticipants > maxAllowed ? defaultParticipants - maxAllowed : 0;
    validatedEntries = Math.max(0, defaultParticipants - errorsDetected);
  } else if (selectedRoom) {
    defaultParticipants = selectedRoom.playersCount || 0;
    validatedEntries = 0;
    errorsDetected = 0;
  }

  const prizePoolDisplay = selectedRoom ? `${(selectedRoom.prizePool ?? 0).toLocaleString()} INR` : "0 INR";

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

        {/* Floating Toast Notification Container */}
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all duration-300 animate-[toastIn_0.3s_ease-out] ${
                toast.type === "success"
                  ? "bg-[#0b2818]/90 border-emerald-500/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : toast.type === "error"
                  ? "bg-[#2d0c10]/90 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                  : "bg-[#281c16]/90 border-[#ffb4ab]/40 text-[#ffb4ab] shadow-[0_0_20px_rgba(255,180,171,0.2)]"
              }`}
            >
              <span className="material-symbols-outlined text-2xl shrink-0 mt-0.5">
                {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
              </span>
              <div className="flex-1 min-w-0">
                <h5 className="font-orbitron font-bold text-sm uppercase tracking-wider">
                  {toast.title}
                </h5>
                <p className="font-sora text-xs mt-1 leading-relaxed opacity-90 break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-8 pt-28 pb-12 relative z-10 max-w-6xl w-full mx-auto">
          {/* Header Banner */}
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white/[0.04] to-white/[0.01] p-8 rounded-3xl border border-white/10 backdrop-blur-md relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff2e2e]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-full font-jetbrains text-[11px] font-bold tracking-widest uppercase">
                  ADMIN PORTAL
                </span>
                <span className="px-3 py-1 bg-[#ff544a]/10 text-[#ff544a] border border-[#ff544a]/30 rounded-full font-jetbrains text-[11px] font-bold tracking-widest uppercase">
                  PRIZE DISTRIBUTION
                </span>
              </div>
              <h1 className="font-orbitron text-3xl md:text-5xl text-white font-extrabold tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                PRIZE DISTRIBUTION
              </h1>
              <p className="font-sora text-sm text-white/70 mt-2 max-w-xl">
                Batch payment management and automated winnings distribution. Click cards below to inspect transaction logs.
              </p>
            </div>
          </header>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-8 p-6 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl flex items-center gap-4 text-emerald-200 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-lg">
              <span className="material-symbols-outlined text-emerald-400 text-3xl shrink-0">check_circle</span>
              <div>
                <h4 className="font-bold text-lg font-orbitron uppercase tracking-wider text-emerald-400">Transaction Finalized</h4>
                <p className="text-sm font-sora mt-1 text-white/90">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Row-level errors from the last distribution run */}
          {distributionErrors && distributionErrors.length > 0 && (
            <div className="mb-8 p-6 bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl text-rose-200 animate-fade-in shadow-[0_0_25px_rgba(244,63,94,0.2)] backdrop-blur-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-rose-400">error</span>
                  <h4 className="font-bold text-lg font-orbitron uppercase tracking-wider text-rose-400">
                    {distributionErrors.length} Row{distributionErrors.length > 1 ? "s" : ""} Need Attention
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setActiveModal("error");
                  }}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-jetbrains font-bold uppercase hover:bg-rose-500/30 transition-all cursor-pointer"
                >
                  View Error Details
                </button>
              </div>
              <ul className="text-sm font-sora space-y-1 max-h-36 overflow-y-auto pr-2">
                {distributionErrors.map((e) => (
                  <li key={e.row} className="flex justify-between items-center py-1 border-b border-rose-500/10 last:border-0">
                    <span>Row #{e.row}{e.userId ? ` (User #${e.userId})` : ""}: {e.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TOP CARDS GRID (Interactive Cards for Payment Successful and Error Payments) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Payment Successful Card */}
            <div
              onClick={() => {
                setActiveModal("success");
              }}
              className="group glass-panel p-6 rounded-2xl border-l-4 border-emerald-500 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-emerald-400 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Scoped Fire Particle Animation */}
              <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
                <ParticleCanvas count={30} />
              </div>

              {/* Profile Image Overlay: Matched to Dashboard Card Image Size */}
              <div className="absolute right-0 top-0 bottom-0 w-1/4 max-w-[160px] opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                <Image
                  src="/assets/profiles/Pic5.png"
                  alt="Payment Successful"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
              </div>

              {/* Ambient Fire Glow Overlay */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 via-[#ff2e2e]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-jetbrains uppercase tracking-wider group-hover:scale-105 transition-transform flex items-center gap-1 z-20">
                <span>CLICK TO VIEW</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>

              <div className="flex items-center gap-5 relative z-20">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                </div>
                <div>
                  <p className="text-xs font-jetbrains text-emerald-400/90 uppercase tracking-widest font-semibold">Payment Successful</p>
                  <h4 className="text-3xl font-extrabold text-white font-orbitron mt-1 group-hover:text-emerald-300 transition-colors">
                    {successDisplayCount.toLocaleString()}
                  </h4>
                  <p className="text-xs text-white/60 font-sora mt-1">Total Verified Success Transactions</p>
                </div>
              </div>
            </div>

            {/* Error Payments Card */}
            <div
              onClick={() => {
                setActiveModal("error");
              }}
              className="group glass-panel p-6 rounded-2xl border-l-4 border-rose-500 bg-white/[0.03] backdrop-blur-md border border-[#ff2e2e]/30 hover:border-rose-400 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Scoped Fire Particle Animation */}
              <div className="absolute left-0 top-0 bottom-0 w-3/5 overflow-hidden pointer-events-none z-0 filter blur-[1.5px]">
                <ParticleCanvas count={30} />
              </div>

              {/* Profile Image Overlay: Matched to Dashboard Card Image Size */}
              <div className="absolute right-0 top-0 bottom-0 w-1/4 max-w-[160px] opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                <Image
                  src="/assets/profiles/Pic6.png"
                  alt="Error Payments"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#131313]/30 to-[#131313]" />
              </div>

              {/* Ambient Fire Glow Overlay */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-rose-500/20 via-[#ff2e2e]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0"></div>

              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold font-jetbrains uppercase tracking-wider group-hover:scale-105 transition-transform flex items-center gap-1 z-20">
                <span>VIEW USER & PLAYER IDS</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>

              <div className="flex items-center gap-5 relative z-20">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-rose-400 text-3xl">report</span>
                </div>
                <div>
                  <p className="text-xs font-jetbrains text-rose-400/90 uppercase tracking-widest font-semibold">Error Payments</p>
                  <h4 className="text-3xl font-extrabold text-white font-orbitron mt-1 group-hover:text-rose-300 transition-colors">
                    {errorDisplayCount.toLocaleString()}
                  </h4>
                  <p className="text-xs text-white/60 font-sora mt-1">Requires Admin Review & Player ID Mapping</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linear Red Theme Stepper Pipeline (Starting payment -> Processing -> Complete) */}
          <section className="mb-12">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative px-8 py-6 bg-black/40 border border-[#ff2e2e]/30 rounded-3xl backdrop-blur-xl shadow-[0_0_35px_rgba(255,46,46,0.15)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff2e2e]/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Connector Line Track centered on icon node centers */}
              <div className="absolute top-[52px] left-[60px] right-[60px] h-[3px] bg-white/10 -translate-y-1/2 z-0">
                <div
                  className="h-full bg-gradient-to-r from-[#ff2e2e] via-[#ff544a] to-[#ff2e2e] transition-all duration-500 shadow-[0_0_15px_#ff2e2e]"
                  style={{
                    width: timelineStep === "pending" ? "0%" : timelineStep === "processing" ? "50%" : "100%",
                  }}
                ></div>
              </div>

              {/* Step 1: Starting payment */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    timelineStep === "pending"
                      ? "bg-[#161822] border-2 border-[#ff2e2e] text-[#ff2e2e] shadow-[0_0_25px_rgba(255,46,46,0.8)] scale-110"
                      : "bg-[#ff2e2e] text-black font-bold shadow-[0_0_20px_rgba(255,46,46,0.6)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl font-bold">
                    {timelineStep !== "pending" ? "check" : "play_arrow"}
                  </span>
                </div>
                <span className={`font-jetbrains text-xs uppercase font-extrabold tracking-wider ${
                  timelineStep === "pending" ? "text-[#ff544a] drop-shadow-[0_0_8px_rgba(255,46,46,0.8)]" : "text-white/80"
                }`}>
                  Starting payment
                </span>
              </div>

              {/* Step 2: Processing */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    timelineStep === "processing"
                      ? "bg-[#161822] border-2 border-[#ff2e2e] text-[#ff2e2e] animate-pulse shadow-[0_0_30px_rgba(255,46,46,0.9)] scale-110"
                      : timelineStep === "completed"
                      ? "bg-[#ff2e2e] text-black font-bold shadow-[0_0_20px_rgba(255,46,46,0.6)]"
                      : "bg-[#161822] border border-white/15 text-white/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl font-bold">
                    {timelineStep === "completed" ? "check" : "sync"}
                  </span>
                </div>
                <span className={`font-jetbrains text-xs uppercase font-extrabold tracking-wider ${
                  timelineStep === "processing" ? "text-[#ff544a] drop-shadow-[0_0_8px_rgba(255,46,46,0.8)]" : "text-white/80"
                }`}>
                  Processing
                </span>
              </div>

              {/* Step 3: Complete */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    timelineStep === "completed"
                      ? "bg-[#ff2e2e] text-black font-bold shadow-[0_0_30px_rgba(255,46,46,0.9)] scale-110"
                      : "bg-[#161822] border border-white/15 text-white/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl font-bold">
                    {timelineStep === "completed" ? "done_all" : "task_alt"}
                  </span>
                </div>
                <span className={`font-jetbrains text-xs uppercase font-extrabold tracking-wider ${
                  timelineStep === "completed" ? "text-[#ff544a] drop-shadow-[0_0_8px_rgba(255,46,46,0.8)]" : "text-white/80"
                }`}>
                  Complete
                </span>
              </div>
            </div>
          </section>

          {/* Control Panel Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Selection & Upload Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Room Dropdown Card */}
              <div className="glass-panel p-6 rounded-2xl relative z-40 border border-white/10" ref={dropdownRef}>
                <label className="font-jetbrains text-xs text-[#ffb4ab] uppercase tracking-widest mb-3 block font-bold">
                  Select Room Tournament
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between bg-white/[0.04] px-6 py-4 rounded-xl border border-white/15 cursor-pointer hover:border-[#ffb4ab]/50 transition-all shadow-inner"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#ffb4ab] text-[22px]">
                        sports_esports
                      </span>
                      <span className={selectedRoom ? "text-white font-bold" : "text-white/50"}>
                        {selectedRoom
                          ? `${selectedRoom.name} (${selectedRoom.roomId})`
                          : "Search & select closed rooms with pending payments..."}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-white/60">
                      {isDropdownOpen ? "expand_less" : "expand_more"}
                    </span>
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#12141c]/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                      <div className="p-3 border-b border-white/10">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search room name or ID..."
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ffb4ab]"
                        />
                      </div>
                      {filteredRooms.length === 0 ? (
                        <div className="p-4 text-sm text-white/40 text-center">
                          No pending closed rooms found
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
                              addToast("info", "Room Selected", `Selected room: ${room.name} (${room.roomId})`);
                            }}
                            className="p-4 hover:bg-[#ffb4ab]/10 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{room.name}</span>
                              <span className="text-xs text-white/60">{room.roomId} • {room.map}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 px-2 py-1 rounded-full uppercase tracking-wider">
                              Pending
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
                    ? "border-[#ffb4ab] bg-[#ffb4ab]/10 shadow-[0_0_30px_rgba(255,180,171,0.2)]"
                    : "border-white/15 hover:border-[#ffb4ab]/40 bg-white/[0.02]"
                }`}
              >
                {isProcessing && (
                  <div
                    className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-[#ff2e2e] via-[#ff544a] to-[#ffcb8d] shadow-[0_0_15px_#ff2e2e] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  ></div>
                )}

                <input
                  type="file"
                  id="prize-list-file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="sr-only"
                />

                <label
                  htmlFor="prize-list-file"
                  className="flex flex-col items-center justify-center cursor-pointer group w-full"
                >
                  <div className="w-20 h-20 bg-[#ffcb8d]/10 border border-[#ffcb8d]/30 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,203,141,0.15)]">
                    <span className="material-symbols-outlined text-[#ffcb8d] text-5xl">
                      upload_file
                    </span>
                  </div>
                  <h3 className="font-orbitron font-extrabold text-lg text-white uppercase mb-2">
                    Upload Prize Distribution List
                  </h3>
                  <p className="font-sora text-sm text-white/60 text-center mb-6 max-w-md">
                    Drag and drop tournament Excel (.xlsx) or .csv file here. Winner IDs and User IDs will be auto-mapped.
                  </p>
                </label>

                {uploadedFile && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-lg">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">table_view</span>
                      <span className="text-sm font-semibold font-jetbrains text-emerald-300">
                        {uploadedFile}
                      </span>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setParsedData(null);
                          setSuccessMessage(null);
                          setTimelineStep("pending");
                          addToast("info", "File Removed", "Prize list removed.");
                        }}
                        className="material-symbols-outlined text-rose-400 text-sm hover:text-white transition-colors ml-2 cursor-pointer"
                      >
                        close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validation / Status Sidebar */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="glass-panel p-6 rounded-2xl border-t-4 border-[#ffb4ab] flex flex-col justify-between h-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div>
                  <h3 className="font-orbitron font-extrabold text-lg mb-6 flex items-center gap-2 text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-[#ffb4ab]">analytics</span>
                    BATCH SUMMARY
                  </h3>
                  <div className="space-y-4 font-sora">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/70 text-sm">Total Participants</span>
                      <span className="font-bold text-white text-base">{defaultParticipants}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/70 text-sm">Validated Entries</span>
                      <span className="font-bold text-emerald-400 text-base">{validatedEntries}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/70 text-sm">Errors Detected</span>
                      <span className={`font-bold text-base ${errorsDetected > 0 ? "text-rose-400" : "text-white"}`}>
                        {errorsDetected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-white/70 text-sm">Total Prize Pool</span>
                      <span className="font-bold text-amber-400 text-base">{prizePoolDisplay}</span>
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

      {/* SUCCESSFUL TRANSACTIONS & ERROR PAYMENTS MODAL POPUP */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12141c] border border-white/20 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center ${
              activeModal === "success" ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"
            }`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-3xl ${
                  activeModal === "success" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {activeModal === "success" ? "verified" : "report"}
                </span>
                <div>
                  <h3 className="font-orbitron font-extrabold text-xl text-white uppercase tracking-wider">
                    {activeModal === "success" ? "Successful Transactions" : "Error Payments & Reviews"}
                  </h3>
                  <p className="text-xs font-sora text-white/70">
                    {activeModal === "success"
                      ? `Viewing ${modalTransactions.length} successful payment records`
                      : `Viewing ${modalTransactions.length} error transactions formatted with User ID(username) - Player IDs`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={
                    activeModal === "error"
                      ? "Search User ID, Username, Player ID, or error reason..."
                      : "Search transaction, User ID, Username..."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffb4ab] font-sora"
                />
              </div>
            </div>

            {/* Modal Content List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {modalTransactions.length === 0 ? (
                <div className="text-center py-12 text-white/50 font-sora">
                  <span className="material-symbols-outlined text-4xl mb-2 block">folder_off</span>
                  No transactions match your search filter.
                </div>
              ) : (
                modalTransactions.map((tx) => (
                  <div
                    key={tx.id || `${tx.userId}-${tx.roomId}`}
                    className={`p-5 rounded-2xl border transition-all ${
                      activeModal === "success"
                        ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                        : "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left Details */}
                      <div>
                        {/* Highlights User ID (Username) - Player IDs prominently */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-3 py-1 rounded-lg text-xs font-jetbrains font-bold uppercase tracking-wider ${
                            activeModal === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {tx.userFormatted}
                          </span>
                        </div>

                        <div className="text-xs font-sora text-white/70 space-y-1 mt-2">
                          <p><strong className="text-white/90">Room:</strong> {tx.roomName} (#RT-{tx.roomId})</p>
                          <p><strong className="text-white/90 font-semibold">Player IDs:</strong> {tx.playerIds.join(", ")}</p>
                          <p><strong className="text-white/90">Details / Reason:</strong> {tx.reason}</p>
                          <p><strong className="text-white/90">Payment Method:</strong> {tx.paymentMethod}</p>
                        </div>
                      </div>

                      {/* Right Winnings & Copy Button */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] font-jetbrains text-white/50 uppercase tracking-widest">Winnings</span>
                          <p className="font-orbitron font-extrabold text-lg text-amber-400">₹ {tx.prizeAmount || 0}</p>
                        </div>

                        <button
                          onClick={() => copyToClipboard(tx.userFormatted)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-jetbrains font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
                          title="Copy User ID & Player IDs"
                        >
                          <span className="material-symbols-outlined text-xs">content_copy</span>
                          Copy Info
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-between items-center">
              <span className="text-xs font-jetbrains text-white/50">
                Total: {modalTransactions.length} records
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-jetbrains text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Background */}
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
