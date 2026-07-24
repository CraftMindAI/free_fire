import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import { requireAdminMatch } from "@/app/lib/adminGuard";
import ViewDetailsClient from "./ViewDetailsClient";

interface ViewDetailsPageProps {
  params: Promise<{
    userId: string;
    roomId: string;
  }>;
}

export default async function ViewDetailsPage({ params }: ViewDetailsPageProps) {
  const { userId, roomId } = await params;

  const user = await requireAdminMatch(userId);

  const clientUser = {
    ...user,
    id: userId
  };

  // Decrypt Room ID (could be encrypted or raw numeric)
  let numericRoomId = parseInt(roomId, 10);
  if (isNaN(numericRoomId)) {
    const decodedRoomId = decryptId(roomId);
    numericRoomId = decodedRoomId ? parseInt(decodedRoomId, 10) : NaN;
  }

  if (isNaN(numericRoomId)) {
    redirect(`/profile/v2/${userId}/matches`);
  }

  // Fetch the room and its confirmed bookings
  const room = await prisma.room.findUnique({
    where: { id: numericRoomId },
    include: {
      bookings: {
        where: { status: "confirmed" },
        select: { seatNumber: true }
      }
    }
  });

  if (!room) {
    redirect(`/profile/v2/${userId}/matches`);
  }

  const bookedSeats = room.bookings.map(b => b.seatNumber);

  // Normalize room data
  const roomData = {
    roomId: String(room.id),
    name: room.roomName,
    map: room.roomName,
    map_img: room.map_img || undefined,
    matchType: room.match_type,
    maxPlayers: room.maxPlayers,
    playersCount: room.currentPlayers,
    entryFee: room.entry_fee,
    prizePool: room.total_price,
    status: room.status,
    isPublished: room.status === "active",
    tier: "Legendary",
    matchDate: room.startTime?.toLocaleDateString() || "",
    matchTime: room.startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) || "",
    matchDateIso: room.startTime?.toISOString() || "",
    encryptedRoomId: encryptId(String(room.id)),
  };

  return <ViewDetailsClient user={clientUser} room={roomData} bookedSeats={bookedSeats} />;
}
