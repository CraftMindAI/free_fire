export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  /** Tailwind border-top color class */
  borderTop: string;
  /** Tailwind text color for icon */
  iconColor: string;
  /** Tailwind bg for icon wrapper */
  iconBg: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: "trophy",
    title: "Tournament Features",
    description:
      "Automated matchmaking, real-time stat tracking, and anti-cheat integration ensure a fair and professional competitive environment for all tiers.",
    tags: ["Auto-Match", "Anti-Cheat"],
    borderTop: "border-t-crimson",
    iconColor: "text-crimson",
    iconBg: "bg-crimson/10",
  },
  {
    id: 2,
    icon: "payments",
    title: "Prize Pools",
    description:
      "Competing for over $10,000 in monthly prizes. Instant withdrawals and cryptocurrency support for winners across the India.",
    tags: ["Daily Payouts", "Crypto Ready"],
    borderTop: "border-t-secondary",
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
  },
  {
    id: 3,
    icon: "gamepad",
    title: "Match Types",
    description:
      "From Solo Battle Royale to Squad-based Tactical missions, choose your path to glory in our diverse selection of custom game modes.",
    tags: ["1v1","Duels", "Squad Arena"],
    borderTop: "border-t-tertiary",
    iconColor: "text-tertiary",
    iconBg: "bg-tertiary/10",
  },
];

export default features;
