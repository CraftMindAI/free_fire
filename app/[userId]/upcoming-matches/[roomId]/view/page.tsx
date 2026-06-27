import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import MatchDetailsClient from "./MatchDetailsClient";

export default async function MatchDetailsPage(props: {
  params: Promise<{ userId: string; roomId: string }>;
}) {
  const { userId, roomId } = await props.params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/v1/auth/login");
  }

  const decodedId = decryptId(userId);

  // Ensure user can only see their own pages
  if (user.id !== decodedId && user.role.toLowerCase() !== "admin") {
    redirect(`/${encryptId(String(user.id))}/upcoming-matches`);
  }

  const clientUser = { ...user, id: userId };

  const decodedRoomId = decryptId(roomId);
  const numericRoomId = decodedRoomId ? parseInt(decodedRoomId, 10) : NaN;

  if (isNaN(numericRoomId)) {
    redirect(`/${encryptId(String(user.id))}/upcoming-matches`);
  }

  const room = await prisma.room.findUnique({
    where: { id: numericRoomId },
  });

  if (!room) {
    // Or you could render a friendly "Match not found" page
    redirect(`/${userId}/upcoming-matches`);
  }

  const roomData = {
    roomId: String(room.id),
    name: room.roomName,
    map: room.roomName,
    map_img: room.map_img || undefined,
    matchType: room.match_type ? `Battle Royale (${room.match_type})` : room.maxPlayers === 48 ? "Battle Royale (Solo)" : room.maxPlayers === 24 ? "Battle Royale (Duo)" : "Battle Royale (Squad)",
    entryFee: room.entry_fee || 0,
    prizePool: room.total_price || 0,
    playersCount: room.currentPlayers,
    maxPlayers: room.maxPlayers,
    matchDate: room.startTime?.toLocaleDateString() || "",
    matchTime: room.startTime?.toLocaleTimeString() || "",
    matchDateIso: room.startTime?.toISOString() || "",
    status: room.status,
    isPublished: room.status === "active",
    tier: "Legendary",
    icon: "sports_esports",
  };

  return <MatchDetailsClient user={clientUser} room={roomData} />;
}
