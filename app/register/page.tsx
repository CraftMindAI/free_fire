"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import RegisterForm from "@/app/components/auth/RegisterForm";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex bg-[#0e0e0e]">
      {/* ── LEFT: hero panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/register.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-top
                     animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 xl:px-16 py-12">
          {/* Badge */}
          <div
            className="flex items-center gap-2 w-fit bg-black/40 backdrop-blur-sm
                          border border-white/10 rounded-full px-4 py-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffb4ab"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
            <span className="font-jetbrains text-[10px] tracking-[0.25em] text-[#ffb4ab] uppercase">
              Elite Tournament Series
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-orbitron font-black uppercase leading-[0.88] tracking-tight mb-6">
              <span
                className="block text-white neon-red
                               text-[3rem] xl:text-[4.2rem]"
              >
                Become a
              </span>
              <span
                className="block text-[#ffb4ab] italic
                               text-[3.5rem] xl:text-[5rem]
                               [text-shadow:0_0_40px_rgba(255,180,171,0.5)]"
              >
                Champion
              </span>
            </h1>
            <p className="font-sora text-white text-sm xl:text-base max-w-sm leading-relaxed">
              Join the arena where legends are born. Compete in high-stakes
              tournaments and claim your glory in the ultimate battleground.
            </p>

            {/* Stats */}
            <div className="flex gap-12 mt-10">
              {[
                { value: "$2.5M+", label: "Prize Pool" },
                { value: "500K+", label: "Active Titans" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="font-orbitron font-black text-3xl text-white
                                 [text-shadow:0_0_20px_rgba(255,180,171,0.4)]"
                  >
                    {s.value}
                  </p>
                  <p className="font-jetbrains text-[10px] tracking-[0.25em] text-white uppercase mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom watermark */}
          <p
            className="font-orbitron font-black text-[6rem] xl:text-[8rem] text-white/[0.04]
                         leading-none select-none tracking-tighter"
          >
            A
          </p>
        </div>
      </div>

      {/* ── RIGHT: form panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto relative">
        <ParticleCanvas count={60} />
        <div className="w-full max-w-[500px]">
          {/* Card */}
          <div
            className="bg-white/[0.03] backdrop-blur-[20px] border border-crimson/30 rounded-2xl p-8 xl:p-10
                          shadow-[0_0_60px_rgba(255,46,46,0.08)]"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-orbitron font-black text-2xl xl:text-3xl text-[#ffb4ab] uppercase tracking-tight">
                Titan Arena
              </h2>
              <div
                className="w-16 h-0.5 bg-crimson mx-auto mt-3
                              shadow-[0_0_8px_rgba(255,46,46,0.6)]"
              />
            </div>

            {/* Form */}
            <RegisterForm
              role="player"
              onSuccess={() => router.push("/login")}
            />

            {/* Login link */}
            <p className="font-sora text-sm text-on-surface-variant text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#ffb4ab] font-semibold hover:text-[#ffb4ab]/80 transition-colors uppercase tracking-wider"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
