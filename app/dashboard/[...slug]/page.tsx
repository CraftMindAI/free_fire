import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import DashboardClient from "./DashboardClient";
import PlayerDashboardClient from "./PlayerDashboardClient";

async function getRooms() {
  const rooms = await prisma.room.findMany();

  return rooms.map((r) => ({
    roomId: `#RT-${r.id}`,
    name: r.roomName,
    map: r.roomName,
    matchType: "Battle Royale (Squad)",
    entryFee: 50,
    prizePool: 5000,
    playersCount: r.currentPlayers,
    maxPlayers: r.maxPlayers,
    matchDate: r.startTime?.toLocaleDateString() || "",
    matchTime: r.startTime?.toLocaleTimeString() || "",
    status: r.status,
    isPublished: r.status === "active",
    tier: "Legendary",
    icon: "sports_esports",
  }));
}

async function getPublishedRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: "active" },
  });

  return rooms.map((r) => ({
    roomId: `#RT-${r.id}`,
    name: r.roomName,
    map: r.roomName,
    matchType: "Battle Royale (Squad)",
    entryFee: 50,
    prizePool: 5000,
    playersCount: r.currentPlayers,
    maxPlayers: r.maxPlayers,
    matchDate: r.startTime?.toLocaleDateString() || "",
    matchTime: r.startTime?.toLocaleTimeString() || "",
    status: r.status,
    isPublished: r.status === "active",
    tier: "Legendary",
    icon: "sports_esports",
  }));
}

async function getStats(roomsCount: number) {
  const playerUsersCount = await prisma.user.count({
    where: { role: "player" },
  });

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
