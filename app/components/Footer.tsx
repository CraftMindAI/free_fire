"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TermsModal from "./common/TermsModal";
import PrivacyModal from "./common/PrivacyModal";

const LINKS = [
  "About Us",
  "Contact Us",
  "Privacy Policy",
  "Terms of Service",
  "Discord",
];
const LINK_HREFS: Record<string, string> = {
  "About Us": "/about",
  "Contact Us": "/contact-us",
  "Privacy Policy": "/privacy-policy",
};

export default function Footer() {
  const pathname = usePathname();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Only show footer on public marketing pages; hide on every authenticated route
  const isPublicPage =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/contact-us" ||
    pathname === "/privacy-policy" ||
    pathname === "/v1/auth/login" ||
    pathname === "/v1/auth/register";

  if (!isPublicPage) return null;

  return (
    <>
      <footer className="border-t border-white/[0.08] py-12 px-6 mt-12 bg-transparent backdrop-blur-xs">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link
            href="/"
            className="font-orbitron text-[#ffb4ab] text-xl font-black uppercase tracking-widest"
          >
            TITAN ARENA
          </Link>

          <nav className="flex flex-wrap justify-center gap-8">
            {LINKS.map((link) => {
              if (link === "Terms of Service") {
                return (
                  <button
                    key={link}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsOpen(true);
                    }}
                    className="text-on-surface-variant text-xs font-bold tracking-widest uppercase hover:text-crimson transition-colors duration-200 cursor-pointer"
                  >
                    {link}
                  </button>
                );
              }
              if (link === "Privacy Policy") {
                return (
                  <Link
                    key={link}
                    href="/privacy-policy"
                    className="text-on-surface-variant text-xs font-bold tracking-widest uppercase hover:text-crimson transition-colors duration-200"
                  >
                    {link}
                  </Link>
                );
              }
              return (
                <a
                  key={link}
                  href={LINK_HREFS[link] ?? "#"}
                  className="text-on-surface-variant text-xs font-bold tracking-widest uppercase hover:text-crimson transition-colors duration-200"
                >
                  {link}
                </a>
              );
            })}
          </nav>

          <p className="text-on-surface-variant/50 text-[10px] font-bold tracking-widest uppercase">
            © 2024 Tintan Arena Esports. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </>
  );
}
