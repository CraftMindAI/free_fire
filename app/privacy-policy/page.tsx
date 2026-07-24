import type { Metadata } from "next";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export const metadata: Metadata = {
  title: "Privacy Policy — Titan Arena",
  description:
    "Read the Privacy Policy for Titan Arena, detailing how we collect, use, and protect your personal data.",
};

const SECTIONS = [
  {
    id: "data-collection",
    title: "1. Data Collection",
    content:
      "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, and in-game ID.",
  },
  {
    id: "use-of-information",
    title: "2. How We Use Information",
    content:
      "We use the information we collect to provide, maintain, and improve our services, such as to facilitate match tracking, process prize payouts, and authenticate users.",
  },
  {
    id: "information-sharing",
    title: "3. Information Sharing",
    content:
      "We may share your information with our partners for the purpose of facilitating the tournaments and payouts. We do not sell your personal data to third parties.",
  },
  {
    id: "security",
    title: "4. Security",
    content:
      "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.",
  },
  {
    id: "contact-us",
    title: "5. Contact Us",
    content:
      "If you have any questions about this Privacy Policy, please contact us at sankaranvishnupriya@gmail.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
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

      {/* Hero Header */}
      <section className="pt-36 pb-12 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          Legal & Transparency
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-4 text-white">
          Privacy Policy
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Your privacy matters to us. Learn how we handle, protect, and use your personal information across Titan Arena.
        </p>
      </section>

      {/* Main Content Card */}
      <section className="px-6 max-w-[1000px] w-full mx-auto pb-24">
        <div className="glass rounded-2xl p-8 md:p-14 border-t-4 border-crimson shadow-2xl space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <span className="font-jetbrains text-xs text-[#ffb4ab] tracking-widest uppercase">
              Titan Arena Esports
            </span>
            <span className="font-jetbrains text-xs text-on-surface-variant/60 uppercase">
              Last Updated: July 2026
            </span>
          </div>

          <div className="space-y-8 font-sora text-on-surface-variant text-sm md:text-base leading-relaxed">
            {SECTIONS.map((section) => (
              <div key={section.id} className="space-y-3">
                <h2 className="text-white font-orbitron font-bold text-lg md:text-xl tracking-wide">
                  {section.title}
                </h2>
                <p className="text-on-surface-variant/90">{section.content}</p>
                
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
