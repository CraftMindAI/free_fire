import prisma from "@/app/lib/prisma";

export interface BookingGroup {
  userId: number;
  createdAt: Date;
  playerIds: string[];
  upiId: string | null;
  gpay: string | null;
}

// Every seat booked together in one request shares the same Confirmat_Id,
// so grouping by it reconstructs the original team/booking.
export async function getBookingGroupsByRoom(roomId: number): Promise<BookingGroup[]> {
  const bookings = await prisma.booking.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, BookingGroup>();
  for (const b of bookings) {
    const key = b.Confirmat_Id || `booking-${b.id}`;
    const group = groups.get(key);
    if (group) {
      group.playerIds.push(b.playerId);
      if (b.createdAt < group.createdAt) group.createdAt = b.createdAt;
      if (!group.upiId && b.upiId) group.upiId = b.upiId;
      if (!group.gpay && b.Gpay) group.gpay = b.Gpay;
    } else {
      groups.set(key, {
        userId: b.userId,
        createdAt: b.createdAt,
        playerIds: [b.playerId],
        upiId: b.upiId || null,
        gpay: b.Gpay || null,
      });
    }
  }
  return Array.from(groups.values());
}
