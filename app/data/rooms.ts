export type RoomType = "SOLO" | "DUO" | "SQUAD";

export interface Room {
  id: number;
  name: string;
  type: RoomType;
  prizePool: string;
  entryFee: string;
  mapLabel: string;
  /** Public image path for the card */
  image: string;
  /** Tailwind bg class for the badge */
  badgeBg: string;
  /** Tailwind text class for the badge */
  badgeText: string;
  /** Tailwind text class for the prize pool value */
  prizeColor: string;
}

const rooms: Room[] = [
  {
    id: 1,
    name: "Erangel Survival",
    type: "SOLO",
    prizePool: "$500",
    entryFee: "$5.00",
    mapLabel: "ERANGEL",
    image: "/card1.png",
    badgeBg: "bg-crimson",
    badgeText: "text-white",
    prizeColor: "text-secondary",
  },
  {
    id: 2,
    name: "Miramar Duo Cup",
    type: "DUO",
    prizePool: "$1,200",
    entryFee: "$10.00",
    mapLabel: "MIRAMAR",
    image: "/card2.jpg",
    badgeBg: "bg-secondary",
    badgeText: "text-[#462a00]",
    prizeColor: "text-secondary",
  },
  {
    id: 3,
    name: "Sanhok Blitz",
    type: "SQUAD",
    prizePool: "$2,500",
    entryFee: "$25.00",
    mapLabel: "SANHOK",
    image: "/card1.png",
    badgeBg: "bg-tertiary",
    badgeText: "text-[#4c3f00]",
    prizeColor: "text-secondary",
  },
];

export default rooms;
