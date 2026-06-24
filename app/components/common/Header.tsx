"use client";

import React from "react";
import menuIcon from "@/public/assets/menu.png";

interface HeaderProps {
  username?: string;
  profileImg?: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({
  username = "Admin",
  profileImg,
  onToggleSidebar,
  isSidebarOpen = false,
}: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(255,46,46,0.2)]">
      <div className="flex justify-between items-center px-6 py-4 mx-auto w-full">
        <div className="flex items-center gap-4">
          {/* Sidebar toggle — menu icon to open, X to close */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-[#ffb4ab]/20 hover:border-[#ffb4ab]/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(255,46,46,0.15)] cursor-pointer flex-shrink-0"
              aria-label={isSidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
            >
              {isSidebarOpen ? (
                <span className="material-symbols-outlined text-[22px] text-[#ffb4ab]">
                  close
                </span>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={menuIcon.src} alt="Menu" className="w-5 h-5 object-contain" />
              )}
            </button>
          )}

          <div className="font-orbitron font-extrabold text-[22px] sm:text-[28px] tracking-tighter uppercase text-[#ffb4ab] orbitron-header">
            TITAN ARENA
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-sora text-sm text-on-surface/80 font-semibold">
              {username}
            </span>
            <div className="w-10 h-10 rounded-full border border-[#ffb4ab]/50 overflow-hidden flex items-center justify-center bg-surface-container-highest">
              {profileImg ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profileImg} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[#ffb4ab]">person</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
