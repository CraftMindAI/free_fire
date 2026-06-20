import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import { getDb1, getDb2 } from "@/app/lib/mongodb";
import MatchDetailsClient from "./MatchDetailsClient";

const SEED_ROOMS = [
  {
    roomId: "#RT-0982",
    name: "Cyber-Grid 9",
    map: "Cyber-Grid 9",
    matchType: "Battle Royale (Squad)",
    entryFee: 50,
    prizePool: 5000,
    playersCount: 100,
    maxPlayers: 100,
    matchDate: "Oct 24, 2023",
    matchTime: "18:00 UTC",
    status: "Published",
    isPublished: true,
    tier: "Legendary",
    icon: "sports_esports",
    createdAt: new Date(),
  },
  {
    roomId: "#RT-1004",
    name: "Neon Canyon Duel",
    map: "Neon Canyon",
    matchType: "1v1 Duel",
    entryFee: 10,
    prizePool: 200,
    playersCount: 0,
    maxPlayers: 2,
    matchDate: "Oct 26, 2023",
    matchTime: "21:30 UTC",
    status: "DRAFT",
    isPublished: false,
    tier: "Elite",
    icon: "security",
    createdAt: new Date(),
  },
  {
    roomId: "#RT-1102",
    name: "Dust 2.5 Core",
    map: "Dust 2.5",
    matchType: "Capture the Core",
    entryFee: 25,
    prizePool: 1200,
    playersCount: 0,
    maxPlayers: 10,
    matchDate: "Oct 27, 2023",
    matchTime: "04:00 UTC",
    status: "DRAFT",
    isPublished: false,
    tier: "Elite",
    icon: "settings_accessibility",
    createdAt: new Date(),
  },
];

async function getRooms() {
  let roomsColl;
  try {
    const db2 = await getDb2();
    roomsColl = db2.collection("rooms");
  } catch {
    const db1 = await getDb1();
    roomsColl = db1.collection("rooms");
  }

  let rooms = await roomsColl.find({}).toArray();

  if (rooms.length === 0) {
    await roomsColl.insertMany(SEED_ROOMS);
    rooms = await roomsColl.find({}).toArray();
  }

  return rooms.map((r) => ({
    roomId: r.roomId,
    name: r.name,
    map: r.map,
    matchType: r.matchType || "Battle Royale (Squad)",
    entryFee: r.entryFee || 0,
    prizePool: r.prizePool || 0,
    playersCount: r.playersCount || 0,
    maxPlayers: r.maxPlayers || 100,
    matchDate: r.matchDate || "",
    matchTime: r.matchTime || "",
    status: r.status,
    isPublished: r.isPublished,
    tier: r.tier,
    icon: r.icon,
  }));
}

export default async function MatchDetailsPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;

  const user = await getSessionUser();

  // If no user session, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Double check authorization: must be Admin
  if (user.role.toLowerCase() !== "admin") {
    redirect("/dashboard/player/home");
  }

  const rooms = await getRooms();
  const activeRoomsCount = rooms.filter((r) => r.isPublished).length;
  const draftRoomsCount = rooms.filter((r) => r.status === "DRAFT").length;
  const closedRoomsCount = rooms.filter((r) => r.status === "Closed").length || 84;

  const stats = {
    activeRooms: activeRoomsCount,
    draftRooms: draftRoomsCount,
    closedRooms: closedRoomsCount,
  };

  return (
    <MatchDetailsClient
      user={user}
      initialRooms={rooms}
      initialStats={stats}
    />
  );
}
