"use client";

import { useState } from "react";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: "success" | "error" | null, text: string}>({ type: null, text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, text: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: "Message sent successfully!" });
        setForm({ name: "", email: "", mobile: "", message: "" });
      } else {
        setStatus({ type: "error", text: data.error || "Failed to send message." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
      {/* Cinematic background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover object-[center_15%]"
          alt=""
          aria-hidden="true"
          src="/login.png"
        />
        <ParticleCanvas count={60} />
      </div>

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          Get In Touch
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-6">
          Contact Support
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Need help with a room, payout, or account issue? Reach out to us directly through WhatsApp, Email, or fill out the form below.
        </p>
      </section>

      {/* Contact Info & Form */}
      <section className="px-6 max-w-[1440px] w-full mx-auto pb-24 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Contact Details */}
        <div className="glass rounded-2xl p-10 md:p-14 h-fit border-t-4 border-crimson">
          <h2 className="font-sora text-2xl md:text-3xl font-bold mb-8">Direct Contact</h2>

          <div className="space-y-6">
            <div>
              <div className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-widest uppercase mb-2">
                WhatsApp
              </div>
              <a href="https://wa.me/YOUR_NUMBER_HERE" target="_blank" rel="noopener noreferrer" className="text-xl md:text-2xl font-bold hover:text-crimson transition-colors duration-200">
                +91 6379102170
              </a>
              <p className="text-on-surface-variant text-sm mt-1">Available 9AM - 9PM IST</p>
            </div>

            <div>
              <div className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-widest uppercase mb-2 mt-8">
                Email
              </div>
              <a href="mailto:sankaranvishnupriya@gmail.com" className="text-lg md:text-xl font-bold hover:text-crimson transition-colors duration-200">
                sankaranvishnupriya@gmail.com
              </a>
              <p className="text-on-surface-variant text-sm mt-1">Usually responds within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass rounded-2xl p-10 md:p-14 border-t-4 border-crimson">
          <h2 className="font-sora text-2xl md:text-3xl font-bold mb-8">Send a Message</h2>

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
              <label htmlFor="message" className="block text-sm font-bold text-on-surface-variant mb-2">Message</label>
              <textarea
                id="message"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full bg-black/30 border border-white/10 rounded-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all duration-200 resize-none"
              ></textarea>
            </div>

            {status.type && (
              <div className={`p-4 rounded-md text-sm font-bold border ${status.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-crimson/10 border-crimson text-crimson"}`}>
                {status.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-orbitron text-sm font-bold text-white uppercase tracking-wider bg-crimson px-6 py-4 rounded-md hover:bg-crimson/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

      </section>
    </main>
  );
}
