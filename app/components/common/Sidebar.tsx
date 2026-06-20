"use client";

import React, { useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import menuIcon from "@/app/assests/menu.png";

interface SidebarProps {
  role?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function Sidebar({
  role = "player",
  isOpen = false,
  onClose,
  onOpen,
}: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const slug = params?.slug as string[] | undefined;
  const pathUserId = params?.userId as string | undefined;
  const userId = pathUserId || slug?.[0] || "";
  const isMatchDetails = pathname.endsWith("/matches");
  const isDistribution = pathname.endsWith("/distribution");

  const isAdmin = role.toLowerCase() === "admin";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Define navigation items based on the user's role
  const navItems = isAdmin
    ? [
        { label: "Dashboard", icon: "dashboard", href: `/dashboard/${userId}`, active: !isMatchDetails && !isDistribution },
        { label: "Match Details", icon: "sports_esports", href: `/${userId}/matches`, active: isMatchDetails },
        { label: "Distribution", icon: "groups", href: `/${userId}/distribution`, active: isDistribution },
        { label: "Payment History", icon: "account_balance_wallet", href: "#" },
        { label: "Settings", icon: "settings", href: "#" },
      ]
    : [
        { label: "Dashboard", icon: "dashboard", href: `/dashboard/player/${userId}`, active: true },
        { label: "Upcoming Matches", icon: "schedule", href: "#" },
        { label: "My Matches", icon: "sports_esports", href: "#" },
        { label: "Payment History", icon: "account_balance_wallet", href: "#" },
        { label: "Settings", icon: "settings", href: "#" },
      ];

  const handleToggle = () => {
    if (isOpen && onClose) {
      onClose();
    } else if (!isOpen && onOpen) {
      onOpen();
    }
  };

  return (
    <>
      {/* Semi-transparent Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed left-0 top-[73px] w-full h-[calc(100vh-73px)] bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over Panel (Offcanvas Sidebar) */}
      <aside
        className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] w-[80vw] md:w-[360px] z-50 bg-[#1c1b1b]/95 border-r border-white/5 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 rounded-r-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Floating Circular Toggle Button (Centered vertically on the left side) */}
        <button
          onClick={handleToggle}
          className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-[#ffb4ab]/20 hover:border-[#ffb4ab]/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,46,46,0.2)] cursor-pointer"
          aria-label={isOpen ? "Close sidebar menu" : "Open sidebar menu"}
        >
          {isOpen ? (
            <span className="material-symbols-outlined text-[24px] text-[#ffb4ab] rotate-90 transition-transform duration-300">
              close
            </span>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={menuIcon.src}
              alt="Menu"
              className="w-6 h-6 object-contain transition-transform duration-300"
            />
          )}
        </button>

        {/* Inner Scrollable Container */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto py-10 px-6">
          {/* Brand Header */}
          <div className="mb-10">
            <h2 className="font-orbitron text-[32px] font-bold text-[#ffb4ab] uppercase orbitron-header">
              TITAN
            </h2>
            <p className="text-on-surface-variant font-jetbrains text-xs tracking-wider uppercase">
              {isAdmin ? "Admin Console" : "Player Console"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item, index) => {
              const isActive = item.active;
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`px-4 py-3 flex items-center gap-3 rounded-lg hover:translate-x-1 transition-transform ${
                    isActive
                      ? "bg-[#ff544a] text-[#5c0004] border-l-4 border-[#ffb4ab] font-semibold"
                      : "text-on-surface-variant hover:bg-[#353534]/50"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-sora text-sm">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="pt-6 border-t border-white/5 mt-auto">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-950/20 text-[#ffb4ab] border border-[#ffb4ab]/20 hover:bg-red-950/40 transition-all group disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">
                logout
              </span>
              <span className="font-jetbrains text-xs tracking-widest font-semibold">
                {loggingOut ? "LOGGING OUT..." : "LOGOUT"}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
