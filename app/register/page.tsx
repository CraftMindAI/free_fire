"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormState {
  username: string;
  playerId: string;
  email: string;
  phone: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

const EMPTY: FormState = {
  username: "",
  playerId: "",
  email: "",
  phone: "",
  whatsapp: "",
  password: "",
  confirmPassword: "",
  agreed: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.agreed) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          player_id: form.playerId,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#1e1e22] border border-white/[0.08] rounded-lg px-4 py-3 " +
    "text-on-surface placeholder:text-white/20 font-sora text-sm " +
    "focus:outline-none focus:border-crimson/60 focus:shadow-[0_0_0_3px_rgba(255,46,46,0.1)] " +
    "transition-all duration-200";

  const labelClass =
    "block font-jetbrains text-[10px] tracking-[0.2em] text-on-surface-variant uppercase mb-2";

  return (
    <div className="min-h-screen w-full flex bg-[#0e0e0e]">

      {/* ── LEFT: hero panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/signup-hero.png"
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
          <div className="flex items-center gap-2 w-fit bg-black/40 backdrop-blur-sm
                          border border-white/10 rounded-full px-4 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#ffb4ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <span className="font-jetbrains text-[10px] tracking-[0.25em] text-[#ffb4ab] uppercase">
              Elite Tournament Series
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-orbitron font-black uppercase leading-[0.88] tracking-tight mb-6">
              <span className="block text-white neon-red
                               text-[3rem] xl:text-[4.2rem]">
                Become a
              </span>
              <span className="block text-[#ffb4ab] italic
                               text-[3.5rem] xl:text-[5rem]
                               [text-shadow:0_0_40px_rgba(255,180,171,0.5)]">
                Champion
              </span>
            </h1>
            <p className="font-sora text-white/60 text-sm xl:text-base max-w-sm leading-relaxed">
              Join the arena where legends are born. Compete in
              high-stakes tournaments and claim your glory in the
              ultimate battleground.
            </p>

            {/* Stats */}
            <div className="flex gap-12 mt-10">
              {[
                { value: "$2.5M+", label: "Prize Pool" },
                { value: "500K+", label: "Active Titans" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-orbitron font-black text-3xl text-[#ffb4ab]
                                 [text-shadow:0_0_20px_rgba(255,180,171,0.4)]">
                    {s.value}
                  </p>
                  <p className="font-jetbrains text-[10px] tracking-[0.25em] text-white/40 uppercase mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom watermark */}
          <p className="font-orbitron font-black text-[6rem] xl:text-[8rem] text-white/[0.04]
                         leading-none select-none tracking-tighter">
            A
          </p>
        </div>
      </div>

      {/* ── RIGHT: form panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[500px]">

          {/* Card */}
          <div className="bg-[#181820] border border-crimson/40 rounded-2xl p-8 xl:p-10
                          shadow-[0_0_60px_rgba(255,46,46,0.08)]">

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-orbitron font-black text-2xl xl:text-3xl text-[#ffb4ab] uppercase tracking-tight">
                Titan Arena
              </h2>
              <div className="w-16 h-0.5 bg-crimson mx-auto mt-3
                              shadow-[0_0_8px_rgba(255,46,46,0.6)]" />
            </div>

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

              {/* Row 1: Username + Player ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Player Name</label>
                  <input
                    type="text"
                    placeholder="GamerTagX"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Player ID</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={form.playerId}
                    onChange={(e) => set("playerId", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 2: Email */}
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  placeholder="titan@arena.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Row 3: Phone + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                    className={inputClass + " pr-16"}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                               font-jetbrains text-[9px] tracking-widest text-white/30
                               hover:text-white/60 uppercase transition-colors">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    required
                    className={inputClass + " pr-16"}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                               font-jetbrains text-[9px] tracking-widest text-white/30
                               hover:text-white/60 uppercase transition-colors">
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none mt-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={form.agreed}
                  onClick={() => set("agreed", !form.agreed)}
                  className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0
                               transition-all duration-200
                               ${form.agreed
                                 ? "bg-crimson border-crimson shadow-[0_0_8px_rgba(255,46,46,0.5)]"
                                 : "bg-transparent border-white/20 hover:border-crimson/50"}`}
                >
                  {form.agreed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span className="font-sora text-sm text-on-surface-variant leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-[#ffb4ab] hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-[#ffb4ab] hover:underline">Privacy Policy</a>
                  {" "}of Titan Arena.
                </span>
              </label>

              {/* Error */}
              {error && (
                <p className="font-jetbrains text-[11px] tracking-widest text-crimson uppercase
                              text-center border border-crimson/30 rounded-lg px-4 py-2.5 bg-crimson/5">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-1 rounded-xl
                           font-orbitron font-bold text-base uppercase tracking-[0.15em]
                           bg-crimson text-white
                           hover:bg-crimson/90 hover:shadow-[0_0_32px_rgba(255,46,46,0.5)]
                           active:scale-[0.98] transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed
                           flex items-center justify-center gap-3"
              >
                {loading ? "Creating Account…" : (
                  <>
                    Create Account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="font-sora text-sm text-on-surface-variant text-center mt-6">
              Already have an account?{" "}
              <Link href="/login"
                className="text-[#ffb4ab] font-semibold hover:text-[#ffb4ab]/80 transition-colors uppercase tracking-wider">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
