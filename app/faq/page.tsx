import type { Metadata } from "next";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Titan Arena Gaming",
  description:
    "Find answers to common questions about Titan Arena Gaming: joining Free Fire custom rooms, tournament rules, cash prize distribution, anti-cheat security, and registration.",
  alternates: {
    canonical: "https://titanareanagaming.com/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | Titan Arena Gaming",
    description:
      "Find answers to common questions about Titan Arena Gaming: joining Free Fire custom rooms, tournament rules, cash prize distribution, anti-cheat security, and registration.",
    url: "https://titanareanagaming.com/faq",
    siteName: "Titan Arena Gaming",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Titan Arena Gaming Emblem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Titan Arena Gaming",
    description:
      "Learn how to join Free Fire custom rooms, enter cash tournaments, receive room credentials, and withdraw winnings on Titan Arena Gaming.",
    images: ["/favicon.ico"],
  },
  keywords: [
    "Titan Arena FAQ",
    "Free Fire Custom Room Help",
    "How to Join Free Fire Tournament",
    "Free Fire Room ID Password Help",
    "Free Fire Cash Payout FAQ",
    "Free Fire Esports Questions",
  ],
};

const FAQS = [
  {
    question: "What is Titan Arena Gaming?",
    answer:
      "Titan Arena Gaming is India's leading esports platform for Free Fire custom rooms and tournaments. Players can join Solo, Duo, and Squad matches, track real-time match statistics, and win instant cash prizes in a fair, cheat-free environment.",
  },
  {
    question: "How do I join a Free Fire custom room?",
    answer:
      "Create a free account or log in to Titan Arena Gaming, browse the 'Upcoming Rooms' section on your dashboard, select your preferred match format (Solo, Duo, or Squad), and click 'Join Room'. Once confirmed, the Room ID & Password will be delivered directly to your dashboard prior to match start time.",
  },
  {
    question: "How are tournament cash prizes distributed?",
    answer:
      "Once a match concludes and final scores are verified by match referees, cash rewards are automatically credited to the winner's account balance. You can withdraw your winnings instantly using supported payment methods with zero hidden fees.",
  },
  {
    question: "Is the platform fair and anti-cheat protected?",
    answer:
      "Yes. Fair play is our highest priority. All custom rooms undergo strict anti-cheat monitoring, spectator recording, and referee checks. Any player caught using hacks, third-party scripts, or collusion will be permanently banned and forfeit all earnings.",
  },
  {
    question: "How do Free Fire tournaments work on Titan Arena Gaming?",
    answer:
      "Tournaments run daily across multiple formats including Solo Battle Royale, Duo, and Squad Arena. Matches follow official Free Fire tournament points tables based on placement and kill points. Final standings are displayed live on the platform leaderboard.",
  },
  {
    question: "How do I register for an account?",
    answer:
      "Click the 'Register' button in the top navigation menu, enter your player username, valid email, and Free Fire In-Game UID. Once verified, you can immediately explore available custom rooms and start competing.",
  },
  {
    question: "Can beginners participate in custom rooms?",
    answer:
      "Absolutely! We host rooms catered to all skill levels, from grassroots beginner rooms to elite high-stakes squad tournaments. Beginners can build their skills, track their Kill/Death (K/D) ratio, and earn cash while competing.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
      {/* Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          alt="Titan Arena Gaming Esports Background"
          aria-hidden="true"
          src="/card2.jpg"
        />
        <ParticleCanvas count={60} />
      </div>

      {/* Hero Header */}
      <section className="pt-36 pb-12 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          Help &amp; Knowledge Base
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-6">
          Frequently Asked Questions
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Everything you need to know about joining custom rooms, tournament rules, prize distribution, and anti-cheat policies on Titan Arena Gaming.
        </p>
      </section>

      {/* FAQ Items */}
      <section className="px-6 max-w-[1000px] w-full mx-auto pb-24">
        <div className="space-y-6">
          {FAQS.map((faq, idx) => (
            <article
              key={idx}
              className="glass p-8 rounded-2xl border-t-2 border-white/10 hover:border-crimson/50 transition-colors duration-200"
            >
              <h2 className="font-sora text-xl font-bold text-on-surface mb-3">
                {faq.question}
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
