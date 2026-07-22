"use client";

import { useState } from "react";
import { toast } from 'react-toastify';

interface ForgotAccessModalProps {
  onClose: () => void;
}

export default function ForgotAccessModal({ onClose }: ForgotAccessModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 data
  const [username, setUsername] = useState("");
  const [PalyerId, setPlayerId] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 data
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, PalyerId, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed.");
      } else {
        setResetToken(data.token);
        setStep(2);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update password.");
      } else {
        toast.success("Password updated successfully. You can now login.");
        onClose();
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e22] border border-crimson/30 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="font-sora font-bold text-2xl text-on-surface mb-2">
          {step === 1 ? "Verify Identity" : "Reset Password"}
        </h2>
        <p className="font-sora text-sm text-on-surface-variant mb-6">
          {step === 1
            ? "Enter your account details to recover access."
            : "Create a new password for your account."}
        </p>

        {step === 1 ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label className="font-jetbrains text-[10px] tracking-widest text-on-surface-variant uppercase mb-1 block">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="font-jetbrains text-[10px] tracking-widest text-on-surface-variant uppercase mb-1 block">
                Player Id
              </label>
              <input
                type="text"
                required
                value={PalyerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="w-full bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors"
                placeholder="Enter your PalyerId"
              />
            </div>
            <div>
              <label className="font-jetbrains text-[10px] tracking-widest text-on-surface-variant uppercase mb-1 block">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-crimson text-white font-orbitron font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-crimson/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Next"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <label className="font-jetbrains text-[10px] tracking-widest text-on-surface-variant uppercase mb-1 block">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="font-jetbrains text-[10px] tracking-widest text-on-surface-variant uppercase mb-1 block">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-crimson focus:outline-none transition-colors"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[#ffb4ab] text-[#690005] font-orbitron font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-[#ffc5bd] transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
