"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
  // Hide navbar on authenticated routes (dashboard, upcoming matches, etc.)
  const isDashboard = pathname.includes("/dashboard") || 
                      pathname.includes("/upcoming-matches") || 
                      pathname.includes("/settings") || 
                      pathname.includes("/distribution") || 
                      pathname.includes("/matches");
                      
  const isAuthPage = pathname === "/v1/auth/login" || pathname === "/v1/auth/register";
                      
  if (isDashboard || isAuthPage) return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-transparent  backdrop-blur-xs border-b border-white/[0.08]">
      <div className="flex justify-between items-center px-6 py-4 max-w-[1440px] mx-auto">
        <span className="font-orbitron text-[#ffb4ab] text-xl font-black uppercase tracking-widest">
          TITAN ARENA
        </span>

        <div className="flex items-center gap-6">
          <Link
            href="/v1/auth/login"
            className="font-orbitron text-white text-xs font-bold tracking-[0.18em] uppercase
                       hover:text-[#ffb4ab] transition-colors duration-200"
          >
            LOGIN
          </Link>
          <Link
            href="/v1/auth/register"
            className="font-orbitron text-sm font-bold text-white uppercase tracking-wider
                       bg-crimson px-6 py-2 rounded-md
                       hover:bg-crimson/90 active:scale-95 transition-all duration-200"
          >
            SIGNUP
          </Link>
        </div>
      </div>
    </header>
  );
}
