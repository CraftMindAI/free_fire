import prisma from "@/app/lib/prisma";
import { encryptId } from "@/app/lib/encryption";
import { requireAdminMatch } from "@/app/lib/adminGuard";
import DashboardClient from "./DashboardClient";
async function getRooms() {
  const rooms = await prisma.room.findMany();

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
    status: r.status,
    isPublished: r.status === "active",
    tier: "Legendary",
    icon: "sports_esports",
  }));
}


async function getStats(roomsCount: number) {
  const playerUsersCount = await prisma.user.count({
    where: { role: "player" },
  });

  // Aggregate real payment totals from the payments table
  const paymentSums = await prisma.payment.aggregate({
    _sum: {
      amount: true,
      prizeAmount: true,
    },
  });

  const rawReceivedAmount = paymentSums._sum.amount || 0;
  const rawPrizePaid = paymentSums._sum.prizeAmount || 0;

  const formattedReceived = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rawReceivedAmount);

  const formattedPrize = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rawPrizePaid);

  return {
    activeRooms: roomsCount,
    playerCount: playerUsersCount,
    totalReceived: formattedReceived,
    totalPrizePaid: formattedPrize,
  };
}

export default async function DashboardPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;

  const user = await requireAdminMatch(userId);

  const rooms = await getRooms();
  const activeRoomsCount = rooms.filter((r) => r.isPublished).length;
  const stats = await getStats(activeRoomsCount);

  return (
    <DashboardClient
      user={user}
      initialStats={stats}
      initialRooms={rooms}
      encryptedUserId={encryptId(String(user.id))}
    />
  );
}
