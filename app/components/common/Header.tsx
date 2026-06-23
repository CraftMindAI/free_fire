"use client";

import React from "react";

interface HeaderProps {
  username?: string;
  profileImg?: string;
}

export default function Header({ username = "Admin", profileImg }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(255,46,46,0.2)]">
      <div className="flex justify-between items-center px-6 py-4 mx-auto w-full">
        <div className="flex items-center gap-3">
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
                <span className="material-symbols-outlined text-[#ffb4ab]">
                  person
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
