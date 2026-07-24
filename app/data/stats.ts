export interface Stat {
  id: number;
  value: string;
  label: string;
  description: string;
  accentColor: string;
  borderColor: string;
}

const stats: Stat[] = [
  {
    id: 1,
    value: "99.9%",
    label: "UPTIME SLAS",
    description:
      "Low-latency servers globally distributed for perfect, frame-precise competitive gameplay.",
    accentColor: "#ffcb8d",
    borderColor: "#ffcb8d",
  },
  {
    id: 2,
    value: "1K",
    label: "ACTIVE USERS",
    description:
      "Join the world's fastest growing gaming community and find matches within seconds.",
    accentColor: "#FF2E2E",
    borderColor: "#FF2E2E",
  },
];

export default stats;
