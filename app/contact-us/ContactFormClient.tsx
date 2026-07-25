"use client";

import { useState } from "react";
import { useToast } from "@/app/components/common/Toast";

export default function ContactFormClient() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Message Sent", "We have received your message and will respond shortly.");
        setForm({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error("Send Failed", data.error || "Failed to send message.");
      }
    } catch (err) {
      toast.error("Error Occurred", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-on-surface-variant mb-2">Name</label>
        <input
          type="text"
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your Name"
          className="w-full bg-black/30 border border-white/10 rounded-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block text-sm font-bold text-on-surface-variant mb-2">Mobile Number</label>
        <input
          type="tel"
          id="mobile"
          required
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          placeholder="+91 7428730111"
          className="w-full bg-black/30 border border-white/10 rounded-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-bold text-on-surface-variant mb-2">Email Address</label>
        <input
          type="email"
          id="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          className="w-full bg-black/30 border border-white/10 rounded-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all duration-200"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="message" className="block text-sm font-bold text-on-surface-variant">Message</label>
          <span className="text-xs text-on-surface-variant/60">{form.message.length}/250</span>
        </div>
        <textarea
          id="message"
          rows={5}
          required
          maxLength={250}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 250) })}
          placeholder="How can we help you? (max 250 characters)"
          className="w-full bg-black/30 border border-white/10 rounded-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all duration-200 resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full font-orbitron text-sm font-bold text-white uppercase tracking-wider bg-crimson px-6 py-4 rounded-md hover:bg-crimson/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
