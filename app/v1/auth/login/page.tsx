"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ParticleCanvas from "@/app/components/ParticleCanvas";
import ForgotAccessModal from "@/app/components/auth/ForgotAccessModal";
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed.");
      } else {
        // Convert user name to binary and use as route
        console.log(data.user);
        const name = data.user?.name as string;
        const role = data.user?.role as string;

        if (!name || !role) {
          toast.error("User data is incomplete.");
          setLoading(false);
          return;
        }

        toast.success("Login successful");
        if (role.toLowerCase() === "admin") {
          router.push(`/profile/v2/dashboard/${data.user.encryptedId}/home`);
        } else {
          router.push(`/profile/v1/${data.user.encryptedId}/dashboard/home`);
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0e0e0e] overflow-hidden">
      {/* ── LEFT: hero panel ─────────────────────────────── */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center
                     animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
        />

        {/* Subtle dark edge on the right so it blends into the gap */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* TITAN ARENA text */}
        <div className="absolute bottom-16 left-10 xl:left-14">
          <h1
            className="font-orbitron font-black uppercase leading-[0.85] tracking-tight
                         text-[4.5rem] xl:text-[5.5rem] text-[#ffb4ab]"
            style={{ textShadow: "0 0 60px rgba(255,180,171,0.3)" }}
          >
            TITAN
            <br />
            ARENA
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-px bg-[#ffb4ab]/50" />
            <p className="font-jetbrains text-[11px] tracking-[0.25em] text-[#ffb4ab]/70 uppercase">
              Pre-Combat Protocol
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: form panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <ParticleCanvas count={60} />
        {/* Centered card */}
        <div className="w-full max-w-[420px] mt-16">
          {/* Card */}
          <div
            className="bg-white/[0.03] backdrop-blur-[20px] border border-crimson/30 rounded-2xl p-8 xl:p-10
                        shadow-[0_0_60px_rgba(255,46,46,0.08)]"
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-sora font-bold text-3xl text-on-surface mb-2 leading-tight">
                Initialize Link
              </h2>
              <p className="font-sora text-on-surface-variant text-sm leading-relaxed">
                Connect your neural interface to enter the arena.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* ID Entifier */}
              <div className="flex flex-col gap-2">
                <label className="font-jetbrains text-[10px] tracking-[0.22em] text-on-surface-variant uppercase">
                  Email, Phone, or Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-base select-none">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="email, phone, or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full bg-[#1e1e22] border border-white/[0.06] border-b-2 border-b-crimson/50 rounded-lg
                               pl-11 pr-4 py-3.5
                               text-on-surface placeholder:text-white/25 font-sora text-sm
                               focus:outline-none focus:border-white/[0.06] focus:border-b-2 focus:border-b-crimson
                               focus:shadow-[0_0_0_3px_rgba(255,46,46,0.08)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Security Token */}
              <div className="flex flex-col gap-2">
                <label className="font-jetbrains text-[10px] tracking-[0.22em] text-on-surface-variant uppercase">
                  Security Token
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-base select-none">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#1e1e22] border border-white/[0.06] border-b-2 border-b-crimson/50 rounded-lg
                               pl-11 pr-4 py-3.5
                               text-on-surface placeholder:text-white/25 font-sora text-sm
                               focus:outline-none focus:border-white/[0.06] focus:border-b-2 focus:border-b-crimson
                               focus:shadow-[0_0_0_3px_rgba(255,46,46,0.08)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Remember + Forgot row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={remember}
                    onClick={() => setRemember((v) => !v)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0
                                 transition-all duration-200
                                 ${
                                   remember
                                     ? "bg-[#ffb4ab] border-[#ffb4ab]"
                                     : "bg-transparent border-white/25 hover:border-white/50"
                                 }`}
                  >
                    {remember && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path
                          d="M1 3L3 5L7 1"
                          stroke="#690005"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="font-jetbrains text-[10px] tracking-[0.18em] text-on-surface-variant uppercase">
                    Remember Log
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="font-jetbrains text-[10px] tracking-[0.18em] text-on-surface-variant
                             hover:text-[#ffb4ab] uppercase transition-colors"
                >
                  Forgot Access?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 mt-1 rounded-xl
                           font-orbitron font-bold text-base uppercase tracking-[0.2em]
                           bg-[#ffb4ab] text-[#690005]
                           hover:bg-[#ffc5bd] hover:shadow-[0_0_32px_rgba(255,180,171,0.4)]
                           active:scale-[0.98] transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? "Authenticating…" : "Login"}
              </button>
            </form>

            {/* Create account */}
            <div className="mt-8 text-center">
              <p className="font-sora text-sm text-on-surface-variant mb-3">
                No active squad detected?
              </p>
              <Link
                href="/v1/auth/register"
                className="font-jetbrains text-[11px] tracking-[0.2em] text-on-surface uppercase
                           hover:text-[#ffb4ab] transition-colors inline-flex items-center gap-2"
              >
                Create Account
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="font-jetbrains text-[9px] tracking-[0.2em] text-white/20 uppercase">
              V4.2.0-Stable
            </span>
            <div className="w-px h-3 bg-white/10" />
            <span className="font-jetbrains text-[9px] tracking-[0.2em] text-white/20 uppercase">
              Secure Transmission Encrypted
            </span>
          </div>
        </div>
      </div>

      {isForgotModalOpen && (
        <ForgotAccessModal onClose={() => setIsForgotModalOpen(false)} />
      )}
    </div>
  );
}
