import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import DistributionClient from "./DistributionClient";

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

export default async function DistributionPage(props: {
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

  const rooms = await getPublishedRooms();

  return (
    <DistributionClient
      user={user}
      initialRooms={rooms}
    />
  );
}
