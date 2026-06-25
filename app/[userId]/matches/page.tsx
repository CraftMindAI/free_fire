import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import MatchDetailsClient from "./MatchDetailsClient";

// Infer matchType from maxPlayers since DB column not yet migrated
function inferMatchType(maxPlayers: number): string {
  if (maxPlayers <= 12) return "Squad";
  if (maxPlayers <= 24) return "Duo";
  return "Solo";
}

async function getRooms() {
  const now = new Date();
  // Auto-close rooms whose endTime is in the past
  await prisma.room.updateMany({
    where: {
      endTime: { lt: now },
      status: { not: { in: ["closed", "completed"] } },
    },
    data: { status: "closed" },
  });

  const rooms = await prisma.room.findMany();

  return rooms.map((r) => ({
    roomId: String(r.id),
    name: r.roomName,
    map: r.roomName,
    map_img: r.map_img,
    matchType: inferMatchType(r.maxPlayers),
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
  const closedRoomsCount = rooms.filter((r) => r.status === "closed" || r.status === "completed").length;

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
