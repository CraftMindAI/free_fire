import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import DistributionClient from "./DistributionClient";

async function getPublishedRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: "active" },
  });

  return rooms.map((r) => ({
    roomId: `#RT-${r.id}`,
    name: r.roomName,
    map: r.roomName,
    matchType: r.match_type ? `Battle Royale (${r.match_type})` : r.maxPlayers === 48 ? "Battle Royale (Solo)" : r.maxPlayers === 24 ? "Battle Royale (Duo)" : "Battle Royale (Squad)",
    entryFee: r.entry_fee || 0,
    prizePool: r.total_price || 0,
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
    redirect("/v1/auth/login");
  }

  // Double check authorization: must be Admin
  const decodedId = decryptId(userId);

  if (user.id !== decodedId && user.role.toLowerCase() !== "admin") {
    redirect(`/${encryptId(String(user.id))}/distribution`);
  }

  const clientUser = { ...user, id: userId };

  const rooms = await getPublishedRooms();

  return (
    <DistributionClient
      user={clientUser}
      initialRooms={rooms}
    />
  );
}
