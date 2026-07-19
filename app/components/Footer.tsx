"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import TermsModal from "./common/TermsModal";
import PrivacyModal from "./common/PrivacyModal";

const LINKS = ["About Us", "Contact Us", "Privacy Policy", "Terms of Service", "Discord"];
const LINK_HREFS: Record<string, string> = {
  "About Us": "/about",
  "Contact Us": "/contact",
};

export default function Footer() {
  const pathname = usePathname();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Hide footer on authenticated routes
  const isDashboard = pathname.includes("/dashboard") ||
    pathname.includes("/upcoming-matches") ||
    pathname.includes("/settings") ||
    pathname.includes("/distribution") ||
    pathname.includes("/matches");

  if (isDashboard) return null;

  return (
    <>
      <footer className="border-t border-white/5 py-12 px-6 mt-12 bg-[#0e0e0e]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

          <span className="font-orbitron text-[#ffb4ab] text-xl font-black uppercase tracking-widest">
            TITAN ARENA
          </span>

          <nav className="flex flex-wrap justify-center gap-8">
            {LINKS.map((link) => {
              if (link === "Terms of Service" || link === "Privacy Policy") {
                return (
                  <button 
                    key={link} 
                    onClick={(e) => {
                      e.preventDefault();
                      if (link === "Terms of Service") setIsTermsOpen(true);
                      if (link === "Privacy Policy") setIsPrivacyOpen(true);
                    }}
                    className="text-on-surface-variant text-xs font-bold tracking-widest uppercase hover:text-crimson transition-colors duration-200"
                  >
                    {link}
                  </button>
                );
              }
              return (
                <a key={link} href={LINK_HREFS[link] ?? "#"}
                  className="text-on-surface-variant text-xs font-bold tracking-widest uppercase hover:text-crimson transition-colors duration-200">
                  {link}
                </a>
              );
            })}
          </nav>

          <p className="text-on-surface-variant/50 text-[10px] font-bold tracking-widest uppercase">
            © 2024 Free Fire Esports. All Rights Reserved.
          </p>

        </div>
      </footer>

      {/* Modals */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}
