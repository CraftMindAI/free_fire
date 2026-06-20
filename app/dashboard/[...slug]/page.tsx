import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import { getDb1, getDb2 } from "@/app/lib/mongodb";
import DashboardClient from "./DashboardClient";
import PlayerDashboardClient from "./PlayerDashboardClient";

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

async function getPublishedRooms() {
  let roomsColl;
  try {
    const db2 = await getDb2();
    roomsColl = db2.collection("rooms");
  } catch {
    const db1 = await getDb1();
    roomsColl = db1.collection("rooms");
  }

  const rooms = await roomsColl.find({ isPublished: true }).toArray();

  if (rooms.length === 0) {
    // Seed and find published
    await roomsColl.insertMany(SEED_ROOMS);
    const seeded = await roomsColl.find({ isPublished: true }).toArray();
    return seeded.map((r) => ({
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

async function getStats(roomsCount: number) {
  let usersColl;
  try {
    const db2 = await getDb2();
    usersColl = db2.collection("users");
  } catch {
    const db1 = await getDb1();
    usersColl = db1.collection("users");
  }

  const playerUsersCount = await usersColl.countDocuments({ role: "player" });
  const rawReceivedAmount = 482500;
  const rawPrizePaid = 430100;

  const formattedReceived = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rawReceivedAmount);

  const formattedPrize = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rawPrizePaid);

  return {
    activeRooms: roomsCount,
    playerCount: playerUsersCount,
    totalReceived: formattedReceived,
    totalPrizePaid: formattedPrize,
  };
}

export default async function DashboardPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await props.params;

  const user = await getSessionUser();

  // If no user session, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Handle routing based on route depth/structure
  // Admin route has 1 slug segment (e.g. /dashboard/[admin_id])
  // Player route has 2 slug segments (e.g. /dashboard/[roleId]/[userId])
  if (slug.length === 1) {
    // Double check authorization: must be Admin to view the single-segment dashboard
    if (user.role.toLowerCase() !== "admin") {
      redirect("/dashboard/player/home");
    }

    const rooms = await getRooms();
    const activeRoomsCount = rooms.filter((r) => r.isPublished).length;
    const stats = await getStats(activeRoomsCount);

    return (
      <DashboardClient
        user={user}
        initialStats={stats}
        initialRooms={rooms}
      />
    );
  } else {
    const activeRooms = await getPublishedRooms();

    return (
      <PlayerDashboardClient
        user={user}
        initialRooms={activeRooms}
      />
    );
  }
}
