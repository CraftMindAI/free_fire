"use client";
import { usePathname } from "next/navigation";

const LINKS = ["Privacy Policy", "Terms of Service", "Support", "Discord"];

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on authenticated routes
  const isDashboard = pathname.includes("/dashboard") || 
                      pathname.includes("/upcoming-matches") || 
                      pathname.includes("/settings") || 
                      pathname.includes("/distribution") || 
                      pathname.includes("/matches");
                      
  if (isDashboard) return null;

  return (
    <footer className="border-t border-white/5 py-12 px-6 mt-12 bg-[#0e0e0e]">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

        <span className="font-orbitron text-[#ffb4ab] text-xl font-black uppercase tracking-widest">
          TITAN ARENA
        </span>

        <nav className="flex flex-wrap justify-center gap-8">
          {LINKS.map((link) => (
            <a key={link} href="#"
              className="text-on-surface-variant text-xs font-bold tracking-widest uppercase
                          hover:text-crimson transition-colors duration-200">
              {link}
            </a>
          ))}
        </nav>

        <p className="text-on-surface-variant/50 text-[10px] font-bold tracking-widest uppercase">
          © 2024 Free Fire Esports. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
}
