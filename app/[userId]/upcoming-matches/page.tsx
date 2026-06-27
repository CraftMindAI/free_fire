import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import UpcomingMatchesClient from "./UpcomingMatchesClient";

async function getPublishedRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: "active" },
  });

  return rooms.map((r) => ({
    roomId: String(r.id),
    name: r.roomName,
    map: r.roomName,
    map_img: r.map_img || undefined,
    matchType: r.match_type ? `Battle Royale (${r.match_type})` : r.maxPlayers === 48 ? "Battle Royale (Solo)" : r.maxPlayers === 24 ? "Battle Royale (Duo)" : "Battle Royale (Squad)",
    entryFee: r.entry_fee || 0,
    prizePool: r.total_price || 0,
    playersCount: r.currentPlayers,
    maxPlayers: r.maxPlayers,
    matchDate: r.startTime?.toLocaleDateString() || "",
    matchTime: r.startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) || "",
    matchDateIso: r.startTime?.toISOString() || "",
    encryptedRoomId: encryptId(String(r.id)),
    status: r.status,
    isPublished: r.status === "active",
    tier: "Legendary",
    icon: "sports_esports",
  }));
}

export default async function UpcomingMatchesPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/v1/auth/login");
  }

  const decodedId = decryptId(userId);

  // Ensure user can only see their own upcoming matches
  if (user.id !== decodedId && user.role.toLowerCase() !== "admin") {
    redirect(`/${encryptId(String(user.id))}/upcoming-matches`);
  }

  const clientUser = { ...user, id: userId };

  const activeRooms = await getPublishedRooms();

  return (
    <UpcomingMatchesClient
      user={clientUser}
      initialRooms={activeRooms}
    />
  );
}
