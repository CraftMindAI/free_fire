"use client";

import { useState } from "react";
import { PROFILE_IMAGES } from "@/app/data/profile";
interface FormState {
  username: string;
  playerId: string;
  email: string;
  phone: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
  role?: string;
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

interface RegisterFormProps {
  role: "player" | "admin";
  mode?: "create" | "edit";
  initialData?: Partial<FormState>;
  adminId?: string;
  onSuccess?: (userData?: any) => void;
}

export default function RegisterForm({ role, mode = "create", initialData, adminId, onSuccess }: RegisterFormProps) {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === "edit" && initialData) {
      return { ...EMPTY, ...initialData, agreed: true };
    }
    return EMPTY;
  });
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

    if (mode === "create" && role !== "admin" && !form.agreed) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }
    if (form.password || mode === "create") {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (form.password.length > 0 && form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === "edit" 
        ? `/api/admin/${adminId}` 
        : (role === "admin" ? "/api/admin/invite" : "/api/auth/register");
      
      const method = mode === "edit" ? "PUT" : "POST";

      const payload: any = {
        username: form.username,
        player_id: form.playerId,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        role: form.role || role,
      };

      if (form.password) {
        payload.password = form.password;
        payload.confirmPassword = form.confirmPassword;
      }

      if (mode === "create") {
        payload.profile_img = PROFILE_IMAGES[Math.floor(Math.random() * PROFILE_IMAGES.length)];
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Operation failed.");
      } else {
        if (onSuccess) {
          onSuccess(data);
        }
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
    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
      {/* Row 1: Username + Player ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{role === "admin" ? "Admin Name / Alias" : "Player Name"}</label>
          <input
            type="text"
            placeholder={role === "admin" ? "Admin123" : "GamerTagX"}
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

      {/* Role (Edit Admin Only) */}
      {mode === "edit" && role === "admin" && (
        <div>
          <label className={labelClass}>Role</label>
          <select
            value={form.role || "admin"}
            onChange={(e) => set("role", e.target.value)}
            className={inputClass}
          >
            <option value="admin">Admin</option>
            <option value="player">Player</option>
          </select>
        </div>
      )}

      {/* Password Fields (Only in Create Mode) */}
      {mode === "create" && (
        <>
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
                           hover:text-white/60 uppercase transition-colors cursor-pointer">
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

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
                           hover:text-white/60 uppercase transition-colors cursor-pointer">
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Terms checkbox */}
      {mode === "create" && role !== "admin" && (
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
      )}

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
                   flex items-center justify-center gap-3 cursor-pointer"
      >
        {loading ? (mode === "edit" ? "Updating..." : (role === "admin" ? "Adding Admin..." : "Creating Account…")) : (
          <>
            {mode === "edit" ? "Update Details" : (role === "admin" ? "Add Admin" : "Create Account")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
