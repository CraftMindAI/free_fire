"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/common/Header";
import { useToast } from "@/app/components/common/Toast";
import Sidebar from "@/app/components/common/Sidebar";
import ShaderBackground from "@/app/components/ShaderBackground";
import TermsModal from "@/app/components/common/TermsModal";
import { RoomData } from "@/app/components/admin/ActiveRooms";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomCloseButton = ({ closeToast }: any) => (
  <button 
    onClick={closeToast} 
    className="absolute top-[18px] right-[18px] text-white opacity-60 hover:opacity-100 transition-opacity"
  >
    <span className="text-2xl leading-none font-bold">&times;</span>
  </button>
);

const ValidationToast = ({ message }: { message: string }) => (
  <div className="flex items-start gap-4 pr-6">
    <span className="material-symbols-outlined text-[#ff2e2e] text-3xl drop-shadow-[0_0_8px_rgba(255,46,46,0.8)]">warning</span>
    <div className="flex-1 mt-1">
      <p className="font-bold text-white text-[15px] leading-snug">{message}</p>
    </div>
  </div>
);

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
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const encryptedUserId = params.userId as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isDuo = room.matchType?.toLowerCase() === "duo";
  const isSquad = room.matchType?.toLowerCase() === "squad";

  // Local state for booked seats (mocked persistence)
  const [bookedSeats, setBookedSeats] = useState<number[]>(initialBookedSeats);
  
  // Form State
  const defaultPlayer = {
    playerId: "", email: "", whatsapp: "", phone: "", upiId: "", isGpayNumber: true, gpayNumber: ""
  };
  const [players, setPlayers] = useState([
    {
      playerId: user.player_id || "",
      email: user.email || "",
      whatsapp: user.whatsapp || "",
      phone: user.phone || "",
      upiId: user.upiId || "",
      isGpayNumber: true,
      gpayNumber: user.Gpay && user.Gpay !== user.phone ? user.Gpay : ""
    },
    { ...defaultPlayer },
    { ...defaultPlayer },
    { ...defaultPlayer }
  ]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [agreeRules, setAgreeRules] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);

  const updatePlayer = (field: string, value: any) => {
    const newPlayers = [...players];
    newPlayers[activeTab] = { ...newPlayers[activeTab], [field]: value };
    setPlayers(newPlayers);
  };

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
    if (isSquad) {
      const groupStart = Math.floor((seatNumber - 1) / 4) * 4 + 1;
      const group = [groupStart, groupStart + 1, groupStart + 2, groupStart + 3];
      if (group.some(s => bookedSeats.includes(s))) return;
      
      if (selectedSeats.includes(seatNumber)) {
        setSelectedSeats([]);
      } else {
        setSelectedSeats(group);
      }
    } else if (isDuo) {
      const pairSeat = seatNumber % 2 !== 0 ? seatNumber + 1 : seatNumber - 1;
      if (bookedSeats.includes(seatNumber) || bookedSeats.includes(pairSeat)) return;
      
      if (selectedSeats.includes(seatNumber)) {
        setSelectedSeats([]);
      } else {
        setSelectedSeats([seatNumber, pairSeat].sort((a,b) => a-b));
      }
    } else {
      if (bookedSeats.includes(seatNumber)) return;
      if (selectedSeats.includes(seatNumber)) {
        setSelectedSeats([]);
      } else {
        setSelectedSeats([seatNumber]);
      }
    }
  };

  const isMatchStarted = room.matchDateIso ? new Date(room.matchDateIso).getTime() < Date.now() : false;

  const handleReserveClick = () => {
    if (isMatchStarted) {
      toast.error("Match Started", "Match already started! Go check on Live Stream.");
      return;
    }
    if (selectedSeats.length === 0) {
      toast.warning("Select Seats", "Please select at least one seat before proceeding to payment.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isMatchStarted) {
      toast.error("Match Started", "Match already started! Go check on Live Stream.");
      return;
    }
    if (!agreeRules) {
      toast.warning("Rules Unaccepted", "Please agree to the tournament rules.");
      return;
    }
    
    const p1 = players[0];
    const missingP1Fields = [];
    if (!p1.playerId) missingP1Fields.push("Player ID");
    if (!p1.whatsapp) missingP1Fields.push("WhatsApp Number");
    if (!p1.phone) missingP1Fields.push("Phone Number");
    if (!p1.upiId) missingP1Fields.push("UPI ID");
    if (!p1.isGpayNumber && !p1.gpayNumber) missingP1Fields.push("GPay Number");

    if (missingP1Fields.length > 0) {
      toast.error("Incomplete Fields", `Please fill all required fields for Player 1: ${missingP1Fields.join(", ")}.`);
      setActiveTab(0);
      return;
    }

    const neededPlayers = isSquad ? 4 : (isDuo ? 2 : 1);
    
    const missingPlayers: number[] = [];
    for (let i = 1; i < neededPlayers; i++) {
      if (selectedSeats.length > i) {
        const p = players[i];
        const isFilled = Boolean(p.playerId && p.whatsapp && p.phone && p.upiId);
        if (!isFilled) {
          missingPlayers.push(i + 1);
        }
      }
    }

    if (missingPlayers.length > 0) {
      const missingList = missingPlayers.map(n => `Player ${n}`).join(", ");
      const confirm = window.confirm(`You didn't add details for ${missingList}. Are you OK with that?`);
      if (!confirm) return;
    }

    setIsProcessing(true);
    
    const bookingsPayload = [];
    for (let i = 0; i < selectedSeats.length; i++) {
      const p = players[i];
      const isFilled = Boolean(p.playerId && p.whatsapp && p.phone && p.upiId);
      
      bookingsPayload.push({
        seatNumber: selectedSeats[i],
        playerId: isFilled ? p.playerId : (i === 0 ? p.playerId : `${p1.playerId}_P${i+1}`),
        email: isFilled ? p.email : p1.email,
        whatsapp: isFilled ? p.whatsapp : p1.whatsapp,
        phone: isFilled ? p.phone : p1.phone,
        upiId: isFilled ? p.upiId : p1.upiId,
        isGpay: isFilled ? p.isGpayNumber : p1.isGpayNumber,
        gpayNumber: isFilled ? (p.isGpayNumber ? null : p.gpayNumber) : (p1.isGpayNumber ? null : p1.gpayNumber)
      });
    }
    
    try {
      const response = await fetch(`/api/rooms/${room.encryptedRoomId || room.roomId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookings: bookingsPayload })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book slot(s)");
      }

      setIsProcessing(false);
      setIsModalOpen(false);
      
      if (selectedSeats.length > 0) {
        setBookedSeats(prev => [...prev, ...selectedSeats]);
        setSelectedSeats([]);
      }
      
      // Reset form
      setAgreeRules(false);
      setPlayers([
        {
          playerId: user.player_id || "",
          email: user.email || "",
          whatsapp: user.whatsapp || "",
          phone: user.phone || "",
          upiId: user.upiId || "",
          isGpayNumber: true,
          gpayNumber: user.Gpay && user.Gpay !== user.phone ? user.Gpay : ""
        },
        { ...defaultPlayer },
        { ...defaultPlayer },
        { ...defaultPlayer }
      ]);
      setActiveTab(0);

      toast.success("Booking Confirmed", "Slot(s) successfully booked!");
    } catch (err: any) {
      setIsProcessing(false);
      toast.error("Booking Failed", err.message || "Could not process booking.");
    }
  };

  return (
    <div className="flex bg-[#000] text-[#e5e2e1] min-h-screen font-sora overflow-hidden relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        closeButton={CustomCloseButton}
        toastStyle={{
          backgroundColor: '#121212',
          border: '1px solid rgba(255, 46, 46, 0.6)',
          boxShadow: '0 0 20px rgba(255, 46, 46, 0.3)',
          borderRadius: '20px',
          width: '420px',
          padding: '22px',
          color: '#ffffff',
          fontFamily: '"Sora", sans-serif'
        }}
      />
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
                <Link href={`/profile/v1/${encryptedUserId}/upcoming-matches`}>
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
                {isSquad ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 p-6 sm:p-8 bg-black/40 rounded-lg border border-white/5 relative mx-auto overflow-x-auto min-w-[400px]">
                    {Array.from({ length: 12 }, (_, i) => i * 4 + 1).map((firstSeat) => {
                      const squad = [firstSeat, firstSeat + 1, firstSeat + 2, firstSeat + 3];
                      return (
                        <div key={`squad-${firstSeat}`} className="flex flex-wrap sm:flex-nowrap gap-1 p-1.5 bg-white/5 rounded-md border border-white/10 hover:border-white/20 transition-colors">
                          {squad.map(seat => {
                            if (seat > 48) return null;
                            const isBooked = bookedSeats.includes(seat);
                            const isSelected = selectedSeats.includes(seat);
                            let bgClass = "bg-[#4ade80] cursor-pointer hover:opacity-90";
                            if (isBooked) bgClass = "bg-[#ef4444] opacity-80 cursor-not-allowed";
                            if (isSelected) bgClass = "bg-[#facc15] shadow-[0_0_10px_#facc15]";
                            return (
                              <div 
                                key={seat}
                                onClick={() => handleSeatClick(seat)}
                                className={`flex-1 aspect-square min-w-[24px] rounded flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold text-[#131313] transition-all duration-300 ${bgClass}`}
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
                            const isSelected = selectedSeats.includes(seat);
                            let bgClass = "bg-[#4ade80] cursor-pointer hover:opacity-90";
                            if (isBooked) bgClass = "bg-[#ef4444] opacity-80 cursor-not-allowed";
                            if (isSelected) bgClass = "bg-[#facc15] shadow-[0_0_10px_#facc15]";
                            return (
                              <div 
                                key={seat}
                                onClick={() => handleSeatClick(seat)}
                                className={`flex-1 aspect-square min-w-[24px] rounded flex items-center justify-center text-[10px] sm:text-xs font-jetbrains font-bold text-[#131313] transition-all duration-300 ${bgClass}`}
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
                  <div className="grid grid-cols-8 gap-3 p-6 sm:p-8 bg-black/40 rounded-lg border border-white/5 relative mx-auto overflow-x-auto min-w-[300px]">
                    {Array.from({ length: 48 }, (_, i) => i + 1).map((seat) => {
                      const isBooked = bookedSeats.includes(seat);
                      const isSelected = selectedSeats.includes(seat);
                      
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
                )}
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
                    <div className="text-xs font-jetbrains tracking-widest font-semibold text-[#e8bcb7] mb-2">SELECTED SEATS</div>
                    <div className="font-sora text-[24px] font-bold text-[#ffb4ab]">
                      {selectedSeats.length > 0 ? `Seats: ${selectedSeats.map(s => '#' + (s < 10 ? '0'+s : s)).join(', ')}` : "None"}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleReserveClick}
                    className="w-full py-4 bg-[#ffb4ab] text-[#690005] font-sora font-extrabold text-[18px] rounded-lg shadow-[0_0_15px_rgba(255,46,46,0.4)] hover:shadow-[0_0_25px_rgba(255,180,171,0.5)] transition-all uppercase"
                  >
                    PAY
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
          <div className="w-full max-w-xl bg-black/40 backdrop-blur-[24px] border border-white/10 shadow-[0_0_20px_rgba(255,180,171,0.1),inset_0_0_10px_rgba(255,255,255,0.05)] rounded-xl overflow-hidden relative scale-95 animate-[scaleUp_0.3s_ease-out_forwards] max-h-[85vh]">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="font-sora text-[24px] font-semibold text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ffb4ab]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  RESERVE YOUR SLOT
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#e8bcb7] hover:text-[#ffb4ab] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="space-y-1">
                  <span className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] block">SELECTED SEATS</span>
                  <span className="font-sora text-[20px] font-bold text-[#ffb4ab]">{selectedSeats.map(s => '#' + s).join(', ')}</span>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-4">
                  <span className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] block">MAP</span>
                  <span className="font-sora text-[16px] font-bold text-white pt-1 block">{room.name}</span>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-4">
                  <span className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#e8bcb7] block">ENTRY FEE</span>
                  <span className="font-sora text-[20px] font-bold text-[#ffcb8d]">
                    {room.entryFee === 0 ? "FREE" : `₹${(room.entryFee ?? 0) * selectedSeats.length}`}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                {(isDuo || isSquad) && selectedSeats.length > 1 && (
                  <div className="flex border-b border-white/10 gap-4 mb-2 overflow-x-auto scrollbar-hide">
                    {Array.from({ length: selectedSeats.length }).map((_, idx) => {
                      const p = players[idx];
                      const isFilled = Boolean(p.playerId && p.phone && p.whatsapp && p.upiId);
                      const hasError = idx > 0 && !isFilled;
                      return (
                        <button 
                          key={idx}
                          onClick={() => setActiveTab(idx)} 
                          className={`pb-2 px-2 font-jetbrains font-bold tracking-widest text-sm transition-all rounded-t-md whitespace-nowrap 
                            ${activeTab === idx ? "text-[#ffb4ab] border-b-2 border-[#ffb4ab]" : "text-white/50 hover:text-white"} 
                            ${hasError ? "bg-red-500/10 shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-[pulse_2s_ease-in-out_infinite] border-b-2 border-red-500 text-red-400" : ""}`}
                        >
                          PLAYER {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                <form id="reserve-form" onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  
                  {/* Editable Details */}
                  <div className="space-y-2">
                    <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">PLAYER ID</label>
                    <input 
                      type="text" 
                      value={players[activeTab].playerId}
                      onChange={(e) => updatePlayer('playerId', e.target.value)}
                      required
                      placeholder="e.g. 523910234" 
                      className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">WHATSAPP NUMBER</label>
                    <input 
                      type="tel" 
                      value={players[activeTab].whatsapp}
                      onChange={(e) => updatePlayer('whatsapp', e.target.value)}
                      required
                      placeholder="+91 7428730111" 
                      className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">PHONE NUMBER</label>
                    <input 
                      type="tel" 
                      value={players[activeTab].phone}
                      onChange={(e) => updatePlayer('phone', e.target.value)}
                      required
                      placeholder="+91 7428730111" 
                      className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">EMAIL (OPTIONAL)</label>
                    <input 
                      type="email" 
                      value={players[activeTab].email}
                      onChange={(e) => updatePlayer('email', e.target.value)}
                      placeholder="player@example.com" 
                      className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                    />
                  </div>

                  {/* Separator */}
                  {activeTab === 0 && (
                    <>
                      <div className="md:col-span-2 border-t border-white/10 my-2 pt-4 flex justify-between items-center">
                        <p className="text-[#ffb4ab] font-jetbrains text-xs tracking-widest font-bold mb-4">PAYMENT DETAILS</p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">UPI ID</label>
                        <input 
                          type="text" 
                          value={players[0].upiId}
                          onChange={(e) => updatePlayer('upiId', e.target.value)}
                          required
                          placeholder="e.g. username@okhdfcbank" 
                          className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                        />
                      </div>

                      <div className="space-y-2 flex flex-col justify-end md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer py-2">
                          <input 
                            type="checkbox" 
                            checked={players[0].isGpayNumber}
                            onChange={(e) => updatePlayer('isGpayNumber', e.target.checked)}
                            className="rounded border-[#5e3f3b] bg-white/5 text-[#ffb4ab] focus:ring-[#ffb4ab] h-5 w-5"
                          />
                          <span className="text-[#e8bcb7] font-sora text-[16px]">Is your GPay number the same as your Phone number?</span>
                        </label>
                      </div>

                      {!players[0].isGpayNumber && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="font-jetbrains text-[12px] tracking-widest font-semibold text-[#ffb4ab]">GPAY NUMBER</label>
                          <input 
                            type="tel" 
                            value={players[0].gpayNumber}
                            onChange={(e) => updatePlayer('gpayNumber', e.target.value)}
                            required
                            placeholder="Enter your GPay linked number" 
                            className="w-full bg-transparent border-b-2 border-[#5e3f3b] focus:border-[#ffb4ab] text-white font-sora py-2 px-0 transition-all outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Save button removed as per requirements */}

                  <div className="md:col-span-2 flex flex-col gap-4 pt-4">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        checked={agreeRules}
                        onChange={(e) => {
                          if (e.target.checked && !hasViewedTerms) {
                            setIsTermsOpen(true);
                            return;
                          }
                          setAgreeRules(e.target.checked);
                          if (!e.target.checked) {
                            setHasViewedTerms(false);
                          }
                        }}
                        className="rounded border-[#5e3f3b] bg-white/5 text-[#ffb4ab] h-5 w-5"
                      />
                      <div className="font-sora text-[16px] text-[#e8bcb7]">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen(true)}
                          className="text-[#ffb4ab] hover:underline"
                        >
                          Terms of Service
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 accordion justify-end items-stretch sm:items-center">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:w-auto px-8 py-3 font-jetbrains text-[12px] font-semibold tracking-widest text-[#e8bcb7] hover:text-white bg-white/5 border border-white/10 rounded-lg transition-all"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBooking}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-10 py-3 bg-[#ffb4ab] text-[#690005] font-sora text-[14px] font-bold tracking-widest rounded-lg transition-all active:scale-95 shadow-lg hover:shadow-[0_0_25px_rgba(255,180,171,0.5)] disabled:opacity-50 flex justify-center items-center gap-2 uppercase"
                      >
                        {isProcessing ? "Processing..." : `PAY ${(room.entryFee ?? 0) > 0 ? '₹' + ((room.entryFee ?? 0) * selectedSeats.length) : 'FREE'}`}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => {
          setIsTermsOpen(false);
          setHasViewedTerms(true);
          setAgreeRules(true);
        }}
      />
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


