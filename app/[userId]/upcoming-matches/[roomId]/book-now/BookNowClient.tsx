"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/common/Header";
import Sidebar from "@/app/components/common/Sidebar";
import ShaderBackground from "@/app/components/ShaderBackground";
import { RoomData } from "@/app/components/admin/ActiveRooms";
import { useRouter, useParams } from "next/navigation";

interface BookNowClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    profile_img?: string | null;
    player_id?: string;
    whatsapp?: string;
    phone?: string;
    Gpay?: string;
    upiId?: string;
  };
  room: RoomData;
  bookedSeats: number[];
}

export default function BookNowClient({ user, room, bookedSeats: initialBookedSeats }: BookNowClientProps) {
  const router = useRouter();
  const params = useParams();
  const encryptedUserId = params.userId as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Local state for booked seats (mocked persistence)
  const [bookedSeats, setBookedSeats] = useState<number[]>(initialBookedSeats);
  
  // Form State
  const [playerId, setPlayerId] = useState(user.player_id || "");
  const [email, setEmail] = useState(user.email || "");
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsapp || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone || "");
  const [upiId, setUpiId] = useState(user.upiId || "");
  const [isGpayNumber, setIsGpayNumber] = useState(true);
  const [gpayNumber, setGpayNumber] = useState(user.Gpay && user.Gpay !== "Same as Phone" ? user.Gpay : "");
  const [agreeRules, setAgreeRules] = useState(false);

  // Countdown State
  const [countdown, setCountdown] = useState("00:00:00");

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

  const handleSeatClick = (seatNumber: number) => {
    if (bookedSeats.includes(seatNumber)) return;
    if (selectedSeat === seatNumber) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatNumber);
    }
  };

  const handleReserveClick = () => {
    if (selectedSeat) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeRules) {
      alert("Please agree to the tournament rules.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/rooms/${room.encryptedRoomId || room.roomId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatNumber: selectedSeat,
          playerId,
          email,
          whatsapp: whatsappNumber,
          phone: phoneNumber,
          upiId,
          isGpay: isGpayNumber,
          gpayNumber: isGpayNumber ? null : gpayNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book slot");
      }

      setIsProcessing(false);
      setIsModalOpen(false);
      
      if (selectedSeat) {
        setBookedSeats(prev => [...prev, selectedSeat]);
        setSelectedSeat(null);
      }
      
      // Reset form
      setUpiId("");
      setAgreeRules(false);
      
      alert("Slot successfully booked!");
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message);
    }
  };

  return (
    <div className="flex bg-[#000] text-[#e5e2e1] min-h-screen font-sora overflow-hidden relative">
      {/* Background Shader Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#000]">
        <ShaderBackground />
      </div>

      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        <Header
          username={user.name}
          profileImg={user.profile_img || undefined}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="pt-[72px] pb-12 w-full max-w-[1440px] mx-auto z-10 relative">
          {/* Glassmorphism Header */}
          <section className="relative w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-[24px] shadow-[0_10px_40px_rgba(255,46,46,0.1)] p-8 md:p-12 mb-8 overflow-hidden">
            {/* Subtle internal glow */}
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-[#ffb4ab]/5 blur-[100px] pointer-events-none rounded-full"></div>
            
            <div className="relative z-20 flex flex-col">
              
              {/* Back Button */}
              <div className="mb-8">
                <Link href={`/${encryptedUserId}/upcoming-matches`}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all backdrop-blur-md w-fit">
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
                        <span className="font-sora text-[15px] font-bold text-white tracking-wide">{room.matchType?.toUpperCase() || "SOLO"} (SOLO)</span>
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
          <div className="px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side: Seat Selection */}
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 p-8 rounded-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h2 className="font-sora text-[32px] font-bold text-white leading-tight">Seat Selection</h2>
                    <p className="text-[#e8bcb7] font-sora text-[16px]">Pick your position on the grid. Tactical placement is key.</p>
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
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#facc15]"></div>
                      <span className="text-xs font-jetbrains font-semibold tracking-widest">Selected</span>
                    </div>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-8 gap-3 p-6 sm:p-8 bg-black/40 rounded-lg border border-white/5 relative mx-auto overflow-x-auto">
                  {Array.from({ length: 48 }, (_, i) => i + 1).map((seat) => {
                    const isBooked = bookedSeats.includes(seat);
                    const isSelected = selectedSeat === seat;
                    
                    let bgClass = "bg-[#4ade80] cursor-pointer hover:scale-110 hover:shadow-[0_0_15px_#4ade80]"; // Available
                    if (isBooked) bgClass = "bg-[#ef4444] opacity-80 cursor-not-allowed";
                    if (isSelected) bgClass = "bg-[#facc15] scale-110 shadow-[0_0_20px_#facc15]";

                    return (
                      <div 
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-full aspect-square min-w-[30px] rounded-md flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold text-[#131313] transition-all duration-300 ${bgClass}`}
                      >
                        {seat < 10 ? `0${seat}` : seat}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Side: Rules & Instructions */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 p-8 rounded-xl border-t-2 border-t-[#ffb4ab]">
                <h2 className="font-sora text-[24px] font-semibold text-white mb-6 flex items-center gap-2">
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
                  <li className="flex gap-3">
                    <span className="text-[#ffb4ab] font-bold">04</span>
                    <p className="font-sora text-[16px]">Streaming is permitted only with a 3-minute delay minimum.</p>
                  </li>
                </ul>
              </section>

              <section className="bg-white/[0.03] backdrop-blur-[12px] border border-white/10 p-8 rounded-xl border-t-2 border-t-[#ffb4ab]">
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-jetbrains tracking-widest font-semibold text-[#e8bcb7] mb-2">SELECTED SEAT</div>
                    <div className="font-sora text-[24px] font-bold text-[#ffb4ab]">
                      {selectedSeat ? `Seat #${selectedSeat < 10 ? '0'+selectedSeat : selectedSeat}` : "None"}
                    </div>
                  </div>
                  <button 
                    onClick={handleReserveClick}
                    disabled={!selectedSeat}
                    className="w-full py-4 bg-[#ffb4ab] text-[#690005] font-sora font-extrabold text-[18px] rounded-lg shadow-[0_0_15px_rgba(255,46,46,0.4)] hover:shadow-[0_0_25px_rgba(255,180,171,0.5)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all uppercase"
                  >
                    Reserve Slot
                  </button>
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>

      {/* Booking Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-[fadeIn_0.3s_ease-out_forwards]">
          <div className="w-full max-w-2xl bg-black/40 backdrop-blur-[24px] border border-white/10 shadow-[0_0_20px_rgba(255,180,171,0.1),inset_0_0_10px_rgba(255,255,255,0.05)] rounded-xl overflow-hidden relative scale-95 animate-[scaleUp_0.3s_ease-out_forwards]">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="font-sora text-[24px] font-semibold text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ffb4ab]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  RESERVE YOUR SLOT
                </h2>
                <p className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] mt-1">
                  ROOM_ID: {room.roomId}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#e8bcb7] hover:text-[#ffb4ab] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
              
              {/* Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-white/5 p-4 rounded-lg border border-white/5">
                <div className="space-y-1">
                  <span className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] block">SELECTED SEAT</span>
                  <span className="font-sora text-[20px] font-bold text-[#ffb4ab]">#{selectedSeat}</span>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-4">
                  <span className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] block">MAP</span>
                  <span className="font-sora text-[16px] font-bold text-white pt-1 block">{room.name}</span>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-4">
                  <span className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] block">ENTRY FEE</span>
                  <span className="font-sora text-[20px] font-bold text-[#ffcb8d]">
                    {room.entryFee === 0 ? "FREE" : `₹${room.entryFee}`}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <form id="reserve-form" onSubmit={handleConfirmBooking} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* Editable Details */}
                <div className="space-y-2">
                  <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">PLAYER ID (UID)</label>
                  <input 
                    type="text" 
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    required
                    placeholder="e.g. 523910234" 
                    className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">WHATSAPP NUMBER</label>
                  <input 
                    type="tel" 
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                    placeholder="+91 9876543210" 
                    className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">PHONE NUMBER</label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="+91 9876543210" 
                    className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">EMAIL</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="player@example.com" 
                    className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                  />
                </div>

                {/* Separator */}
                <div className="md:col-span-2 border-t border-white/10 my-2 pt-4">
                  <p className="text-[#ffb4ab] font-jetbrains text-xs tracking-widest font-bold mb-4">PAYMENT DETAILS</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">UPI ID</label>
                  <input 
                    type="text" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    placeholder="e.g. username@okhdfcbank" 
                    className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-end md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer py-2">
                    <input 
                      type="checkbox" 
                      checked={isGpayNumber}
                      onChange={(e) => setIsGpayNumber(e.target.checked)}
                      className="rounded border-[#5e3f3b] bg-white/5 text-[#ffb4ab] focus:ring-[#ffb4ab] h-5 w-5"
                    />
                    <span className="text-[#e8bcb7] font-sora text-[16px]">Is your GPay number the same as your Phone number?</span>
                  </label>
                </div>

                {!isGpayNumber && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">GPAY NUMBER</label>
                    <input 
                      type="tel" 
                      value={gpayNumber}
                      onChange={(e) => setGpayNumber(e.target.value)}
                      required
                      placeholder="Enter your GPay linked number" 
                      className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                    />
                  </div>
                )}

                <div className="md:col-span-2 flex items-center gap-3 pt-4">
                  <input 
                    type="checkbox" 
                    id="rules-agree" 
                    checked={agreeRules}
                    onChange={(e) => setAgreeRules(e.target.checked)}
                    required 
                    className="rounded border-[#5e3f3b] bg-white/5 text-[#ffb4ab] focus:ring-[#ffb4ab] h-5 w-5"
                  />
                  <label htmlFor="rules-agree" className="font-sora text-[16px] text-[#e8bcb7]">
                    I agree to the <span className="text-[#ffb4ab] hover:underline cursor-pointer">Tournament Rules</span>.
                  </label>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-white/5 flex flex-col-reverse md:flex-row justify-end gap-4 border-t border-white/10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 font-jetbrains text-[12px] font-semibold tracking-widest text-[#e8bcb7] hover:text-white transition-all"
              >
                CANCEL
              </button>
              <button 
                form="reserve-form"
                type="submit"
                disabled={isProcessing}
                className="px-10 py-3 bg-[#ffb4ab] text-[#690005] font-sora text-[14px] font-bold tracking-widest rounded transition-all active:scale-95 shadow-lg hover:shadow-[0_0_25px_rgba(255,180,171,0.5)] disabled:opacity-50 flex justify-center items-center gap-2 uppercase"
              >
                {isProcessing ? "Processing..." : `PAY ${room.entryFee > 0 ? '₹' + room.entryFee : 'FREE'}`}
              </button>
            </div>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
