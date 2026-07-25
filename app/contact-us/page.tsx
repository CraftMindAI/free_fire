import type { Metadata } from "next";
import ParticleCanvas from "@/app/components/ParticleCanvas";
import ContactFormClient from "./ContactFormClient";

export const metadata: Metadata = {
  title: "Contact Us & Player Support | Titan Arena Gaming",
  description:
    "Get 24/7 player support for Free Fire custom rooms, room credentials, payment processing, or account inquiries via WhatsApp or Email at Titan Arena Gaming.",
  alternates: {
    canonical: "https://titanareanagaming.com/contact-us",
  },
  openGraph: {
    title: "Contact Us & Player Support | Titan Arena Gaming",
    description:
      "Need help with a Free Fire room, payout, or account issue? Reach out to Titan Arena Gaming support directly via WhatsApp or Email.",
    url: "https://titanareanagaming.com/contact-us",
    siteName: "Titan Arena Gaming",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Titan Arena Gaming Support",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Support | Titan Arena Gaming",
    description:
      "Get fast assistance for Free Fire custom room issues, room credentials, and reward withdrawals.",
    images: ["/favicon.ico"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Support | Titan Arena Gaming",
  "url": "https://titanareanagaming.com/contact-us",
  "description": "Direct player support for Titan Arena Gaming custom rooms and tournaments.",
  "mainEntity": {
    "@type": "Organization",
    "name": "Titan Arena Gaming",
    "email": "sankaranvishnupriya@gmail.com",
    "telephone": "+916379102170",
  },
};

export default function ContactUsPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
      {/* Schema.org ContactPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover object-[center_15%]"
          alt="Titan Arena Gaming Customer Support Background"
          aria-hidden="true"
          src="/login.png"
        />
        <ParticleCanvas count={60} />
      </div>

      <section className="pt-36 pb-16 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          Get In Touch
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-6">
          Contact Support
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Need help with a room, payout, or account issue? Reach out to us directly through WhatsApp, Email, or fill out the support form below.
        </p>
      </section>

      <section className="px-6 max-w-[1440px] w-full mx-auto pb-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glass rounded-2xl p-10 md:p-14 h-fit border-t-4 border-crimson">
          <h2 className="font-sora text-2xl md:text-3xl font-bold mb-8">Direct Contact Methods</h2>

          <div className="space-y-6">
            <div>
              <div className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-widest uppercase mb-2">
                WhatsApp Support
              </div>
              <a href="https://wa.me/916379102170" target="_blank" rel="noopener noreferrer" className="text-xl md:text-2xl font-bold hover:text-crimson transition-colors duration-200">
                +91 6379102170
              </a>
              <p className="text-on-surface-variant text-sm mt-1">Available 9:00 AM - 9:00 PM IST (Fastest response)</p>
            </div>

            <div>
              <div className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-widest uppercase mb-2 mt-8">
                Official Email
              </div>
              <a href="mailto:sankaranvishnupriya@gmail.com" className="text-lg md:text-xl font-bold hover:text-crimson transition-colors duration-200">
                sankaranvishnupriya@gmail.com
              </a>
              <p className="text-on-surface-variant text-sm mt-1">Response within 24 hours for official inquiries</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-10 md:p-14 border-t-4 border-crimson">
          <h2 className="font-sora text-2xl md:text-3xl font-bold mb-8">Send a Message</h2>
          <ContactFormClient />
        </div>
      </section>
    </main>
  );
}
