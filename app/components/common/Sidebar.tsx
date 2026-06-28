"use client";

import React, { useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import menuIcon from "@/public/assets/menu.png";

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
  const userId = pathUserId || (slug && slug.length > 1 ? slug[1] : slug?.[0]) || "";
  const isMatchDetails = pathname.endsWith("/matches");
  const isDistribution = pathname.endsWith("/distribution");
  const isSettings = pathname.endsWith("/settings");

  const isAdmin = role.toLowerCase() === "admin";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) router.push("/v1/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Define navigation items based on the user's role
  const navItems = isAdmin
    ? [
        { label: "Dashboard", icon: "dashboard", href: `/dashboard/${userId}`, active: !isMatchDetails && !isDistribution && !isSettings },
        { label: "Match Details", icon: "sports_esports", href: `/${userId}/matches`, active: isMatchDetails },
        { label: "Distribution", icon: "groups", href: `/${userId}/distribution`, active: isDistribution },
        { label: "Payment History", icon: "account_balance_wallet", href: `/${userId}/payment-history`, active: pathname.includes("/payment-history") },
        { label: "Settings", icon: "settings", href: `/profile/v1/${userId}/settings`, active: isSettings },
      ]
    : [
        { label: "Dashboard", icon: "dashboard", href: `/${userId}/dashboard/home`, active: pathname.endsWith("/dashboard/home") },
        { label: "Upcoming Matches", icon: "schedule", href: `/${userId}/upcoming-matches`, active: pathname.includes("/upcoming-matches") },
        { label: "My Matches", icon: "sports_esports", href: `/profile/v1/${userId}/my-matches`, active: pathname.includes("/my-matches") },
        { label: "Payment History", icon: "account_balance_wallet", href: `/${userId}/payment-history`, active: pathname.includes("/payment-history") },
        { label: "Settings", icon: "settings", href: `/profile/v1/${userId}/settings`, active: isSettings },
      ];

  return (
    /*
     * Push-layout sidebar — sits in the normal flex flow of the page.
     * Width animates between 0 and 360px; overflow-hidden clips content
     * during the transition so nothing spills outside the sidebar column.
     * No backdrop, no overlay, no dimming of main content.
     */
    <aside
      className={`
        relative flex-shrink-0 overflow-hidden mt-[73px] h-[calc(100vh-73px)] z-40
        transition-[width] duration-300 ease-in-out
        ${isOpen ? "w-[80vw] md:w-[360px]" : "w-0"}
      `}
      aria-hidden={!isOpen}
    >
      {/* Inner panel — fixed visual width so content does not squish during animation */}
      <div className="w-[80vw] md:w-[360px] h-full bg-[#1c1b1b]/95 border-r border-white/5 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Inner Scrollable Container */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto py-10 px-6">

          {/* Brand Header */}
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h2 className="font-orbitron text-[32px] font-bold text-[#ffb4ab] uppercase orbitron-header">
                TITAN
              </h2>
              <p className="text-on-surface-variant font-jetbrains text-xs tracking-wider uppercase">
                {isAdmin ? "Admin Console" : "Player Console"}
              </p>
            </div>
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
      </div>
    </aside>
  );
}
