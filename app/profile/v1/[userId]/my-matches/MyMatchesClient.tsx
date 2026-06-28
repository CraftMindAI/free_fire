"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";

interface BookingData {
  id: string;
  roomId: number;
  roomCode: string;
  roomName: string;
  map_img?: string;
  matchType: string;
  entryFee: number;
  prizePool: number;
  startTime: string | null;
  roomStatus: string;
  seats: number[];
  bookingStatus: string;
  bookedSeats: number[];
}

interface MyMatchesClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    player_id: string;
    profile_img?: string;
  };
  bookings: BookingData[];
}

export default function MyMatchesClient({
  user,
  bookings,
}: MyMatchesClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [selectedBookingForSeats, setSelectedBookingForSeats] =
    useState<BookingData | null>(null);

  // Real-time ticking state to evaluate match start times
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000); // Update every 1 second for real-time countdown
    return () => clearInterval(interval);
  }, []);

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    const isCancelled = b.bookingStatus === "cancelled";
    const isRoomFinished =
      b.roomStatus === "completed" || b.roomStatus === "closed";

    if (activeTab === "active") {
      // Active shows upcoming/live confirmed bookings
      return !isCancelled && !isRoomFinished;
    } else {
      // History shows finished rooms or cancelled bookings
      return isCancelled || isRoomFinished;
    }
  });

  const handleOpenSeatModal = (booking: BookingData) => {
    setSelectedBookingForSeats(booking);
  };

  const handleCloseSeatModal = () => {
    setSelectedBookingForSeats(null);
  };

  // Helper to format date / time
  const formatMatchDate = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  };

  const formatMatchTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
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
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-12 py-8 pt-28 relative max-w-6xl w-full mx-auto">
          {/* Background Gradient leak */}
          <div className="absolute inset-0 bg-smoke pointer-events-none -z-10 opacity-30"></div>

          {/* Heading */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-orbitron text-3xl md:text-4xl text-white font-extrabold tracking-tight uppercase orbitron-header">
                My Bookings
              </h1>
              <p className="font-sora text-sm text-on-surface-variant mt-2 max-w-xl">
                Manage your active registrations and past tournament history.
              </p>
            </div>
            {/* Tab Toggles */}
            <div className="flex gap-2 bg-[#201f1f] p-1.5 rounded-xl border border-white/5 font-jetbrains text-xs tracking-wider">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-2.5 rounded-lg transition-all cursor-pointer uppercase ${
                  activeTab === "active"
                    ? "bg-[#353534] text-white font-bold"
                    : "text-on-surface-variant hover:bg-white/5"
                }`}
              >
                ACTIVE
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-lg transition-all cursor-pointer uppercase ${
                  activeTab === "history"
                    ? "bg-[#353534] text-white font-bold"
                    : "text-on-surface-variant hover:bg-white/5"
                }`}
              >
                HISTORY
              </button>
            </div>
          </div>

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">
                  event_busy
                </span>
                <h3 className="font-orbitron text-lg font-bold text-white uppercase">
                  No matches found
                </h3>
                <p className="font-sora text-sm text-on-surface-variant/60 mt-1">
                  {activeTab === "active"
                    ? "You don't have any active registrations. Head over to Upcoming Matches to book a slot!"
                    : "Your match booking history is empty."}
                </p>
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isCancelled = b.bookingStatus === "cancelled";
                const isCompleted =
                  b.roomStatus === "completed" || b.roomStatus === "closed";

                // Time checks
                let isStarted = false;
                let isStartingSoon = false;
                let countdownStr = "00:00:00";

                if (b.startTime) {
                  const matchTime = new Date(b.startTime);
                  const diffMs = matchTime.getTime() - now.getTime();
                  isStarted = diffMs < 0;
                  // Starting soon if within 10 minutes of start time (e.g., from 11:50 PM for a 12:00 AM match)
                  isStartingSoon = diffMs >= 0 && diffMs <= 10 * 60 * 1000;

                  if (diffMs > 0) {
                    const h = Math.floor(diffMs / (1000 * 60 * 60));
                    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((diffMs % (1000 * 60)) / 1000);
                    countdownStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
                  }
                }

                // Map fallback image
                const fallbackImg =
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAgNicwzkz0w5HbLP6HwnIJR9gy3OTfpPPV1faYJkkOaYOMPZL6qYFYmwCq_3791Kno13woVMvldBhHgfTQvT1ggS89UxYECfTXhrJsmPDnWI14bOljM4lfCY4-iEP6YgaBgYT36iiaveKoUZTZpXzegMYdTAPq1kv7vTp4azxr7nWojuBGfv9g2sGTdqZwjWCSCh0clbFh6ml0wyDXwnoZw2Kp9f_TSTTKSv7u6Rcy5m4G15PrSfQ9VRgpg7v9P7u0HNHh97_84Ro";

                return (
                  <div
                    key={b.id}
                    className={`glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row items-stretch ${
                      isCancelled
                        ? "opacity-60"
                        : isCompleted
                          ? "opacity-85 hover:opacity-100"
                          : ""
                    }`}
                  >
                    {/* Left: Map Image / Label */}
                    <div className="md:w-64 h-48 md:h-auto relative shrink-0">
                      <img
                        alt={b.roomName}
                        className={`w-full h-full object-cover ${isCompleted || isCancelled ? "grayscale-[0.4]" : ""}`}
                        src={b.map_img || fallbackImg}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent flex flex-col justify-end p-6">
                        {isCancelled ? (
                          <span className="bg-[#93000a] text-white border border-[#ffb4ab]/20 px-3 py-1 rounded font-label-caps text-[9px] w-fit mb-2">
                            CANCELLED
                          </span>
                        ) : isCompleted ? (
                          <span className="bg-white/10 border border-white/20 px-3 py-1 rounded text-on-surface-variant font-label-caps text-[9px] w-fit mb-2">
                            COMPLETED
                          </span>
                        ) : isStarted ? (
                          <span className="bg-green-500 text-black px-3 py-1 rounded font-label-caps text-[9px] w-fit mb-2 font-bold animate-pulse">
                            LIVE STARTED
                          </span>
                        ) : (
                          <span className="bg-[#ffb4ab] text-[#690005] px-3 py-1 rounded font-label-caps text-[9px] w-fit mb-2 font-bold">
                            UPCOMING
                          </span>
                        )}
                        <h3 className="font-orbitron font-extrabold text-white text-lg leading-tight uppercase">
                          {b.roomName}
                        </h3>
                      </div>
                    </div>

                    {/* Middle: Details Grid */}
                    <div className="flex-1 p-6 grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 border-r border-white/5">
                      <div>
                        <p className="text-on-surface-variant/50 font-label-caps text-[9px] uppercase mb-1">
                          Room ID
                        </p>
                        <p className="font-semibold text-white">{b.roomCode}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant/50 font-label-caps text-[9px] uppercase mb-1">
                          Match Type
                        </p>
                        <p className="font-bold text-[#ffcb8d] text-sm uppercase">
                          {b.matchType}
                        </p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant/50 font-label-caps text-[9px] uppercase mb-1">
                          Seat Number
                        </p>
                        <p className="font-semibold text-white">
                          {isCancelled
                            ? "N/A"
                            : b.seats
                                .map((s) => (s < 10 ? `0${s}` : s))
                                .join(", ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant/50 font-label-caps text-[9px] uppercase mb-1">
                          Entry Fee
                        </p>
                        <p className="font-bold text-[#e9c400] text-sm">
                          {b.entryFee > 0 ? `${b.entryFee} CR` : "FREE"}
                        </p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant/50 font-label-caps text-[9px] uppercase mb-1">
                          Date
                        </p>
                        <p className="text-sm text-on-surface font-semibold">
                          {formatMatchDate(b.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant/50 font-label-caps text-[9px] uppercase mb-1">
                          Time
                        </p>
                        <p className="text-sm text-on-surface font-semibold">
                          {formatMatchTime(b.startTime)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="p-6 bg-white/[0.02] flex flex-col justify-center gap-3 shrink-0 md:w-56">
                      {isCancelled ? (
                        <span className="text-center text-on-surface-variant/40 font-label-caps text-[10px] uppercase">
                          Refund Processed
                        </span>
                      ) : isCompleted ? (
                        <button
                          disabled
                          className="w-full bg-[#201f1f] text-on-surface-variant/50 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 border border-white/5 text-xs uppercase"
                        >
                          <span className="material-symbols-outlined text-sm">
                            check_circle
                          </span>
                          Match Finished
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenSeatModal(b)}
                            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase hover:border-[#ffb4ab]/30"
                          >
                            <span className="material-symbols-outlined text-sm">
                              visibility
                            </span>
                            View Room
                          </button>

                          {/* Time Sensitive Button */}
                          {isStartingSoon ? (
                            <button
                              onClick={() =>
                                alert(
                                  "The room is starting soon! Open your free fire game to join the match.",
                                )
                              }
                              className="w-full bg-[#ff544a] text-white font-bold py-2.5 rounded-lg animate-pulse flex items-center justify-center gap-2 cursor-pointer text-xs uppercase hover:shadow-[0_0_20px_#ff544a] shadow-[0_0_10px_rgba(255,84,74,0.35)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            >
                              <span className="material-symbols-outlined text-sm animate-spin">
                                sync
                              </span>
                              Join soon(match is about to start)
                            </button>
                          ) : isStarted ? (
                            <button
                              disabled
                              className="w-full bg-[#ff544a] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs uppercase opacity-90 shadow-[0_0_10px_rgba(255,84,74,0.3)]"
                            >
                              <span className="material-symbols-outlined text-sm">
                                sensors
                              </span>
                              Match Started
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 text-on-surface-variant/70 font-label-caps text-[10px] tracking-widest uppercase">
                              <span className="material-symbols-outlined text-[13px] text-[#ffcb8d] animate-pulse">schedule</span>
                              <span>{countdownStr}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* View Room Seat Map Modal */}
      {selectedBookingForSeats && (
        <div className="fixed inset-0 z-[100] items-center justify-center bg-black/80 backdrop-blur-md p-6 flex">
          <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Modal Header */}
            <div className="bg-white/[0.02] px-8 py-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#ffb4ab] rounded-full shadow-[0_0_10px_#ffb4ab]"></div>
                <div>
                  <h2 className="font-orbitron text-xl uppercase tracking-widest text-[#ffb4ab]">
                    {selectedBookingForSeats.roomName} Map
                  </h2>
                  <p className="font-sora text-[10px] text-on-surface-variant uppercase mt-0.5">
                    {selectedBookingForSeats.matchType} • Room{" "}
                    {selectedBookingForSeats.roomCode}
                  </p>
                </div>
              </div>
              <button
                className="text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                onClick={handleCloseSeatModal}
              >
                <span className="material-symbols-outlined text-3xl">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 flex flex-col items-center max-h-[80vh] overflow-y-auto">
              {/* Guides */}
              <div className="flex flex-wrap gap-6 justify-center bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[#4ade80]"></div>
                  <span className="text-xs font-semibold font-jetbrains text-on-surface-variant uppercase tracking-wider">
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[#ef4444] opacity-80"></div>
                  <span className="text-xs font-semibold font-jetbrains text-on-surface-variant uppercase tracking-wider">
                    Booked
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[#facc15] shadow-[0_0_10px_#facc15]"></div>
                  <span className="text-xs font-semibold font-jetbrains text-[#ffb4ab] uppercase tracking-wider font-bold">
                    Your Seat
                  </span>
                </div>
              </div>

              {/* Seat Layout Grids */}
              {selectedBookingForSeats.matchType
                .toLowerCase()
                .includes("squad") ? (
                // Squad Grid
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 p-6 sm:p-8 bg-black/40 rounded-xl border border-white/5 w-full max-w-[500px] overflow-x-auto">
                  {Array.from({ length: 12 }, (_, i) => i * 4 + 1).map(
                    (firstSeat) => {
                      const squad = [
                        firstSeat,
                        firstSeat + 1,
                        firstSeat + 2,
                        firstSeat + 3,
                      ];
                      return (
                        <div
                          key={`squad-${firstSeat}`}
                          className="flex gap-1.5 p-2 bg-white/5 rounded-md border border-white/10 hover:border-white/20 transition-colors"
                        >
                          {squad.map((seat) => {
                            if (seat > 48) return null;
                            const isBooked =
                              selectedBookingForSeats.bookedSeats.includes(
                                seat,
                              );
                            const isUserSeat =
                              selectedBookingForSeats.seats.includes(seat);

                            let bgClass = "bg-[#4ade80]";
                            if (isBooked) bgClass = "bg-[#ef4444] opacity-80";
                            if (isUserSeat)
                              bgClass =
                                "bg-[#facc15] shadow-[0_0_12px_#facc15]";

                            return (
                              <div
                                key={seat}
                                className={`flex-1 aspect-square min-w-[28px] rounded flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold text-[#131313] select-none transition-all duration-300 ${bgClass}`}
                              >
                                {seat < 10 ? `0${seat}` : seat}
                              </div>
                            );
                          })}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : selectedBookingForSeats.matchType
                  .toLowerCase()
                  .includes("duo") ? (
                // Duo Grid
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-6 gap-y-4 p-6 sm:p-8 bg-black/40 rounded-xl border border-white/5 w-full max-w-[520px] overflow-x-auto">
                  {Array.from({ length: 24 }, (_, i) => i * 2 + 1).map(
                    (firstSeatInPair) => {
                      const pair = [firstSeatInPair, firstSeatInPair + 1];
                      return (
                        <div
                          key={`pair-${firstSeatInPair}`}
                          className="flex gap-1.5 p-2 bg-white/5 rounded-md border border-white/10 hover:border-white/20 transition-colors"
                        >
                          {pair.map((seat) => {
                            if (seat > 48) return null;
                            const isBooked =
                              selectedBookingForSeats.bookedSeats.includes(
                                seat,
                              );
                            const isUserSeat =
                              selectedBookingForSeats.seats.includes(seat);

                            let bgClass = "bg-[#4ade80]";
                            if (isBooked) bgClass = "bg-[#ef4444] opacity-80";
                            if (isUserSeat)
                              bgClass =
                                "bg-[#facc15] shadow-[0_0_12px_#facc15]";

                            return (
                              <div
                                key={seat}
                                className={`flex-1 aspect-square min-w-[28px] rounded flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold text-[#131313] select-none transition-all duration-300 ${bgClass}`}
                              >
                                {seat < 10 ? `0${seat}` : seat}
                              </div>
                            );
                          })}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                // Solo / Other Individual Grid
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 p-6 sm:p-8 bg-black/40 rounded-xl border border-white/5 w-full max-w-[520px] overflow-x-auto">
                  {Array.from({ length: 48 }, (_, i) => i + 1).map((seat) => {
                    const isBooked =
                      selectedBookingForSeats.bookedSeats.includes(seat);
                    const isUserSeat =
                      selectedBookingForSeats.seats.includes(seat);

                    let bgClass = "bg-[#4ade80]";
                    if (isBooked) bgClass = "bg-[#ef4444] opacity-80";
                    if (isUserSeat)
                      bgClass =
                        "bg-[#facc15] shadow-[0_0_15px_#facc15] scale-110";

                    return (
                      <div
                        key={seat}
                        className={`w-full aspect-square min-w-[34px] rounded-md flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold text-[#131313] select-none transition-all duration-300 ${bgClass}`}
                      >
                        {seat < 10 ? `0${seat}` : seat}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User Seat Footer Callout */}
              <div className="text-center font-jetbrains text-xs tracking-wider text-on-surface-variant/80 border-t border-white/5 pt-6 w-full uppercase">
                Your assigned seat:{" "}
                <span className="text-[#ffb4ab] font-bold text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  {selectedBookingForSeats.seats.length > 1
                    ? "Seats "
                    : "Seat "}
                  {selectedBookingForSeats.seats
                    .map((s) => (s < 10 ? `0${s}` : s))
                    .join(", ")}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white/[0.02] px-8 py-5 border-t border-white/10 flex justify-end">
              <button
                onClick={handleCloseSeatModal}
                className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold uppercase tracking-widest text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
