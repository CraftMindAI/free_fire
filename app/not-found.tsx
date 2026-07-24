"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <main className="relative flex flex-col min-h-[85vh] items-center justify-center bg-transparent text-[#e5e2e1] px-6 overflow-x-hidden">
      {/* Cinematic background matching landing page */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover object-[center_20%] opacity-40 bg-blend-overlay"
          alt=""
          aria-hidden="true"
          src="/card2.jpg"
        />
        <ParticleCanvas count={60} />
      </div>

      {/* Glass Card Container */}
      <div className="glass rounded-2xl p-8 md:p-14 max-w-lg w-full text-center border-t-4 border-crimson shadow-2xl space-y-6">
        <div className="font-jetbrains text-xs text-[#ffb4ab] tracking-[0.3em] uppercase">
          SIGNAL LOST
        </div>

        <h1 className="font-orbitron text-3xl md:text-5xl font-black uppercase tracking-wide text-white">
          Page Not Available
        </h1>

        <p className="font-sora text-on-surface-variant text-sm md:text-base leading-relaxed">
          The requested page or resource is not available or does not exist.
        </p>

        {/* Countdown Badge */}
        <div className="py-3 px-6 rounded-xl bg-crimson/10 border border-crimson/30 inline-block">
          <p className="font-jetbrains text-xs md:text-sm text-[#ffb4ab] tracking-wider">
            Redirecting to home in <span className="font-bold text-white text-base">{countdown}</span> seconds...
          </p>
        </div>

        {/* Home Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 font-orbitron text-xs font-bold text-white uppercase tracking-widest bg-crimson px-8 py-4 rounded-md hover:bg-crimson/90 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(255,46,46,0.4)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Return To Home Now
          </Link>
        </div>
      </div>
    </main>
  );
}
