"use client";
import Link from "next/link";
export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10">
      <div className="flex justify-between items-center px-6 py-4 max-w-[1440px] mx-auto">

        <span className="font-orbitron text-crimson text-2xl font-black uppercase tracking-tighter">
          Free Fire
        </span>

        <div className="flex items-center gap-6">
          <Link href="/login"><button className="font-orbitron text-on-surface text-xs font-bold tracking-widest uppercase
                              hover:text-crimson transition-colors duration-200">
            Login
          </button>
          </Link>
          <Link href="/register">
          <button className="font-orbitron text-sm font-bold text-white uppercase tracking-wider
                              bg-crimson px-6 py-2 rounded-lg
                              hover:opacity-90 active:scale-95 transition-all duration-200
                              shadow-[0_0_14px_rgba(255,46,46,0.3)]">
            Signup
          </button>
          </Link>
          
        </div>

      </div>
    </header>
  );
}
