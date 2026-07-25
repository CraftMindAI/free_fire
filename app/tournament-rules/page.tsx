import type { Metadata } from "next";
import ParticleCanvas from "@/app/components/ParticleCanvas";

export const metadata: Metadata = {
  title: "Official Tournament Rules & Fair Play Policy | Titan Arena Gaming",
  description:
    "Review the official Free Fire tournament rules, eligibility criteria, anti-cheat policy, disqualification guidelines, and prize distribution rules on Titan Arena Gaming.",
  alternates: {
    canonical: "https://titanareanagaming.com/tournament-rules",
  },
  openGraph: {
    title: "Official Tournament Rules & Fair Play Policy | Titan Arena Gaming",
    description:
      "Review the official Free Fire tournament rules, eligibility criteria, anti-cheat policy, disqualification guidelines, and prize distribution rules on Titan Arena Gaming.",
    url: "https://titanareanagaming.com/tournament-rules",
    siteName: "Titan Arena Gaming",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Titan Arena Gaming Tournament Rules",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tournament Rules | Titan Arena Gaming",
    description:
      "Read fair play guidelines, anti-cheat enforcement, and scoring rules for Free Fire custom rooms.",
    images: ["/favicon.ico"],
  },
  keywords: [
    "Free Fire Tournament Rules",
    "Titan Arena Fair Play Policy",
    "Free Fire Anti-Cheat Rules",
    "Custom Room Disqualification Rules",
    "Free Fire Points Table Rules",
    "Free Fire Prize Payout Policy",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Official Tournament Rules & Fair Play Policy | Titan Arena Gaming",
  "url": "https://titanareanagaming.com/tournament-rules",
  "description":
    "Official tournament rules, anti-cheat policies, scoring points tables, and prize payout terms for Free Fire custom rooms.",
};

const RULE_SECTIONS = [
  {
    title: "1. Eligibility & Player Requirements",
    rules: [
      "Players must hold a valid Free Fire In-Game UID and be registered on Titan Arena Gaming.",
      "Players must join using the registered UID listed on their profile. Mismatched UIDs will result in automatic kick without refund.",
      "Players must join the custom room within the allocated 10-minute lobby window before match start time.",
    ],
  },
  {
    title: "2. Fair Play & Anti-Cheat Policy",
    rules: [
      "Strict zero-tolerance policy for hacks, scripts, aimbots, wallhacks, or modified APKs.",
      "Teaming or collusion between opposing solos, duos, or squads is strictly prohibited.",
      "Emulators are only allowed in designated 'Emulator Supported' custom rooms. Joining touch-only rooms with an emulator will lead to instant ban.",
      "Matches are recorded by official spectating referees and verified through automated kill-feed logs.",
    ],
  },
  {
    title: "3. Points Table & Scoring System",
    rules: [
      "Placement points follow official esports standings (1st Place / Booyah: 12 pts, 2nd: 9 pts, 3rd: 8 pts, 4th: 7 pts, etc.).",
      "Each verified kill awards +1 kill point to the squad/player score.",
      "Tie-breakers are decided based on total kills first, followed by placement rank.",
    ],
  },
  {
    title: "4. Disqualification & Penalties",
    rules: [
      "Any player violating anti-cheat policies will be permanently banned and all prize earnings forfeited.",
      "Abusive behavior or harassment towards match referees or players in custom room chat leads to account suspension.",
      "Intentional disconnects or room slot stealing will result in room disqualification.",
    ],
  },
  {
    title: "5. Prize Distribution & Payouts",
    rules: [
      "Prize amounts are credited to the winning player's wallet balance after match score validation (usually within 15–30 minutes).",
      "Disputed match results must be submitted via Support within 1 hour of match completion with screenshot/video evidence.",
      "Cash withdrawals are processed via UPI, Bank Transfer, or Crypto instantly once requested.",
    ],
  },
];

export default function TournamentRulesPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
      {/* Schema.org WebPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/80 to-[#131313]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          alt="Titan Arena Gaming Esports Rules Background"
          aria-hidden="true"
          src="/card2.jpg"
        />
        <ParticleCanvas count={60} />
      </div>

      {/* Header */}
      <section className="pt-36 pb-12 px-6 max-w-[1440px] w-full mx-auto text-center">
        <span className="font-orbitron text-[#ffb4ab] text-xs font-bold tracking-[0.3em] uppercase">
          Competitive Guidelines
        </span>
        <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-wide mt-4 mb-6">
          Official Tournament Rules
        </h1>
        <p className="max-w-2xl mx-auto text-on-surface-variant text-base md:text-lg leading-relaxed">
          Standardized competition rules, fair play guidelines, anti-cheat enforcement, and scoring criteria for all Free Fire custom room matches hosted on Titan Arena Gaming.
        </p>
      </section>

      {/* Rules Sections */}
      <section className="px-6 max-w-[1000px] w-full mx-auto pb-24 space-y-8">
        {RULE_SECTIONS.map((section, idx) => (
          <article
            key={idx}
            className="glass p-8 md:p-10 rounded-2xl border-t-4 border-crimson"
          >
            <h2 className="font-sora text-2xl font-bold text-on-surface mb-6">
              {section.title}
            </h2>
            <ul className="space-y-4">
              {section.rules.map((rule, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-crimson text-lg mt-0.5 shrink-0">
                    check_circle
                  </span>
                  <span className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
