import prisma from "@/app/lib/prisma";
import { getBookingGroupsByRoom } from "@/app/lib/bookingGroups";
import { requireAdminMatch } from "@/app/lib/adminGuard";
import DistributionClient from "./DistributionClient";

export interface TransactionRecord {
  id: number;
  userId: number;
  username: string;
  player_id: string;
  playerIds: string[];
  userFormatted: string;
  roomId: number;
  roomName: string;
  amount: number;
  prizeAmount: number;
  status: string;
  distributionStatus: string;
  paymentMethod: string;
  reason: string;
  updatedAt: string;
}

async function getPendingClosedRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: "closed", payment_status: "pending" },
  });

  return rooms.map((r) => ({
    roomId: `#RT-${r.id}`,
    dbId: r.id,
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
    paymentStatus: r.payment_status,
    tier: "Legendary",
    icon: "sports_esports",
  }));
}

async function getAllDistributionTransactions(): Promise<TransactionRecord[]> {
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          player_id: true,
          email: true,
        },
      },
      room: {
        select: {
          id: true,
          roomName: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const roomIds = Array.from(new Set(payments.map((p) => p.roomId)));
  const bookingGroupsByRoomMap = new Map<number, any[]>();

  for (const rId of roomIds) {
    const groups = await getBookingGroupsByRoom(rId);
    bookingGroupsByRoomMap.set(rId, groups);
  }

  return payments.map((p) => {
    const roomGroups = bookingGroupsByRoomMap.get(p.roomId) || [];
    const userGroup = roomGroups.find((g) => g.userId === p.userId);
    const playerIds = userGroup && userGroup.playerIds.length > 0 
      ? userGroup.playerIds 
      : [p.user?.player_id || "N/A"];

    return {
      id: p.id,
      userId: p.userId,
      username: p.user?.username || `User_${p.userId}`,
      player_id: p.user?.player_id || "",
      playerIds: playerIds,
      userFormatted: `User #${p.userId} (${p.user?.username || `User_${p.userId}`}) - ${playerIds.join(", ")}`,
      roomId: p.roomId,
      roomName: p.room?.roomName || `Room #${p.roomId}`,
      amount: p.amount,
      prizeAmount: p.prizeAmount,
      status: p.status,
      distributionStatus: p.distributionStatus,
      paymentMethod: userGroup?.upiId ? `UPI (${userGroup.upiId})` : userGroup?.gpay ? `GPay (${userGroup.gpay})` : "N/A",
      reason: p.distributionStatus === "Success" 
        ? `Paid via ${userGroup?.upiId ? "UPI" : userGroup?.gpay ? "GPay" : "Direct Transfer"}`
        : p.distributionStatus === "Error"
        ? "No UPI or GPay payment details attached to booking"
        : "Distribution pending",
      updatedAt: p.updatedAt.toISOString(),
    };
  });
}

export default async function DistributionPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;

  const user = await requireAdminMatch(userId);

  const clientUser = { ...user, id: userId };

  const rooms = await getPendingClosedRooms();
  const initialTransactions = await getAllDistributionTransactions();

  return (
    <DistributionClient
      user={clientUser}
      initialRooms={rooms}
      initialTransactions={initialTransactions}
    />
  );
}

