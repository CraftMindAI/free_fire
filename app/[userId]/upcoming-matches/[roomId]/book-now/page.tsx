import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import { getSessionUser } from "@/app/lib/auth";
import BookNowClient from "./BookNowClient";

interface BookNowPageProps {
  params: Promise<{
    userId: string;
    roomId: string;
  }>;
}

export default async function BookNowPage({ params }: BookNowPageProps) {
  const { userId, roomId } = await params;

  // Validate session
  const user = await getSessionUser();
  if (!user) {
    redirect("/v1/auth/login");
  }

  // Decrypt URL parameter to ensure authorization
  const decodedId = decryptId(userId);

  // Validate the decrypted ID matches the logged-in user
  if (user.id !== decodedId && user.role.toLowerCase() !== "admin") {
    redirect(`/${encryptId(String(user.id))}/upcoming-matches`);
  }

  // Fetch full user to pass extra details
  const fullUser = await prisma.user.findUnique({
    where: { id: parseInt(String(user.id), 10) }
  });

  const clientUser = { 
    ...user, 
    id: userId,
    player_id: fullUser?.player_id || "",
    whatsapp: fullUser?.whatsapp || "",
    phone: fullUser?.phone || ""
  };

  // Decrypt Room ID
  const decodedRoomId = decryptId(roomId);
  const numericRoomId = decodedRoomId ? parseInt(decodedRoomId, 10) : NaN;

  if (isNaN(numericRoomId)) {
    redirect(`/${encryptId(String(user.id))}/upcoming-matches`);
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
    redirect(`/${encryptId(String(user.id))}/upcoming-matches`);
  }

  const bookedSeats = room.bookings.map(b => b.seatNumber);

  // Normalize room data
  const roomData = {
    roomId: String(room.id),
    name: room.roomName,
    map: room.roomName, // Usually mapping name to map is fine unless there's a specific map field
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

  return <BookNowClient user={clientUser} room={roomData} bookedSeats={bookedSeats} />;
}
