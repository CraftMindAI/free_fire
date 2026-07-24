import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import { getSessionUser } from "@/app/lib/auth";
import MyMatchesClient from "./MyMatchesClient";

interface MyMatchesPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function MyMatchesPage({ params }: MyMatchesPageProps) {
  const { userId } = await params;

  // Validate session
  const user = await getSessionUser();
  if (!user) {
    redirect("/v1/auth/login");
  }

  // Only players can access this route
  if (user.role.toLowerCase() !== "player") {
    redirect(`/profile/v2/dashboard/${encryptId(String(user.id))}/home`);
  }

  // Decrypt URL parameter to ensure authorization
  const decodedId = decryptId(userId);

  // Validate the decrypted ID matches the logged-in user
  if (user.id !== decodedId) {
    redirect(`/profile/v1/${encryptId(String(user.id))}/my-matches`);
  }

  const numericUserId = parseInt(decodedId || "", 10);
  if (isNaN(numericUserId)) {
    redirect(`/profile/v1/${encryptId(String(user.id))}/dashboard/home`);
  }

  // Fetch full user details
  const fullUser = await prisma.user.findUnique({
    where: { id: numericUserId }
  });

  const clientUser = {
    ...user,
    id: userId,
    player_id: fullUser?.player_id || "",
    profile_img: fullUser?.profile_img || ""
  };

  // Fetch user's bookings with room details and all bookings for those rooms (for seat layout preview)
  const bookings = await prisma.booking.findMany({
    where: { userId: numericUserId },
    include: {
      room: {
        include: {
          bookings: {
            where: { status: "confirmed" },
            select: { seatNumber: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Group and serialize bookings by roomId
  const groupedBookingsMap: Record<number, any> = {};

  for (const b of bookings) {
    const rId = b.room.id;
    if (!groupedBookingsMap[rId]) {
      const allBookedSeats = b.room.bookings.map((rb) => rb.seatNumber);
      groupedBookingsMap[rId] = {
        id: String(b.id),
        roomId: b.room.id,
        roomCode: `#RT-${String(b.room.id).padStart(4, "0")}`,
        roomName: b.room.roomName,
        map_img: b.room.map_img || undefined,
        matchType: b.room.match_type,
        entryFee: b.room.entry_fee,
        prizePool: b.room.total_price,
        startTime: b.room.startTime ? b.room.startTime.toISOString() : null,
        roomStatus: b.room.status,
        bookingStatus: b.status,
        bookedSeats: allBookedSeats,
        seats: [b.seatNumber],
      };
    } else {
      groupedBookingsMap[rId].seats.push(b.seatNumber);
      if (b.status === "confirmed") {
        groupedBookingsMap[rId].bookingStatus = "confirmed";
      }
    }
  }

  // Convert to array and sort seat numbers
  const bookingsData = Object.values(groupedBookingsMap).map((item: any) => {
    item.seats.sort((a: number, b: number) => a - b);
    return item;
  });

  return (
    <MyMatchesClient
      user={clientUser}
      bookings={bookingsData}
    />
  );
}
