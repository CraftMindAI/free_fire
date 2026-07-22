import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import MatchDetailsClient from "./MatchDetailsClient";

// Infer matchType from maxPlayers since DB column not yet migrated
function inferMatchType(maxPlayers: number): string {
  if (maxPlayers <= 12) return "Squad";
  if (maxPlayers <= 24) return "Duo";
  return "Solo";
}

async function getRooms() {
  const rooms = await prisma.room.findMany();

  return rooms.map((r) => ({
    roomId: String(r.id),
    name: r.roomName,
    map: r.roomName,
    map_img: r.map_img || undefined,
    matchType: r.match_type ? `Battle Royale (${r.match_type})` : inferMatchType(r.maxPlayers),
    entryFee: r.entry_fee || 0,
    prizePool: r.total_price || 0,
    playersCount: r.currentPlayers,
    maxPlayers: r.maxPlayers,
    matchDate: r.startTime?.toLocaleDateString() || "",
    matchTime: r.startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) || "",
    matchDateIso: r.startTime?.toISOString() || "",
    endTimeIso: r.endTime?.toISOString() || "",
    encryptedRoomId: encryptId(String(r.id)),
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
    redirect("/v1/auth/login");
  }

  const decodedId = decryptId(userId);

  // Double check authorization: must be Admin
  if (user.role.toLowerCase() !== "admin") {
    redirect(`/${encryptId(String(user.id))}/dashboard/home`);
  }

  const clientUser = { ...user, id: userId };

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
      user={clientUser}
      initialRooms={rooms}
      initialStats={stats}
    />
  );
}
